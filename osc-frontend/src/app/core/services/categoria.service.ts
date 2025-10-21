// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { API_URL } from '../../shared/url';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private adminUrl = `${API_URL}/p/admin/categorias`;
  private clientUrl = `${API_URL}/p/client/categorias`;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (opcional)
  getCategorias() {
    return this.http.get<Categoria[]>(this.clientUrl);
  }

  // Resto de CRUD (sin cambios)
  getCategoriaById(id: number) {
    return this.http.get<Categoria>(`${this.clientUrl}/${id}`);
  }
  crearCategoria(categoria: Categoria) {
    return this.http.post<Categoria>(this.adminUrl, categoria);
  }
  actualizarCategoria(id: number, categoria: Categoria) {
    return this.http.put<Categoria>(`${this.adminUrl}/${id}`, categoria);
  }
  eliminarCategoria(id: number) {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
