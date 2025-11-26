import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  Alineacion,
  CrearAlineacionRequest,
  SustitucionRequest
} from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AlineacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/arbitro`;

  // ===== OBTENER ALINEACIÓN DEL PARTIDO =====
  getAlineacionByPartido(idPartido: number, idEquipo?: number): Observable<any> {
    let url = `${this.apiUrl}/partidos/${idPartido}/alineaciones`;
    if (idEquipo) {
      url += `?idEquipo=${idEquipo}`;
    }
    return this.http.get<any>(url);
  }

  // ===== CREAR ALINEACIÓN COMPLETA =====
  crearAlineacionCompleta(alineacion: CrearAlineacionRequest): Observable<any> {
    const { id_partido, ...alineacionData } = alineacion;
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${id_partido}/alineaciones/completa`,
      alineacionData
    );
  }

  // ===== AGREGAR JUGADOR A ALINEACIÓN =====
  agregarJugador(idPartido: number, jugador: { id_equipo: number, id_jugador: number, es_titular: boolean }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${idPartido}/alineaciones`,
      jugador
    );
  }

  // ===== REGISTRAR SUSTITUCIÓN =====
  registrarSustitucion(sustitucion: SustitucionRequest): Observable<any> {
    const { id_partido, ...sustitucionData } = sustitucion;
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${id_partido}/sustituciones`,
      sustitucionData
    );
  }

  // ===== ACTUALIZAR ALINEACIÓN =====
  actualizarAlineacion(idPartido: number, idAlineacion: number, datos: Partial<Alineacion>): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/partidos/${idPartido}/alineaciones/${idAlineacion}`,
      datos
    );
  }

  // ===== ELIMINAR JUGADOR DE ALINEACIÓN =====
  eliminarJugador(idPartido: number, idAlineacion: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/partidos/${idPartido}/alineaciones/${idAlineacion}`
    );
  }
}
