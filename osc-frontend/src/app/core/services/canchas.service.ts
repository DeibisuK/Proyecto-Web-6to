import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/canchas.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService {
  // CORRECCIÓN: baseApiUrl necesita comillas.
  private baseApiUrl = 'http://localhost:3004';
  // CORRECCIÓN: canchasUrl necesita comillas invertidas (backticks).
  private canchasUrl = `${this.baseApiUrl}/canchas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las canchas (GET /canchas)
  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.canchasUrl);
  }

  // Obtener una cancha por ID (GET /canchas/:id)
  // CORRECCIÓN: Se asume que el código original usaba backticks aquí, sino lo haría, también se corrige.
  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.canchasUrl}/${id}`);
  }

  // Obtener canchas por sede (GET /sedes/:idSede/canchas)
  // CORRECCIÓN: Se asume que el código original usaba backticks aquí, sino lo haría, también se corrige.
  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`${this.baseApiUrl}/sedes/${idSede}/canchas`);
  }

  // Crear una nueva cancha (POST /canchas)
  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.canchasUrl, cancha);
  }

  // Actualizar una cancha existente (PUT /canchas/:id)
  // CORRECCIÓN: Se asume que el código original usaba backticks aquí, sino lo haría, también se corrige.
  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.canchasUrl}/${id}`, cancha);
  }

  // Eliminar una cancha (DELETE /canchas/:id)
  // CORRECCIÓN: Se asume que el código original usaba backticks aquí, sino lo haría, también se corrige.
  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.canchasUrl}/${id}`);
  }
}