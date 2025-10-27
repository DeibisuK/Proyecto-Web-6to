import { Observable, shareReplay } from 'rxjs';
import { Sede } from '../models/sede.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private clientUrl = `${environment.apiUrl}/c/client/sedes`;
  private adminUrl = `${environment.apiUrl}/c/admin/sedes`;
  private sedesCache$?: Observable<Sede[]>;

  constructor(private http: HttpClient) {}

  getSedes(): Observable<Sede[]> {
    if (!this.sedesCache$) {
      this.sedesCache$ = this.http.get<Sede[]>(this.clientUrl).pipe(
        shareReplay(1) // Cachea el último valor y lo comparte con todos los suscriptores
      );
    }
    return this.sedesCache$;
  }
  // Método para invalidar el cache (útil después de crear/actualizar/eliminar)
  invalidarCache() {
    this.sedesCache$ = undefined;
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
