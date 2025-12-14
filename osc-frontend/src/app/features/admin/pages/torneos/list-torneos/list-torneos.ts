import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo, FiltrosTorneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';

// SweetAlert2 está cargado globalmente via CDN
declare const Swal: any;

@Component({
  selector: 'app-list-torneos',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-torneos.html',
  styleUrl: './list-torneos.css'
})
export class ListTorneos implements OnInit {
  torneos: Torneo[] = [];
  deportes: Deporte[] = [];
  cargando: boolean = true;

  // Control del dropdown de estado en cada card
  dropdownEstadoTorneoId: number | null = null;

  // Dropdowns de filtros
  dropdownDeporteAbierto = signal(false);
  dropdownEstadoAbierto = signal(false);
  deporteSeleccionado = signal('Todos los deportes');
  estadoSeleccionado = signal('Todos los estados');

  // Filtros
  filtros: FiltrosTorneo = {
    page: 1,
    limit: 10,
    ordenar: 'recientes'
  };

  // Paginación
  totalPages: number = 0;
  totalTorneos: number = 0;

  // Estados
  estadosPosibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_curso', label: 'En curso' },
    { value: 'cerrado', label: 'Cerrado' },
    { value: 'finalizado', label: 'Finalizado' }
  ];

  // Modal Bracket
  mostrarModalBracket = signal<boolean>(false);
  torneoSeleccionado: Torneo | null = null;
  bracket: any[] = [];
  cargandoBracket = signal<boolean>(false);

  // Ordenamiento
  opcionesOrden = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'fecha_asc', label: 'Fecha inicio (ascendente)' },
    { value: 'fecha_desc', label: 'Fecha inicio (descendente)' },
    { value: 'nombre', label: 'Nombre (A-Z)' },
    { value: 'inscritos', label: 'Más inscritos' }
  ];

  constructor(
    private torneosService: TorneosAdminService,
    private deporteService: DeporteService,
    private notificationService: NotificationService,
    private router: Router,
    private injector: Injector
  ) {
    afterNextRender(() => {
      this.configurarCierreDropdowns();
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.cargarDeportes();
    this.cargarTorneos();
  }

  cargarDeportes(): void {
    this.deporteService.getDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
      },
      error: (err) => {
        console.error('Error al cargar deportes:', err);
      }
    });
  }

  cargarTorneos(): void {
    this.cargando = true;
    this.torneosService.listarTorneos(this.filtros).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.torneos = response.data;

          if (response.pagination) {
            this.totalTorneos = response.pagination.total;
            this.totalPages = response.pagination.totalPages;
          }
        }
        this.cargando = false;
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'No se pudieron cargar los torneos',
          type: 'error'
        });
        console.error('Error al cargar torneos:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 1; // Reset a la primera página
    this.cargarTorneos();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.filtros.page = pagina;
      this.cargarTorneos();
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      page: 1,
      limit: 10,
      ordenar: 'recientes',
      busqueda: '',
      deporte: undefined,
      estado: undefined
    };
    this.deporteSeleccionado.set('Todos los deportes');
    this.estadoSeleccionado.set('Todos los estados');
    this.dropdownDeporteAbierto.set(false);
    this.dropdownEstadoAbierto.set(false);
    this.cargarTorneos();
  }

  toggleDropdownDeporte(): void {
    this.dropdownDeporteAbierto.update(val => !val);
    this.dropdownEstadoAbierto.set(false);
  }

  toggleDropdownEstado(): void {
    this.dropdownEstadoAbierto.update(val => !val);
    this.dropdownDeporteAbierto.set(false);
  }

  seleccionarDeporte(deporteId: number | undefined): void {
    this.filtros.deporte = deporteId;
    if (deporteId === undefined) {
      this.deporteSeleccionado.set('Todos los deportes');
    } else {
      const deporte = this.deportes.find(d => d.id_deporte === deporteId);
      this.deporteSeleccionado.set(deporte?.nombre_deporte || 'Todos los deportes');
    }
    this.dropdownDeporteAbierto.set(false);
    this.aplicarFiltros();
  }

  seleccionarEstado(estado: string | undefined): void {
    this.filtros.estado = estado;
    const estadoObj = this.estadosPosibles.find(e => (e.value || undefined) === (estado || undefined));
    this.estadoSeleccionado.set(estadoObj?.label || 'Todos los estados');
    this.dropdownEstadoAbierto.set(false);
    this.aplicarFiltros();
  }

  crearTorneo(): void {
    this.router.navigate(['/admin/crear-torneo']);
  }

  editarTorneo(torneo: Torneo): void {
    if (torneo.id_torneo) {
      this.router.navigate(['/admin/editar-torneo', torneo.id_torneo]);
    }
  }

  verEstadisticas(torneo: Torneo): void {
    if (torneo.id_torneo) {
      this.router.navigate(['/admin/torneos', torneo.id_torneo, 'estadisticas']);
    }
  }

  cambiarEstado(torneo: Torneo, nuevoEstado: string): void {
    if (!torneo.id_torneo) return;

    // Cerrar el dropdown
    this.dropdownEstadoTorneoId = null;

    const confirmacion = confirm(`¿Cambiar el estado del torneo "${torneo.nombre}" a "${nuevoEstado}"?`);

    if (confirmacion) {
      this.notificationService.notify({
        message: 'Cambiando estado...',
        type: 'loading'
      });

      this.torneosService.cambiarEstado(torneo.id_torneo, nuevoEstado).subscribe({
        next: (response) => {
          this.notificationService.notify({
            message: `Estado cambiado exitosamente a: ${nuevoEstado}`,
            type: 'success'
          });
          this.cargarTorneos();
        },
        error: (err) => {
          this.notificationService.notify({
            message: err.error?.message || 'Error al cambiar el estado',
            type: 'error'
          });
        }
      });
    }
  }

  eliminarTorneo(torneo: Torneo): void {
    if (!torneo.id_torneo) return;

    const confirmacion = confirm(
      `¿Estás seguro de eliminar el torneo "${torneo.nombre}"?\n\n` +
      `Esta acción no se puede deshacer y eliminará todas las fases, grupos y partidos asociados.`
    );

    if (confirmacion) {
      this.notificationService.notify({
        message: 'Eliminando torneo...',
        type: 'loading'
      });

      this.torneosService.eliminarTorneo(torneo.id_torneo).subscribe({
        next: (response) => {
          this.notificationService.notify({
            message: 'Torneo eliminado exitosamente',
            type: 'success'
          });
          this.cargarTorneos();
        },
        error: (err) => {
          this.notificationService.notify({
            message: err.error?.message || 'Error al eliminar el torneo',
            type: 'error'
          });
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'abierto': 'estado-abierto',
      'en_curso': 'estado-en-curso',
      'cerrado': 'estado-cerrado',
      'finalizado': 'estado-finalizado'
    };
    return clases[estado] || '';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'abierto': 'Abierto',
      'en_curso': 'En Curso',
      'cerrado': 'Cerrado',
      'finalizado': 'Finalizado'
    };
    return labels[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaginaNumeros(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, (this.filtros.page || 1) - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPages, inicio + maxPaginas - 1);

    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  configurarCierreDropdowns(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.btn-dropdown')) {
        this.dropdownEstadoTorneoId = null;
      }
    });
  }

  // Toggle dropdown de estado en cards de torneos
  toggleDropdownEstadoTorneo(event: Event, torneoId: number): void {
    event.stopPropagation();
    this.dropdownEstadoTorneoId = this.dropdownEstadoTorneoId === torneoId ? null : torneoId;
  }

  // Métodos para Bracket
  abrirModalBracket(torneo: Torneo): void {
    this.torneoSeleccionado = torneo;
    this.generarBracket(torneo);
    this.mostrarModalBracket.set(true);
  }

  cerrarModalBracket(): void {
    this.mostrarModalBracket.set(false);
    this.torneoSeleccionado = null;
    this.bracket = [];
  }

  generarBracket(torneo: Torneo): void {
    if (!torneo.id_torneo) {
      this.notificationService.notify({
        message: 'ID de torneo inválido',
        type: 'error'
      });
      return;
    }

    this.cargandoBracket.set(true);
    this.bracket = [];

    // Cargar equipos inscritos reales del backend
    this.torneosService.obtenerEquiposInscritosTorneo(torneo.id_torneo).subscribe({
      next: (equiposInscritos) => {
        if (equiposInscritos.length === 0) {
          this.notificationService.notify({
            message: 'No hay equipos inscritos en este torneo aún',
            type: 'default'
          });
          this.bracket = [];
          return;
        }

        // Usar equipos reales
        const equipos = equiposInscritos.map((eq, index) => ({
          id: eq.id_equipo,
          nombre: eq.nombre_equipo,
          logo: eq.logo_url,
          seed: index + 1
        }));

        // Calcular número de rondas basado en potencia de 2 más cercana
        const cantidadEquipos = Math.pow(2, Math.ceil(Math.log2(equipos.length)));
        const numRondas = Math.log2(cantidadEquipos);

        // Mezclar aleatoriamente para no tener preferencias
        const equiposMezclados: (typeof equipos[0] | null)[] = this.shuffleArray([...equipos]);

        // Rellenar con equipos TBD si es necesario
        while (equiposMezclados.length < cantidadEquipos) {
          equiposMezclados.push(null);
        }

        this.bracket = [];

        // Crear estructura de bracket
        for (let ronda = 0; ronda < numRondas; ronda++) {
          const partidosPorRonda = Math.pow(2, numRondas - ronda - 1);
          const rondaNombre = this.obtenerNombreRonda(ronda, numRondas);

          const partidos = [];
          for (let i = 0; i < partidosPorRonda; i++) {
            if (ronda === 0) {
              // Primera ronda: asignar equipos
              const equipo1 = equiposMezclados[i * 2];
              const equipo2 = equiposMezclados[i * 2 + 1];
              partidos.push({
                id: `r${ronda}-p${i}`,
                equipo1: equipo1,
                equipo2: equipo2,
                ganador: null
              });
            } else {
              // Rondas siguientes: esperar ganadores
              partidos.push({
                id: `r${ronda}-p${i}`,
                equipo1: null,
                equipo2: null,
                ganador: null
              });
            }
          }

          this.bracket.push({
            ronda: ronda,
            nombre: rondaNombre,
            partidos: partidos
          });
        }

        this.torneoSeleccionado = torneo;
        this.mostrarModalBracket.set(true);
        this.cargandoBracket.set(false);
      },
      error: (error) => {
        console.error('Error al cargar equipos inscritos:', error);
        this.notificationService.notify({
          message: 'Error al cargar equipos inscritos',
          type: 'error'
        });
        this.bracket = [];
        this.cargandoBracket.set(false);
      }
    });
  }

  obtenerNombreRonda(indiceRonda: number, totalRondas: number): string {
    const rondaDesdeElFinal = totalRondas - indiceRonda;
    if (rondaDesdeElFinal === 1) return 'Final';
    if (rondaDesdeElFinal === 2) return 'Semifinal';
    if (rondaDesdeElFinal === 3) return 'Cuartos';
    if (rondaDesdeElFinal === 4) return 'Octavos';
    return `Ronda ${indiceRonda + 1}`;
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generar calendario automático para un torneo
   */
  generarFixture(torneo: Torneo): void {
    Swal.fire({
      title: '¿Generar calendario de partidos?',
      html: `<p>Se creará automáticamente el calendario completo del torneo <strong>"${torneo.nombre}"</strong> con todos los partidos según los equipos inscritos.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.torneosService.generarFixture(torneo.id_torneo!).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Calendario generado!',
              text: `Se crearon ${response.data.partidosCreados} partidos exitosamente`,
              icon: 'success',
              confirmButtonText: 'Entendido'
            });
            // Recargar torneos para ver los partidos creados
            this.cargarTorneos();
          },
          error: (error) => {
            console.error('Error al generar calendario:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.message || 'No se pudo generar el calendario de partidos',
              icon: 'error',
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
  }
}
