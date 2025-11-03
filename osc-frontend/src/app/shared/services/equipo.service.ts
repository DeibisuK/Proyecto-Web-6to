import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo } from '@shared/models/index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private clientUrl = `${environment.apiUrl}/m/client/equipos`;
  private adminUrl = `${environment.apiUrl}/m/admin/equipos`;

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
