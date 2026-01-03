import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '@shared/models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CanchaService {
  // URL base para operaciones de cliente (públicas)
  private canchasClientUrl = `${environment.apiUrl}/c/client/canchas`;
  // URL base para operaciones de administrador (requieren autenticación)
  private canchasAdminUrl = `${environment.apiUrl}/c/admin/canchas`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS PÚBLICOS (CLIENTES)
  // ==========================================

  // Obtener todas las canchas (GET /c/client/canchas) - Público
  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.canchasClientUrl);
  }

  // Obtener una cancha por ID (GET /c/client/canchas/:id) - Público
  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.canchasClientUrl}/${id}`);
  }

  // Obtener canchas por sede (GET /c/client/sedes/:idSede/canchas) - Público
  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`${environment.apiUrl}/c/client/sedes/${idSede}/canchas`);
  }

  // Obtener canchas por deporte (GET /c/client/deportes/:idDeporte/canchas) - Público
  getCanchasByDeporte(idDeporte: string): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`${environment.apiUrl}/c/client/deportes/${idDeporte}/canchas`);
  }

  // ==========================================
  // MÉTODOS ADMIN (REQUIEREN AUTENTICACIÓN)
  // ==========================================

  // Crear una nueva cancha (POST /c/admin/canchas) - Admin
  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.canchasAdminUrl, cancha);
  }

  // Actualizar una cancha existente (PUT /c/admin/canchas/:id) - Admin
  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.canchasAdminUrl}/${id}`, cancha);
  }

  // Eliminar una cancha (DELETE /c/admin/canchas/:id) - Admin
  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.canchasAdminUrl}/${id}`);
  }

  // Guardar horarios disponibles de una cancha (POST /c/admin/canchas/:id/horarios-disponibles) - Admin
  guardarHorariosDisponibles(idCancha: string, configuracion: any): Observable<any> {
    return this.http.post(`${this.canchasAdminUrl}/${idCancha}/horarios-disponibles`, configuracion);
  }

  // Obtener horarios disponibles de una cancha (GET /c/client/canchas/:id/horarios-disponibles) - Público
  getHorariosDisponibles(idCancha: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.canchasClientUrl}/${idCancha}/horarios-disponibles`);
  }

  // Obtener horarios con estado de reserva para una fecha específica
  getHorariosConReservas(idCancha: number, fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.canchasClientUrl}/${idCancha}/horarios-con-reservas`, {
      params: { fecha }
    });
  }
}
