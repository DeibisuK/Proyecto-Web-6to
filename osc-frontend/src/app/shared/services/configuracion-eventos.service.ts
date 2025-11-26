import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ConfiguracionEvento } from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionEventosService {
  private http = inject(HttpClient);
  private clientUrl = `${environment.apiUrl}/client`;
  private adminUrl = `${environment.apiUrl}/admin`;

  // ===== OBTENER EVENTOS POR DEPORTE (Público) =====
  getEventosByDeporte(idDeporte: number): Observable<any> {
    return this.http.get<any>(`${this.clientUrl}/deportes/${idDeporte}/eventos`);
  }

  // ===== OBTENER TODOS LOS EVENTOS (Público) =====
  getAllEventos(): Observable<any> {
    return this.http.get<any>(`${this.clientUrl}/eventos`);
  }

  // ===== OBTENER EVENTO POR ID (Admin) =====
  getEventoById(idConfig: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/eventos/${idConfig}`);
  }

  // ===== CREAR EVENTO (Admin) =====
  crearEvento(evento: Partial<ConfiguracionEvento>): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/eventos`, evento);
  }

  // ===== ACTUALIZAR EVENTO (Admin) =====
  actualizarEvento(idConfig: number, evento: Partial<ConfiguracionEvento>): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/eventos/${idConfig}`, evento);
  }

  // ===== DESACTIVAR EVENTO (Admin) =====
  desactivarEvento(idConfig: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/eventos/${idConfig}`);
  }

  // ===== ACTIVAR EVENTO (Admin) =====
  activarEvento(idConfig: number): Observable<any> {
    return this.http.patch<any>(`${this.adminUrl}/eventos/${idConfig}/activar`, {});
  }
}
