// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { API_URL } from './url';
import { firstValueFrom } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = `${API_URL}/p/categorias`;

  // Señal pública con el estado de la lista (null = no cargado)
  categorias = signal<Categoria[] | null>(null);
  loading = signal(false);
  lastError = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  // === API antigua mantenida ===
  getCategorias(): Promise<Categoria[]> {
    // Si ya está cargado, devolverlo inmediatamente
    const current = this.categorias();
    if (current !== null) {
      return Promise.resolve(current);
    }
    // si no, pedir y guardar en la señal
    this.loading.set(true);
    return firstValueFrom(this.http.get<Categoria[]>(this.apiUrl))
      .then((list) => {
        this.categorias.set(list);
        this.lastError.set(null);
        return list;
      })
      .catch((err) => {
        this.lastError.set(err);
        this.categorias.set([]); // fallback seguro
        return [];
      })
      .finally(() => this.loading.set(false));
  }

  // Método de precarga para usar en APP_INITIALIZER
  async preload(): Promise<void> {
    // evita múltiples precargas si ya lo hiciste
    if (this.categorias() !== null) return;
    await this.getCategorias();
  }

  // Mantén el resto de métodos CRUD que ya tienes
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
