import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelArbitroService, Partido, EventoPartido } from '../../../../shared/services/panel-arbitro.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-panel-arbitro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-arbitro.html',
  styleUrls: ['./panel-arbitro.css']
})
export class PanelArbitroComponent implements OnInit {
  // Señales
  partidosAsignados = signal<Partido[]>([]);
  partidoActual = signal<Partido | null>(null);
  eventos = signal<EventoPartido[]>([]);
  cargando = signal(false);
  jugadoresDisponibles = signal<any[]>([]);

  // Modal de evento
  modalEventoAbierto = signal(false);
  eventoTemporal: Partial<EventoPartido> = {};

  // Modal de finalización
  modalFinalizarAbierto = signal(false);
  notasArbitro = '';

  // Filtros
  filtroEstado = signal('programado');

  // Computados
  partidosHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const partidos = this.partidosAsignados().filter(p => {
      const fechaPartido = p.fecha_partido.split('T')[0];
      console.log('[ARBITRO] Comparando:', fechaPartido, 'con', hoy, '=', fechaPartido === hoy);
      return fechaPartido === hoy;
    });
    console.log('[ARBITRO] Hoy es:', hoy);
    console.log('[ARBITRO] Partidos de hoy:', partidos);
    return partidos;
  });

  partidosProximos = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return this.partidosAsignados().filter(p => p.fecha_partido.split('T')[0] > hoy);
  });

  partidosFinalizados = computed(() => {
    return this.partidosAsignados().filter(p => p.estado_partido === 'finalizado');
  });

  // Partidos filtrados según la pestaña seleccionada
  partidosFiltrados = computed(() => {
    const filtro = this.filtroEstado();
    if (filtro === 'todos') return this.partidosAsignados();
    return this.partidosAsignados().filter(p => p.estado_partido === filtro);
  });

  eventosPartido = computed(() => {
    return this.eventos();
  });

  constructor(
    private panelService: PanelArbitroService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.cargando.set(true);
    // Siempre cargar todos los partidos, la organización se hace en la vista
    const filtros = {};

    this.panelService.obtenerMisPartidos(filtros).subscribe({
      next: (response) => {
        console.log('[ARBITRO] Partidos recibidos:', response.data.length);
        console.log('[ARBITRO] Partidos:', response.data);
        this.partidosAsignados.set(response.data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
        this.notification.error('Error al cargar partidos asignados');
        this.cargando.set(false);
      }
    });
  }

  iniciarPartido(partido: Partido): void {
    // Usar SweetAlert2 para confirmar
    (window as any).Swal.fire({
      title: '¿Iniciar partido?',
      text: `${partido.equipo_local_nombre} vs ${partido.equipo_visitante_nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ECC71',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.panelService.iniciarPartido(partido.id_partido).subscribe({
          next: (response) => {
            (window as any).Swal.fire({
              title: '¡Éxito!',
              text: 'Partido iniciado exitosamente',
              icon: 'success',
              confirmButtonColor: '#2ECC71'
            });
            this.partidoActual.set(response.data);
            this.cargarEventos(partido.id_partido);
            this.cargarPartidos();
          },
          error: (error) => {
            console.error('Error al iniciar partido:', error);
            (window as any).Swal.fire({
              title: 'Error',
              text: error.error?.message || 'Error al iniciar partido',
              icon: 'error',
              confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }

  pausarPartido(): void {
    const partido = this.partidoActual();
    if (!partido) return;

    this.panelService.pausarPartido(partido.id_partido).subscribe({
      next: (response) => {
        (window as any).Swal.fire({
          title: 'Partido pausado',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        this.partidoActual.set(response.data);
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al pausar partido:', error);
        (window as any).Swal.fire({
          title: 'Error',
          text: error.error?.message || 'Error al pausar partido',
          icon: 'error',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  reanudarPartido(): void {
    const partido = this.partidoActual();
    if (!partido) return;

    this.panelService.reanudarPartido(partido.id_partido).subscribe({
      next: (response) => {
        (window as any).Swal.fire({
          title: 'Partido reanudado',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.partidoActual.set(response.data);
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al reanudar partido:', error);
        (window as any).Swal.fire({
          title: 'Error',
          text: error.error?.message || 'Error al reanudar partido',
          icon: 'error',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  abrirModalEvento(tipoEvento: string): void {
    const partido = this.partidoActual();
    if (!partido) return;

    this.eventoTemporal = {
      tipo_evento: tipoEvento,
      id_partido: partido.id_partido,
      minuto: undefined,
      periodo: 'primer_tiempo',
      valor_puntos: this.getValorPuntosPorTipo(tipoEvento)
    };
    this.jugadoresDisponibles.set([]);
    this.modalEventoAbierto.set(true);
  }

  registrarEvento(): void {
    const partido = this.partidoActual();
    if (!partido || !this.eventoTemporal.tipo_evento || !this.eventoTemporal.id_equipo) {
      (window as any).Swal.fire({
        title: 'Campos requeridos',
        text: 'Complete todos los campos requeridos',
        icon: 'warning',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    this.panelService.registrarEvento(partido.id_partido, this.eventoTemporal).subscribe({
      next: (response) => {
        (window as any).Swal.fire({
          title: 'Evento registrado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarEventos(partido.id_partido);
        this.cargarPartidos(); // Actualizar marcador
        this.cerrarModalEvento();

        // Actualizar partido actual con nuevo marcador
        const index = this.partidosAsignados().findIndex(p => p.id_partido === partido.id_partido);
        if (index !== -1) {
          this.partidoActual.set(this.partidosAsignados()[index]);
        }
      },
      error: (error) => {
        console.error('Error al registrar evento:', error);
        (window as any).Swal.fire({
          title: 'Error',
          text: error.error?.message || 'Error al registrar evento',
          icon: 'error',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  cargarEventos(idPartido: number): void {
    this.panelService.obtenerEventos(idPartido).subscribe({
      next: (response) => {
        this.eventos.set(response.data);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
      }
    });
  }

  abrirModalFinalizar(): void {
    this.notasArbitro = '';
    this.modalFinalizarAbierto.set(true);
  }

  finalizarPartido(): void {
    const partido = this.partidoActual();
    if (!partido) return;

    (window as any).Swal.fire({
      title: '¿Finalizar partido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.panelService.finalizarPartido(partido.id_partido, { notas_arbitro: this.notasArbitro }).subscribe({
          next: (response) => {
            (window as any).Swal.fire({
              title: '¡Finalizado!',
              text: 'Partido finalizado exitosamente',
              icon: 'success',
              confirmButtonColor: '#2ECC71'
            });
            this.partidoActual.set(null);
            this.eventos.set([]);
            this.cargarPartidos();
            this.cerrarModalFinalizar();
          },
          error: (error) => {
            console.error('Error al finalizar partido:', error);
            (window as any).Swal.fire({
              title: 'Error',
              text: error.error?.message || 'Error al finalizar partido',
              icon: 'error',
              confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }

  verPartido(partido: Partido): void {
    this.partidoActual.set(partido);
    this.cargarEventos(partido.id_partido);
  }

  cerrarPartidoActual(): void {
    this.partidoActual.set(null);
    this.eventos.set([]);
  }

  cerrarModalEvento(): void {
    this.modalEventoAbierto.set(false);
    this.eventoTemporal = {};
    this.jugadoresDisponibles.set([]);
  }

  cargarJugadoresEquipo(): void {
    const idEquipo = this.eventoTemporal.id_equipo;
    if (!idEquipo) {
      this.jugadoresDisponibles.set([]);
      return;
    }

    this.panelService.obtenerJugadoresEquipo(idEquipo).subscribe({
      next: (response) => {
        this.jugadoresDisponibles.set(response.data || []);
      },
      error: (error) => {
        console.error('Error al cargar jugadores:', error);
        this.jugadoresDisponibles.set([]);
      }
    });
  }

  cerrarModalFinalizar(): void {
    this.modalFinalizarAbierto.set(false);
    this.notasArbitro = '';
  }

  getValorPuntosPorTipo(tipoEvento: string): number {
    const valores: any = {
      'gol': 1,
      'penal': 1,
      'triple': 3,
      'doble': 2,
      'tiro_libre': 1,
      'tarjeta_amarilla': 0,
      'tarjeta_roja': 0,
      'falta': 0
    };
    return valores[tipoEvento] || 0;
  }

  getIconoEvento(tipoEvento: string): string {
    const iconos: any = {
      'gol': 'fa-futbol',
      'penal': 'fa-bullseye',
      'tarjeta_amarilla': 'fa-square',
      'tarjeta_roja': 'fa-square',
      'sustitucion': 'fa-exchange-alt',
      'lesion': 'fa-plus-circle',
      'triple': 'fa-basketball-ball',
      'doble': 'fa-basketball-ball',
      'tiro_libre': 'fa-basketball-ball',
      'falta': 'fa-exclamation-triangle',
      'otro': 'fa-ellipsis-h'
    };
    return iconos[tipoEvento] || 'fa-file-alt';
  }

  getColorEvento(tipoEvento: string): string {
    const colores: any = {
      'gol': '#27AE60',
      'penal': '#E67E22',
      'tarjeta_amarilla': '#F39C12',
      'tarjeta_roja': '#E74C3C',
      'triple': '#3498DB',
      'doble': '#27AE60',
      'falta': '#95A5A6'
    };
    return colores[tipoEvento] || '#7F8C8D';
  }

  formatearTipoEvento(tipo: string): string {
    if (!tipo) return '';
    // Reemplazar underscores por espacios y capitalizar cada palabra
    return tipo
      .replace(/_/g, ' ')
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  cambiarFiltro(nuevoFiltro: string): void {
    this.filtroEstado.set(nuevoFiltro);
    this.cargarPartidos();
  }
}
