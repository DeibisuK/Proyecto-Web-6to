import { Observable } from 'rxjs';
import { API_URL } from '../../shared/url';
import { Sede } from '../models/sede.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private clientUrl = `${API_URL}/c/client/sedes`;
  private adminUrl = `${API_URL}/c/admin/sedes`;

  constructor(private http: HttpClient) {}

  getSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.clientUrl);
  }

  getSedeById(id: number): Observable<Sede> {
    return this.http.get<Sede>(`${this.clientUrl}/${id}`);
  }

  createSede(sede: Sede): Observable<Sede> {
    return this.http.post<Sede>(this.adminUrl, sede);
  }

  updateSede(id: number, sede: Sede): Observable<Sede> {
    return this.http.put<Sede>(`${this.adminUrl}/${id}`, sede);
  }

  deleteSede(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }
}
