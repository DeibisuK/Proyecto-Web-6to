import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TorneosAdminService, Torneo, FiltrosTorneo } from '../torneos.service';
import { NotificationService } from '@core/services/notification.service';
import { DeporteService } from '@shared/services/index';
import { Deporte } from '@shared/models/index';

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

  // Señales para dropdowns
  dropdownDeporteAbierto = signal<boolean>(false);
  dropdownEstadoAbierto = signal<boolean>(false);
  dropdownOrdenarAbierto = signal<boolean>(false);

  // Control del dropdown de estado en cada card
  dropdownEstadoTorneoId: number | null = null;

  deporteSeleccionado = signal<string>('Todos los deportes');
  estadoSeleccionado = signal<string>('Todos los estados');
  ordenarSeleccionado = signal<string>('Más recientes');

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
      ordenar: 'recientes'
    };
    this.cargarTorneos();
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

  // Métodos para dropdowns
  toggleDropdownDeporte(): void {
    this.dropdownDeporteAbierto.set(!this.dropdownDeporteAbierto());
    if (this.dropdownDeporteAbierto()) {
      this.dropdownEstadoAbierto.set(false);
      this.dropdownOrdenarAbierto.set(false);
    }
  }

  seleccionarDeporte(deporte: Deporte | null): void {
    if (deporte) {
      this.filtros.deporte = deporte.id_deporte;
      this.deporteSeleccionado.set(deporte.nombre_deporte);
    } else {
      this.filtros.deporte = undefined;
      this.deporteSeleccionado.set('Todos los deportes');
    }
    this.dropdownDeporteAbierto.set(false);
    this.aplicarFiltros();
  }

  toggleDropdownEstado(): void {
    this.dropdownEstadoAbierto.set(!this.dropdownEstadoAbierto());
    if (this.dropdownEstadoAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownOrdenarAbierto.set(false);
    }
  }

  seleccionarEstado(estado: { value: string; label: string }): void {
    this.filtros.estado = estado.value || undefined;
    this.estadoSeleccionado.set(estado.label);
    this.dropdownEstadoAbierto.set(false);
    this.aplicarFiltros();
  }

  toggleDropdownOrdenar(): void {
    this.dropdownOrdenarAbierto.set(!this.dropdownOrdenarAbierto());
    if (this.dropdownOrdenarAbierto()) {
      this.dropdownDeporteAbierto.set(false);
      this.dropdownEstadoAbierto.set(false);
    }
  }

  seleccionarOrden(opcion: { value: string; label: string }): void {
    this.filtros.ordenar = opcion.value;
    this.ordenarSeleccionado.set(opcion.label);
    this.dropdownOrdenarAbierto.set(false);
    this.aplicarFiltros();
  }

  configurarCierreDropdowns(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-deporte') &&
          !target.closest('.dropdown-estado') &&
          !target.closest('.dropdown-ordenar') &&
          !target.closest('.btn-dropdown')) {
        this.dropdownDeporteAbierto.set(false);
        this.dropdownEstadoAbierto.set(false);
        this.dropdownOrdenarAbierto.set(false);
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
    // Simulamos equipos participantes (en producción vendrían del backend)
    const cantidadEquipos = torneo.max_equipos || 8;
    const equipos = Array.from({ length: cantidadEquipos }, (_, i) => ({
      id: i + 1,
      nombre: `Equipo ${i + 1}`,
      seed: i + 1
    }));

    // Mezclar aleatoriamente para no tener preferencias
    const equiposMezclados = this.shuffleArray([...equipos]);

    // Calcular número de rondas
    const numRondas = Math.log2(cantidadEquipos);
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
}
