// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Marca } from '../models/marca.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private clientUrl = `${environment.apiUrl}/p/client/marcas`;
  private adminUrl = `${environment.apiUrl}/p/admin/marcas`;

  // Cache del Observable de marcas
  private marcasCache$?: Observable<Marca[]>;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (con caché compartida)
  getMarcas() {
    // Si no existe el cache, crear el Observable con shareReplay
    if (!this.marcasCache$) {
      this.marcasCache$ = this.http.get<Marca[]>(this.clientUrl).pipe(
        shareReplay(1) // Cachea el último valor y lo comparte con todos los suscriptores
      );
    }
    return this.marcasCache$;
  }

  // Método para invalidar el cache (útil después de crear/actualizar/eliminar)
  invalidarCache() {
    this.marcasCache$ = undefined;
  }

  // Resto de CRUD (sin cambios)
  getMarcaById(id: number) {
    return this.http.get<Marca>(`${this.clientUrl}/${id}`);
  }
  crearMarca(marca: Marca) {
    const request = this.http.post<Marca>(this.adminUrl, marca);
    // Invalidar cache después de crear
    request.subscribe(() => this.invalidarCache());
    return request;
  }
  actualizarMarca(id: number, marca: Marca) {
    const request = this.http.put<Marca>(`${this.adminUrl}/${id}`, marca);
    // Invalidar cache después de actualizar
    request.subscribe(() => this.invalidarCache());
    return request;
  }
  eliminarMarca(id: number) {
    const request = this.http.delete<void>(`${this.adminUrl}/${id}`);
    // Invalidar cache después de eliminar
    request.subscribe(() => this.invalidarCache());
    return request;
  }
}
