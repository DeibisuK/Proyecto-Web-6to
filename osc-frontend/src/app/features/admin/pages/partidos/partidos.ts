import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidosAdminService, Partido, Usuario } from './partidos.service';
import { TorneosAdminService, Torneo } from '../torneos/torneos.service';
import { CanchaService } from '@shared/services/canchas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Cancha } from '@app/shared/models';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos.html',
  styleUrl: './partidos.css',
})
export class Partidos implements OnInit {
  // Signals
  partidos = signal<Partido[]>([]);
  arbitros = signal<Usuario[]>([]);
  torneos = signal<Torneo[]>([]);
  canchas = signal<Cancha[]>([]);
  cargando = signal(false);

  // Filtros
  filtroTorneo = signal<number | null>(null);
  filtroEstado = signal<string>('todos');

  // Modal de asignación
  modalAsignacionAbierto = signal(false);
  partidoSeleccionado = signal<Partido | null>(null);
  arbitroSeleccionado = signal<number | null>(null);
  canchaSeleccionada = signal<number | null>(null);

  // Computed
  partidosFiltrados = computed(() => {
    let resultado = this.partidos();

    if (this.filtroTorneo() !== null) {
      resultado = resultado.filter(p => p.id_torneo === this.filtroTorneo());
    }

    if (this.filtroEstado() !== 'todos') {
      resultado = resultado.filter(p => p.estado_partido === this.filtroEstado());
    }

    return resultado;
  });

  partidosSinArbitro = computed(() =>
    this.partidosFiltrados().filter(p => !p.id_arbitro && (p.estado_partido === 'programado' || p.estado_partido === 'por_programar'))
  );

  partidosConArbitro = computed(() =>
    this.partidosFiltrados().filter(p => p.id_arbitro)
  );

  // Computed para canchas filtradas por sede y deporte del torneo
  canchasFiltradas = computed(() => {
    const partido = this.partidoSeleccionado();
    if (!partido) return [];

    return this.canchas().filter(cancha =>
      cancha.id_sede === partido.id_sede &&
      cancha.id_deporte === partido.id_deporte
    );
  });

  constructor(
    private partidosService: PartidosAdminService,
    private torneosService: TorneosAdminService,
    private canchaService: CanchaService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    // Cargar partidos, árbitros, torneos y canchas en paralelo
    Promise.all([
      this.cargarPartidos(),
      this.cargarArbitros(),
      this.cargarTorneos(),
      this.cargarCanchas()
    ]).finally(() => {
      this.cargando.set(false);
    });
  }

  cargarPartidos(): Promise<void> {
    return new Promise((resolve) => {
      const filtros: any = {};

      if (this.filtroTorneo()) {
        filtros.id_torneo = this.filtroTorneo();
      }

      if (this.filtroEstado() !== 'todos') {
        filtros.estado = this.filtroEstado();
      }

      this.partidosService.obtenerPartidos(filtros).subscribe({
        next: (response) => {
          this.partidos.set(response.data || []);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar partidos:', error);
          this.notification.error('Error al cargar partidos');
          resolve();
        }
      });
    });
  }

  cargarArbitros(): Promise<void> {
    return new Promise((resolve) => {
      this.partidosService.obtenerArbitros().subscribe({
        next: (response) => {
          this.arbitros.set(response.data || []);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar árbitros:', error);
          // No mostrar error al usuario, puede que no haya árbitros
          resolve();
        }
      });
    });
  }

  cargarTorneos(): Promise<void> {
    return new Promise((resolve) => {
      this.torneosService.listarTorneos().subscribe({
        next: (response: any) => {
          // response.data puede ser Torneo[] o Torneo único
          const torneos = Array.isArray(response.data) ? response.data : [response.data];
          this.torneos.set(torneos);
          resolve();
        },
        error: (error: any) => {
          console.error('Error al cargar torneos:', error);
          resolve();
        }
      });
    });
  }

  cargarCanchas(): Promise<void> {
    return new Promise((resolve) => {
      this.canchaService.getCanchas().subscribe({
        next: (canchas) => {
          this.canchas.set(canchas);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar canchas:', error);
          resolve();
        }
      });
    });
  }

  abrirModalAsignacion(partido: Partido): void {
    this.partidoSeleccionado.set(partido);
    this.arbitroSeleccionado.set(partido.id_arbitro || null);
    this.canchaSeleccionada.set(partido.id_cancha || null);
    this.modalAsignacionAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAsignacionAbierto.set(false);
    this.partidoSeleccionado.set(null);
    this.arbitroSeleccionado.set(null);
    this.canchaSeleccionada.set(null);
  }

  asignarArbitro(): void {
    const partido = this.partidoSeleccionado();
    const arbitroId = this.arbitroSeleccionado();
    const canchaId = this.canchaSeleccionada();

    if (!partido || !arbitroId) {
      this.notification.error('Seleccione un árbitro');
      return;
    }

    this.cargando.set(true);

    // Asignar árbitro primero
    this.partidosService.asignarArbitro(partido.id_partido, arbitroId).subscribe({
      next: (response) => {
        // Si hay cancha seleccionada, asignarla también
        if (canchaId) {
          this.partidosService.asignarCancha(partido.id_partido, canchaId).subscribe({
            next: () => {
              this.notification.success('Árbitro y cancha asignados exitosamente');
              this.cerrarModal();
              this.cargarPartidos();
            },
            error: (error) => {
              console.error('Error al asignar cancha:', error);
              this.notification.error('Árbitro asignado pero error al asignar cancha');
              this.cargando.set(false);
            }
          });
        } else {
          this.notification.success('Árbitro asignado exitosamente');
          this.cerrarModal();
          this.cargarPartidos();
        }
      },
      error: (error) => {
        console.error('Error al asignar árbitro:', error);
        this.notification.error(error.error?.message || 'Error al asignar árbitro');
        this.cargando.set(false);
      }
    });
  }

  removerArbitro(partido: Partido): void {
    if (!confirm(`¿Desasignar árbitro del partido ${partido.nombre_equipo_local} vs ${partido.nombre_equipo_visitante}?`)) {
      return;
    }

    this.cargando.set(true);
    this.partidosService.removerArbitro(partido.id_partido).subscribe({
      next: (response) => {
        this.notification.success('Árbitro removido exitosamente');
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al remover árbitro:', error);
        this.notification.error(error.error?.message || 'Error al remover árbitro');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarPartidos();
  }

  limpiarFiltros(): void {
    this.filtroTorneo.set(null);
    this.filtroEstado.set('todos');
    this.cargarPartidos();
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'programado': return 'badge-programado';
      case 'en_curso': return 'badge-en-curso';
      case 'finalizado': return 'badge-finalizado';
      case 'cancelado': return 'badge-cancelado';
      case 'pausado': return 'badge-pausado';
      default: return 'badge-default';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return 'Por definir';
    return hora.substring(0, 5); // HH:mm
  }
}
