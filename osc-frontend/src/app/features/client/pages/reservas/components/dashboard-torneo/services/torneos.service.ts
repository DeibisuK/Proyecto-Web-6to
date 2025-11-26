import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../../../environments/environment';
import {
  Torneo,
  Partido,
  Clasificacion,
  EstadisticasUsuario,
  FiltrosTorneos,
  ApiResponse
} from '../models/torneo.models';

@Injectable({
  providedIn: 'root'
})
export class TorneosService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/c/client`;

  // Comunicación entre componentes
  private filtroDeporteSubject = new BehaviorSubject<string | null>(null);
  filtroDeporte$ = this.filtroDeporteSubject.asObservable();

  setFiltroDeporte(deporte: string | null): void {
    this.filtroDeporteSubject.next(deporte);
  }

  /**
   * Obtiene las estadísticas del usuario autenticado para el dashboard
   */
  getEstadisticasUsuario(): Observable<EstadisticasUsuario> {
    return this.http.get<ApiResponse<EstadisticasUsuario>>(
      `${this.API_URL}/torneos/estadisticas-usuario`
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtiene la lista de torneos públicos con filtros opcionales
   */
  getTorneosPublicos(filtros: FiltrosTorneos = {}): Observable<Torneo[]> {
    let params = new HttpParams();

    if (filtros.deporte) {
      params = params.set('deporte', filtros.deporte.toString());
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    if (filtros.fecha) {
      params = params.set('fecha', filtros.fecha);
    }
    if (filtros.ordenar) {
      params = params.set('ordenar', filtros.ordenar);
    }

    return this.http.get<ApiResponse<Torneo[]>>(
      `${this.API_URL}/torneos/publicos`,
      { params }
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene los partidos de un torneo específico
   */
  getPartidosPorTorneo(idTorneo: number): Observable<Partido[]> {
    return this.http.get<ApiResponse<Partido[]>>(
      `${this.API_URL}/torneos/${idTorneo}/partidos`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene la tabla de clasificación/posiciones de un torneo
   */
  getClasificacionTorneo(idTorneo: number): Observable<Clasificacion[]> {
    return this.http.get<ApiResponse<Clasificacion[]>>(
      `${this.API_URL}/torneos/${idTorneo}/clasificacion`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene los equipos inscritos en un torneo
   */
  getEquiposInscritos(idTorneo: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/torneos/${idTorneo}/equipos-inscritos`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Busca torneos por texto
   */
  buscarTorneos(termino: string): Observable<Torneo[]> {
    return this.getTorneosPublicos({ busqueda: termino });
  }

  /**
   * Obtiene torneos por deporte
   */
  getTorneosPorDeporte(idDeporte: number): Observable<Torneo[]> {
    return this.getTorneosPublicos({ deporte: idDeporte });
  }

  /**
   * Obtiene torneos activos (abierto o en curso)
   */
  getTorneosActivos(): Observable<Torneo[]> {
    return this.getTorneosPublicos().pipe(
      map(torneos => torneos.filter(t =>
        t.estado === 'abierto' || t.estado === 'en_curso'
      ))
    );
  }

  /**
   * Verifica si un torneo tiene cupos disponibles
   */
  tieneCuposDisponibles(torneo: Torneo): boolean {
    return torneo.equipos_inscritos < torneo.max_equipos;
  }

  /**
   * Calcula el porcentaje de ocupación de un torneo
   */
  getPorcentajeOcupacion(torneo: Torneo): number {
    return Math.round((torneo.equipos_inscritos / torneo.max_equipos) * 100);
  }

  /**
   * Formatea el rango de fechas del torneo
   */
  getRangoFechas(torneo: Torneo): string {
    const inicio = new Date(torneo.fecha_inicio);
    const fin = new Date(torneo.fecha_fin);

    const opcionesInicio: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };
    const opcionesFin: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    return `${inicio.toLocaleDateString('es-ES', opcionesInicio)} - ${fin.toLocaleDateString('es-ES', opcionesFin)}`;
  }

  /**
   * Obtiene el color del badge según el estado del torneo
   */
  getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'abierto': 'success',
      'en_curso': 'info',
      'cerrado': 'warning',
      'finalizado': 'secondary'
    };
    return colores[estado] || 'primary';
  }

  /**
   * Obtiene el texto formateado del estado
   */
  getTextoEstado(estado: string): string {
    const textos: Record<string, string> = {
      'abierto': 'Inscripción Abierta',
      'en_curso': 'En Curso',
      'cerrado': 'Cerrado',
      'finalizado': 'Finalizado'
    };
    return textos[estado] || estado;
  }
}
