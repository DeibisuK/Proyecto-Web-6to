// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Deporte } from '../models/deporte.model';
import { API_URL } from './url';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeporteService {
  private apiUrl = `${API_URL}/p/deportes`;

  // Signals públicas
  deportes = signal<Deporte[] | null>(null); // null = no cargado
  loading = signal(false);
  lastError = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  // Retornamos Promise para usar con APP_INITIALIZER
  async preload(): Promise<void> {
    if (this.deportes() !== null) return; // ya cargado
    this.loading.set(true);
    try {
      const list = await firstValueFrom(this.http.get<Deporte[]>(this.apiUrl));
      this.deportes.set(list ?? []);
      this.lastError.set(null);
    } catch (err) {
      this.lastError.set(err);
      this.deportes.set([]); // fallback seguro
    } finally {
      this.loading.set(false);
    }
  }

  // Método que mantienen los consumidores existentes (opcional)
  async getDeportes(): Promise<Deporte[]> {
    if (this.deportes() !== null) return this.deportes()!;
    await this.preload();
    return this.deportes() ?? [];
  }

  // Resto de CRUD (sin cambios)
  getDeporteById(id: number) { return this.http.get<Deporte>(`${this.apiUrl}/${id}`); }
  crearDeporte(deporte: Deporte) { return this.http.post<Deporte>(this.apiUrl, deporte); }
  actualizarDeporte(id: number, deporte: Deporte) { return this.http.put<Deporte>(`${this.apiUrl}/${id}`, deporte); }
  eliminarDeporte(id: number) { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}