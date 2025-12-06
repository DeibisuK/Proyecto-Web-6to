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
    return this.partidosAsignados().filter(p => p.fecha_partido === hoy);
  });

  partidosProximos = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return this.partidosAsignados().filter(p => p.fecha_partido > hoy);
  });

  partidosFinalizados = computed(() => {
    return this.partidosAsignados().filter(p => p.estado_partido === 'finalizado');
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
    const filtros = this.filtroEstado() !== 'todos' ? { estado: this.filtroEstado() } : {};

    this.panelService.obtenerMisPartidos(filtros).subscribe({
      next: (response) => {
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
    if (!confirm(`¿Iniciar el partido ${partido.equipo_local_nombre} vs ${partido.equipo_visitante_nombre}?`)) {
      return;
    }

    this.panelService.iniciarPartido(partido.id_partido).subscribe({
      next: (response) => {
        this.notification.success('Partido iniciado exitosamente');
        this.partidoActual.set(response.data);
        this.cargarEventos(partido.id_partido);
        this.cargarPartidos(); // Refrescar lista
      },
      error: (error) => {
        console.error('Error al iniciar partido:', error);
        this.notification.error(error.error?.message || 'Error al iniciar partido');
      }
    });
  }

  pausarPartido(): void {
    const partido = this.partidoActual();
    if (!partido) return;

    this.panelService.pausarPartido(partido.id_partido).subscribe({
      next: (response) => {
        this.notification.success('Partido pausado');
        this.partidoActual.set(response.data);
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al pausar partido:', error);
        this.notification.error(error.error?.message || 'Error al pausar partido');
      }
    });
  }

  reanudarPartido(): void {
    const partido = this.partidoActual();
    if (!partido) return;

    this.panelService.reanudarPartido(partido.id_partido).subscribe({
      next: (response) => {
        this.notification.success('Partido reanudado');
        this.partidoActual.set(response.data);
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al reanudar partido:', error);
        this.notification.error(error.error?.message || 'Error al reanudar partido');
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
    this.modalEventoAbierto.set(true);
  }

  registrarEvento(): void {
    const partido = this.partidoActual();
    if (!partido || !this.eventoTemporal.tipo_evento || !this.eventoTemporal.id_equipo) {
      this.notification.error('Complete todos los campos requeridos');
      return;
    }

    this.panelService.registrarEvento(partido.id_partido, this.eventoTemporal).subscribe({
      next: (response) => {
        this.notification.success('Evento registrado');
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
        this.notification.error(error.error?.message || 'Error al registrar evento');
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

    if (!confirm('¿Está seguro de finalizar este partido? Esta acción no se puede deshacer.')) {
      return;
    }

    this.panelService.finalizarPartido(partido.id_partido, { notas_arbitro: this.notasArbitro }).subscribe({
      next: (response) => {
        this.notification.success('Partido finalizado exitosamente');
        this.partidoActual.set(null);
        this.eventos.set([]);
        this.cargarPartidos();
        this.cerrarModalFinalizar();
      },
      error: (error) => {
        console.error('Error al finalizar partido:', error);
        this.notification.error(error.error?.message || 'Error al finalizar partido');
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

  cambiarFiltro(nuevoFiltro: string): void {
    this.filtroEstado.set(nuevoFiltro);
    this.cargarPartidos();
  }
}
