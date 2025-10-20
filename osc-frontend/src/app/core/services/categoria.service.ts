// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { API_URL } from './url';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = `${API_URL}/p/categorias`;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (opcional)
  getCategorias() {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Resto de CRUD (sin cambios)
  getCategoriaById(id: number) {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }
  crearCategoria(categoria: Categoria) {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }
  actualizarCategoria(id: number, categoria: Categoria) {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }
  eliminarCategoria(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
