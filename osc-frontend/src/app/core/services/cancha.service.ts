import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cancha } from '../models/canchas.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService {
  private apiUrl = '/c/canchas';

  constructor(private http: HttpClient) {}

  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.apiUrl);
  }

  getCanchaById(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.apiUrl}/${id}`);
  }

  getCanchasBySede(idSede: number): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`/c/sedes/${idSede}/canchas`);
  }

  createCancha(cancha: Cancha): Observable<Cancha> {
    return this.http.post<Cancha>(this.apiUrl, cancha);
  }

  updateCancha(id: number, cancha: Cancha): Observable<Cancha> {
    return this.http.put<Cancha>(`${this.apiUrl}/${id}`, cancha);
  }

  deleteCancha(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
