import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface Torneo {
  id_torneo?: number;
  nombre: string;
  descripcion?: string;
  id_deporte: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_cierre_inscripcion?: string;
  max_equipos?: number;
  tipo_torneo: string;
  estado: string;
  creado_por?: number;
  creado_en?: string;
  id_arbitro?: number;

  // Campos adicionales del JOIN
  nombre_deporte?: string;
  deporte_imagen?: string;
  creador_nombre?: string;
  creador_email?: string;
  equipos_inscritos?: number;
  total_partidos?: number;
  partidos_finalizados?: number;
  partidos_programados?: number;
  partidos_en_curso?: number;
  total_goles?: number;
  total_fases?: number;
  total_grupos?: number;
  fases?: any[];
}

export interface TorneoResponse {
  success: boolean;
  data: Torneo | Torneo[];
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FiltrosTorneo {
  deporte?: number;
  estado?: string;
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordenar?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TorneosAdminService {
  private apiUrl = `${environment.apiUrl}/c/admin/torneos`;

  constructor(private http: HttpClient) {}

  /**
   * Listar torneos con filtros y paginación
   */
  listarTorneos(filtros?: FiltrosTorneo): Observable<TorneoResponse> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.deporte) params = params.set('deporte', filtros.deporte.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
      if (filtros.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
      if (filtros.ordenar) params = params.set('ordenar', filtros.ordenar);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<TorneoResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un torneo por ID
   */
  obtenerTorneoPorId(id: number): Observable<TorneoResponse> {
    return this.http.get<TorneoResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo torneo
   */
  crearTorneo(torneo: Partial<Torneo>): Observable<TorneoResponse> {
    return this.http.post<TorneoResponse>(this.apiUrl, torneo);
  }

  /**
   * Actualizar un torneo existente
   */
  actualizarTorneo(id: number, torneo: Partial<Torneo>): Observable<TorneoResponse> {
    return this.http.put<TorneoResponse>(`${this.apiUrl}/${id}`, torneo);
  }

  /**
   * Eliminar un torneo
   */
  eliminarTorneo(id: number): Observable<TorneoResponse> {
    return this.http.delete<TorneoResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambiar estado de un torneo
   */
  cambiarEstado(id: number, estado: string): Observable<TorneoResponse> {
    return this.http.patch<TorneoResponse>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  /**
   * Obtener estadísticas de un torneo
   */
  obtenerEstadisticas(id: number): Observable<TorneoResponse> {
    return this.http.get<TorneoResponse>(`${this.apiUrl}/${id}/estadisticas`);
  }

  /**
   * Obtener equipos inscritos en un torneo
   */
  obtenerEquiposInscritosTorneo(id: number): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/c/client/torneos/${id}/equipos-inscritos`)
      .pipe(map((response: any) => response.data || []));
  }
}
