import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Deporte } from '../models/deporte.model';
import { Observable } from 'rxjs';
import { API_URL } from './url';

@Injectable({
  providedIn: 'root'
})
export class DeporteService {
  private apiUrl = `${API_URL}/p/deportes`;
  constructor(private http: HttpClient) {}

  getDeportes(): Observable<Deporte[]> {
    return this.http.get<Deporte[]>(this.apiUrl);
  }

  getDeporteById(id: number): Observable<Deporte> {
    return this.http.get<Deporte>(`${this.apiUrl}/${id}`);
  }

  crearDeporte(deporte: Deporte): Observable<Deporte> {
    return this.http.post<Deporte>(this.apiUrl, deporte);
  }
actualizarDeporte(id: number, deporte: Deporte): Observable<Deporte> {
  return this.http.put<Deporte>(`${this.apiUrl}/${id}`, deporte);
}

eliminarDeporte(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
}
