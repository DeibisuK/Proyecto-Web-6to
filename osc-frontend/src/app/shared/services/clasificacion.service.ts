import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Clasificacion, RecalcularClasificacionRequest } from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionService {
  private http = inject(HttpClient);
  private clientUrl = `${environment.apiUrl}/client`;
  private adminUrl = `${environment.apiUrl}/admin`;

  // ===== OBTENER CLASIFICACIÓN POR TORNEO (Público) =====
  getClasificacionByTorneo(idTorneo: number, idFase?: number, idGrupo?: number): Observable<any> {
    let params = new HttpParams();
    if (idFase) params = params.set('idFase', idFase.toString());
    if (idGrupo) params = params.set('idGrupo', idGrupo.toString());

    return this.http.get<any>(
      `${this.clientUrl}/torneos/${idTorneo}/clasificacion`,
      { params }
    );
  }

  // ===== OBTENER CLASIFICACIÓN POR GRUPO (Público) =====
  getClasificacionByGrupo(idGrupo: number): Observable<any> {
    return this.http.get<any>(`${this.clientUrl}/grupos/${idGrupo}/clasificacion`);
  }

  // ===== OBTENER POSICIÓN DE EQUIPO (Público) =====
  getPosicionEquipo(idTorneo: number, idEquipo: number): Observable<any> {
    return this.http.get<any>(
      `${this.clientUrl}/torneos/${idTorneo}/equipos/${idEquipo}/clasificacion`
    );
  }

  // ===== RECALCULAR CLASIFICACIÓN (Admin) =====
  recalcularClasificacion(datos: RecalcularClasificacionRequest): Observable<any> {
    return this.http.post<any>(
      `${this.adminUrl}/torneos/${datos.id_torneo}/clasificacion/recalcular`,
      { id_fase: datos.id_fase, id_grupo: datos.id_grupo }
    );
  }

  // ===== ACTUALIZAR CLASIFICACIÓN MANUAL (Admin) =====
  actualizarClasificacion(idTorneo: number, clasificacion: Partial<Clasificacion>): Observable<any> {
    return this.http.put<any>(
      `${this.adminUrl}/torneos/${idTorneo}/clasificacion`,
      clasificacion
    );
  }
}
