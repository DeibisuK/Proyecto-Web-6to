import { Observable } from 'rxjs';
import { API_URL } from './url';
import { Sede } from '../models/sede.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private apiUrl = `${API_URL}/c/sedes`;

  constructor(private http: HttpClient) {}

  getSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }

  getSedeById(id: number): Observable<Sede> {
    return this.http.get<Sede>(`${this.apiUrl}/${id}`);
  }

  createSede(sede: Sede): Observable<Sede> {
    return this.http.post<Sede>(this.apiUrl, sede);
  }

  updateSede(id: number, sede: Sede): Observable<Sede> {
    return this.http.put<Sede>(`${this.apiUrl}/${id}`, sede);
  }

  deleteSede(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
