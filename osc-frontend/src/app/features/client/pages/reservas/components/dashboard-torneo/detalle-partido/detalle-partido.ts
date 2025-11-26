import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidosService } from '../services/partidos.service';
import { DetallePartido, EventoPartido, Jugador } from '../models/torneo.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-partido.html',
  styleUrls: ['./detalle-partido.css']
})
export class DetallePartidoComponent implements OnInit, OnDestroy {
  private partidosService = inject(PartidosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  detallePartido: DetallePartido | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  selectedTab: 'alineacion' | 'eventos' | 'estadisticas' = 'alineacion';

  // Suscripciones para tiempo real
  private tiempoSub?: Subscription;

  ngOnInit(): void {
    const idPartido = this.route.snapshot.paramMap.get('id');
    if (idPartido) {
      this.loadDetallePartido(Number(idPartido));
    } else {
      this.error = 'ID de partido no válido';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.tiempoSub?.unsubscribe();
  }

  /**
   * Carga los detalles completos del partido desde el backend
   */
  loadDetallePartido(idPartido: number): void {
    this.isLoading = true;
    this.error = null;

    this.partidosService.getDetallePartido(idPartido).subscribe({
      next: (detalle) => {
        this.detallePartido = detalle;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del partido:', error);
        this.error = 'Error al cargar los detalles del partido. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  selectTab(tab: 'alineacion' | 'eventos' | 'estadisticas'): void {
    this.selectedTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/client/reservas/dashboard-torneo/torneo']);
  }

  /**
   * Obtiene la clase CSS según el estado del partido
   */
  getStatusClass(): string {
    if (!this.detallePartido) return '';
    return this.partidosService.getColorEstadoPartido(this.detallePartido.partido.estado_partido);
  }

  /**
   * Obtiene el texto formateado del estado
   */
  getStatusText(): string {
    if (!this.detallePartido) return '';
    return this.detallePartido.partido.estado_partido === 'en_curso' ? 'EN VIVO' :
           this.detallePartido.partido.estado_partido === 'finalizado' ? 'FINALIZADO' :
           'PROGRAMADO';
  }

  /**
   * Verifica si el partido está en vivo
   */
  isLive(): boolean {
    if (!this.detallePartido) return false;
    return this.partidosService.estaEnVivo(this.detallePartido.partido);
  }

  /**
   * Obtiene los eventos de gol
   */
  getGoles(): EventoPartido[] {
    if (!this.detallePartido) return [];
    return this.partidosService.filtrarEventosPorTipo(this.detallePartido.eventos, 'gol');
  }

  /**
   * Obtiene los eventos de tarjeta amarilla
   */
  getTarjetasAmarillas(): EventoPartido[] {
    if (!this.detallePartido) return [];
    return this.partidosService.filtrarEventosPorTipo(this.detallePartido.eventos, 'tarjeta_amarilla');
  }

  /**
   * Obtiene los eventos de tarjeta roja
   */
  getTarjetasRojas(): EventoPartido[] {
    if (!this.detallePartido) return [];
    return this.partidosService.filtrarEventosPorTipo(this.detallePartido.eventos, 'tarjeta_roja');
  }

  /**
   * Obtiene el icono del evento
   */
  getIconoEvento(tipo: string): string {
    return this.partidosService.getIconoEvento(tipo);
  }

  /**
   * Cuenta eventos por equipo
   */
  contarEventosPorEquipo(eventos: EventoPartido[], idEquipo: number): number {
    return eventos.filter(e => e.id_equipo === idEquipo).length;
  }

  /**
   * Obtiene los titulares de un equipo
   */
  getTitulares(isLocal: boolean): Jugador[] {
    if (!this.detallePartido?.alineaciones) return [];
    const alineaciones = isLocal ?
      this.detallePartido.alineaciones.local :
      this.detallePartido.alineaciones.visitante;

    return alineaciones
      .filter(a => a.es_titular)
      .map(a => {
        const nombreCompleto = a.jugador_nombre.split(' ');
        return {
          id_jugador: a.id_jugador,
          nombre: nombreCompleto[0] || a.jugador_nombre,
          apellido: nombreCompleto.slice(1).join(' ') || '',
          numero: a.numero_camiseta,
          posicion_pref: a.posicion
        };
      });
  }

  /**
   * Obtiene los suplentes de un equipo
   */
  getSuplentes(isLocal: boolean): Jugador[] {
    if (!this.detallePartido?.alineaciones) return [];
    const alineaciones = isLocal ?
      this.detallePartido.alineaciones.local :
      this.detallePartido.alineaciones.visitante;

    return alineaciones
      .filter(a => !a.es_titular)
      .map(a => {
        const nombreCompleto = a.jugador_nombre.split(' ');
        return {
          id_jugador: a.id_jugador,
          nombre: nombreCompleto[0] || a.jugador_nombre,
          apellido: nombreCompleto.slice(1).join(' ') || '',
          numero: a.numero_camiseta,
          posicion_pref: a.posicion
        };
      });
  }

  /**
   * Formatea la hora del partido
   */
  getHoraPartido(): string {
    if (!this.detallePartido) return '';
    return this.partidosService.formatearHoraPartido(this.detallePartido.partido.fecha_hora_inicio);
  }

  /**
   * Obtiene el marcador formateado
   */
  getMarcador(): string {
    if (!this.detallePartido) return '0 - 0';
    return this.partidosService.formatearMarcador(this.detallePartido.partido);
  }

  /**
   * Obtiene el texto de la fase del torneo
   */
  getTextoFase(): string {
    if (!this.detallePartido?.partido.nombre_fase) return '';
    return this.partidosService.getTextoFase(this.detallePartido.partido.nombre_fase);
  }
}
