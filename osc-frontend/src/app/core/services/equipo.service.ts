import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo } from '../models/equipo.model';
import { API_URL } from '../../shared/url';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private clientUrl = `${API_URL}/m/client/equipos`;
  private adminUrl = `${API_URL}/m/admin/equipos`;

  constructor(private http: HttpClient) {}

  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.adminUrl);
  }

  getMisEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.clientUrl}/mis-equipos`);
  }

  getEquipoById(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.adminUrl}/${id}`);
  }

  createEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.clientUrl, equipo);
  }

  updateEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.adminUrl}/${id}`, equipo);
  }

  deleteEquipoClient(id: number): Observable<any> {
    return this.http.delete(`${this.clientUrl}/${id}`);
  }
  deleteEquipoAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }
}
