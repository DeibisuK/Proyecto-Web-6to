// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Deporte } from '../models/deporte.model';
import { API_URL } from './url';

@Injectable({ providedIn: 'root' })
export class DeporteService {
  private apiUrl = `${API_URL}/p/deportes`;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (opcional)
  getDeportes() {
    return this.http.get<Deporte[]>(this.apiUrl);
  }

  // Resto de CRUD (sin cambios)
  getDeporteById(id: number) {
    return this.http.get<Deporte>(`${this.apiUrl}/${id}`);
  }
  crearDeporte(deporte: Deporte) {
    return this.http.post<Deporte>(this.apiUrl, deporte);
  }
  actualizarDeporte(id: number, deporte: Deporte) {
    return this.http.put<Deporte>(`${this.apiUrl}/${id}`, deporte);
  }
  eliminarDeporte(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
