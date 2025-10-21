// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Deporte } from '../models/deporte.model';
import { API_URL } from '../../shared/url';

@Injectable({ providedIn: 'root' })
export class DeporteService {
  private clientUrl = `${API_URL}/p/client/deportes`;
  private adminUrl = `${API_URL}/p/admin/deportes`;
  constructor(private http: HttpClient) {}

  getDeportes() {
    return this.http.get<Deporte[]>(this.clientUrl);
  }
  getDeporteById(id: number) {
    return this.http.get<Deporte>(`${this.clientUrl}/${id}`);
  }
  crearDeporte(deporte: Deporte) {
    return this.http.post<Deporte>(this.adminUrl, deporte);
  }
  actualizarDeporte(id: number, deporte: Deporte) {
    return this.http.put<Deporte>(`${this.adminUrl}/${id}`, deporte);
  }
  eliminarDeporte(id: number) {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
