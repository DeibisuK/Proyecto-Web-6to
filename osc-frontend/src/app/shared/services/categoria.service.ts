// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Categoria } from '@shared/models/index';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private adminUrl = `${environment.apiUrl}/p/admin/categorias`;
  private clientUrl = `${environment.apiUrl}/p/client/categorias`;

  // Cache del Observable de categorías
  private categoriasCache$?: Observable<Categoria[]>;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (con caché compartida)
  getCategorias() {
    // Si no existe el cache, crear el Observable con shareReplay
    if (!this.categoriasCache$) {
      this.categoriasCache$ = this.http.get<Categoria[]>(this.clientUrl).pipe(
        shareReplay(1) // Cachea el último valor y lo comparte con todos los suscriptores
      );
    }
    return this.categoriasCache$;
  }

  // Método para invalidar el cache (útil después de crear/actualizar/eliminar)
  invalidarCache() {
    this.categoriasCache$ = undefined;
  }

  // Resto de CRUD (sin cambios)
  getCategoriaById(id: number) {
    return this.http.get<Categoria>(`${this.clientUrl}/${id}`);
  }
  crearCategoria(categoria: Categoria) {
    const request = this.http.post<Categoria>(this.adminUrl, categoria);
    // Invalidar cache después de crear
    request.subscribe(() => this.invalidarCache());
    return request;
  }
  actualizarCategoria(id: number, categoria: Categoria) {
    const request = this.http.put<Categoria>(`${this.adminUrl}/${id}`, categoria);
    // Invalidar cache después de actualizar
    request.subscribe(() => this.invalidarCache());
    return request;
  }
  eliminarCategoria(id: number) {
    const request = this.http.delete<void>(`${this.adminUrl}/${id}`);
    // Invalidar cache después de eliminar
    request.subscribe(() => this.invalidarCache());
    return request;
  }
}
