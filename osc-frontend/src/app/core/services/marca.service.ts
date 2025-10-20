// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Marca } from '../models/marca.model';
import { API_URL } from './url';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private apiUrl = `${API_URL}/p/marcas`;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (opcional)
  getMarcas() {
    return this.http.get<Marca[]>(this.apiUrl);
  }

  // Resto de CRUD (sin cambios)
  getMarcaById(id: number) {
    return this.http.get<Marca>(`${this.apiUrl}/${id}`);
  }
  crearMarca(marca: Marca) {
    return this.http.post<Marca>(this.apiUrl, marca);
  }
  actualizarMarca(id: number, marca: Marca) {
    return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
  }
  eliminarMarca(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
