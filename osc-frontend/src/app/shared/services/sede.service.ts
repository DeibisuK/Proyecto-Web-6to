import { Observable, shareReplay } from 'rxjs';
import { Sedes } from '@shared/models/index';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private clientUrl = `${environment.apiUrl}/c/client/sedes`;
  private adminUrl = `${environment.apiUrl}/c/admin/sedes`;
  private sedesCache$?: Observable<Sedes[]>;

  constructor(private http: HttpClient) {}

  getSedes(): Observable<Sedes[]> {
    if (!this.sedesCache$) {
      this.sedesCache$ = this.http.get<Sedes[]>(this.clientUrl).pipe(
        shareReplay(1) // Cachea el último valor y lo comparte con todos los suscriptores
      );
    }
    return this.sedesCache$;
  }
  // Método para invalidar el cache (útil después de crear/actualizar/eliminar)
  invalidarCache() {
    this.sedesCache$ = undefined;
  }
  getSedeById(id: number): Observable<Sedes> {
    return this.http.get<Sedes>(`${this.clientUrl}/${id}`);
  }

  createSede(sede: Sedes): Observable<Sedes> {
    return this.http.post<Sedes>(this.adminUrl, sede);
  }

  updateSede(id: number, sede: Sedes): Observable<Sedes> {
    return this.http.put<Sedes>(`${this.adminUrl}/${id}`, sede);
  }

  deleteSede(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }
}
