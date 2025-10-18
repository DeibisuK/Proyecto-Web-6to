import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/canchas.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService { // Se establece la URL base del API (sin la ruta de recurso).
  private baseApiUrl = `http://localhost:3004`;
  private canchasUrl = `${this.baseApiUrl}/canchas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las canchas (GET /canchas)
  getCanchas(): Observable<Cancha[]> {
    // Usa la ruta completa /canchas
    return this.http.get<Cancha[]>(this.canchasUrl);
  }

  // Obtener una cancha por ID (GET /canchas/:id)
  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.canchasUrl}/${id}`);
  }

  // Obtener canchas por sede (GET /sedes/:idSede/canchas)
  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    // CORRECCIÓN: Usa la URL base y la ruta definida en Express: /sedes/:idSede/canchas
    return this.http.get<Cancha[]>(`${this.baseApiUrl}/sedes/${idSede}/canchas`);
  }

  // Crear una nueva cancha (POST /canchas)
  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.canchasUrl, cancha);
  }

  // Actualizar una cancha existente (PUT /canchas/:id)
  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.canchasUrl}/${id}`, cancha);
  }

  // Eliminar una cancha (DELETE /canchas/:id)
  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.canchasUrl}/${id}`);
  }
}
