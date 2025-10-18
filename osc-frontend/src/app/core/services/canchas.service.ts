import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/canchas.model';
import { API_URL } from './url';

@Injectable({
  providedIn: 'root'
})
export class CanchasService {
    private apiUrl = `${API_URL}/u/canchas`;
  

  constructor(private http: HttpClient) {}

  // Obtener todas las canchas
  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.apiUrl);
  }

  // Obtener una cancha por ID
  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.apiUrl}/${id}`);
  }

  // Obtener canchas por sede
  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`/c/sedes/${idSede}/canchas`);
  }

  // Crear una nueva cancha
  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.apiUrl, cancha);
  }

  // Actualizar una cancha existente
  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.apiUrl}/${id}`, cancha);
  }

  // Eliminar una cancha
  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
