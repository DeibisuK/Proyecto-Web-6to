import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../../../environments/environment';
import {
  DetallePartido,
  Partido,
  EventoPartido,
  ApiResponse
} from '../models/torneo.models';

@Injectable({
  providedIn: 'root'
})
export class PartidosService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/m/client`;

  /**
   * Obtiene el detalle completo de un partido
   */
  getDetallePartido(idPartido: number): Observable<DetallePartido> {
    return this.http.get<ApiResponse<DetallePartido>>(
      `${this.API_URL}/partidos/${idPartido}/detalle`
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Formatea la hora de un partido
   */
  formatearHoraPartido(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formatea la fecha completa de un partido
   */
  formatearFechaCompleta(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Obtiene el color del badge según el estado del partido
   */
  getColorEstadoPartido(estado: string): string {
    const colores: Record<string, string> = {
      'programado': 'info',
      'por_jugar': 'primary',
      'en_curso': 'warning',
      'finalizado': 'success',
      'suspendido': 'danger',
      'cancelado': 'secondary'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Obtiene el texto formateado del estado del partido
   */
  getTextoEstadoPartido(estado: string): string {
    const textos: Record<string, string> = {
      'programado': 'Programado',
      'por_jugar': 'Por Jugar',
      'en_curso': 'En Curso',
      'finalizado': 'Finalizado',
      'suspendido': 'Suspendido',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  /**
   * Obtiene el texto formateado de la fase del torneo
   */
  getTextoFase(fase: string): string {
    const fases: Record<string, string> = {
      'grupos': 'Fase de Grupos',
      'octavos': 'Octavos de Final',
      'cuartos': 'Cuartos de Final',
      'semifinal': 'Semifinal',
      'tercer_lugar': 'Tercer Lugar',
      'final': 'Final'
    };
    return fases[fase] || fase;
  }

  /**
   * Determina el resultado del partido (victoria local, visitante o empate)
   */
  getResultado(partido: Partido): 'local' | 'visitante' | 'empate' | null {
    if (partido.goles_local === null || partido.goles_visitante === null) {
      return null;
    }

    if (partido.goles_local > partido.goles_visitante) {
      return 'local';
    } else if (partido.goles_visitante > partido.goles_local) {
      return 'visitante';
    } else {
      return 'empate';
    }
  }

  /**
   * Filtra eventos por tipo
   */
  filtrarEventosPorTipo(eventos: EventoPartido[], tipo: string): EventoPartido[] {
    return eventos.filter(e => e.tipo_evento === tipo);
  }

  /**
   * Agrupa eventos por equipo
   */
  agruparEventosPorEquipo(eventos: EventoPartido[]): {
    local: EventoPartido[];
    visitante: EventoPartido[];
  } {
    const local: EventoPartido[] = [];
    const visitante: EventoPartido[] = [];

    // Nota: necesitaríamos el ID de los equipos para clasificar correctamente
    // Por ahora agrupamos por id_equipo
    eventos.forEach(evento => {
      // Esta lógica debería mejorarse con el contexto del partido
      if (evento.id_equipo) {
        local.push(evento); // Temporal, necesita lógica de clasificación
      }
    });

    return { local, visitante };
  }

  /**
   * Obtiene el ícono del evento
   */
  getIconoEvento(tipoEvento: string): string {
    const iconos: Record<string, string> = {
      'gol': '⚽',
      'tarjeta_amarilla': '🟨',
      'tarjeta_roja': '🟥',
      'cambio': '🔄',
      'otro': '📌'
    };
    return iconos[tipoEvento] || '•';
  }

  /**
   * Verifica si el partido está en vivo
   */
  estaEnVivo(partido: Partido): boolean {
    return partido.estado_partido === 'en_curso';
  }

  /**
   * Verifica si el partido ya finalizó
   */
  haFinalizado(partido: Partido): boolean {
    return partido.estado_partido === 'finalizado';
  }

  /**
   * Calcula el tiempo transcurrido (minutos desde el inicio)
   */
  calcularTiempoTranscurrido(fechaHora: string): number {
    const inicio = new Date(fechaHora);
    const ahora = new Date();
    const diferencia = ahora.getTime() - inicio.getTime();
    return Math.floor(diferencia / (1000 * 60)); // Minutos
  }

  /**
   * Formatea el marcador del partido
   */
  formatearMarcador(partido: Partido): string {
    if (partido.goles_local === null || partido.goles_visitante === null) {
      return 'vs';
    }

    let marcador = `${partido.goles_local} - ${partido.goles_visitante}`;

    // Agregar penales si existen
    if (partido.penales_local !== null && partido.penales_visitante !== null) {
      marcador += ` (${partido.penales_local} - ${partido.penales_visitante} pen.)`;
    }

    return marcador;
  }
}
