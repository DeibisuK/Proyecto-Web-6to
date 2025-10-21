// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Marca } from '../models/marca.model';
import { API_URL } from '../../shared/url';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private clientUrl = `${API_URL}/p/client/marcas`;
  private adminUrl = `${API_URL}/p/admin/marcas`;

  constructor(private http: HttpClient) {}

  // Método que mantienen los consumidores existentes (opcional)
  getMarcas() {
    return this.http.get<Marca[]>(this.clientUrl);
  }

  // Resto de CRUD (sin cambios)
  getMarcaById(id: number) {
    return this.http.get<Marca>(`${this.clientUrl}/${id}`);
  }
  crearMarca(marca: Marca) {
    return this.http.post<Marca>(this.adminUrl, marca);
  }
  actualizarMarca(id: number, marca: Marca) {
    return this.http.put<Marca>(`${this.adminUrl}/${id}`, marca);
  }
  eliminarMarca(id: number) {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
