import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/canchas.model';
import { API_URL } from '../../shared/url';

@Injectable({
  providedIn: 'root',
})
export class CanchaService {
  // Usamos API_URL para definir la URL base de canchas para operaciones CRUD
  private canchasUrl = `${API_URL}/c/canchas`;

  constructor(private http: HttpClient) {} // Obtener todas las canchas (GET /u/canchas)

  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.canchasUrl);
  } // Obtener una cancha por ID (GET /u/canchas/:id)

  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.canchasUrl}/${id}`);
  } // Obtener canchas por sede (GET /c/sedes/:idSede/canchas)

  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    // Utilizamos API_URL directamente, ya que esta ruta tiene un prefijo diferente (/c)
    return this.http.get<Cancha[]>(`${API_URL}/c/sedes/${idSede}/canchas`);
  } // Crear una nueva cancha (POST /u/canchas)

  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.canchasUrl, cancha);
  } // Actualizar una cancha existente (PUT /u/canchas/:id)

  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.canchasUrl}/${id}`, cancha);
  } // Eliminar una cancha (DELETE /u/canchas/:id)

  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.canchasUrl}/${id}`);
  }

  getCanchasByDeporte(idDeporte: string): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`${API_URL}/c/deportes/${idDeporte}/canchas`);
  }
}
