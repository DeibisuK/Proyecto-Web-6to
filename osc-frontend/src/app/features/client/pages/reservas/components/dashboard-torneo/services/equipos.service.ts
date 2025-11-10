import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../../../environments/environment';

export interface EquipoUsuario {
  id_equipo: number;
  nombre_equipo: string;
  descripcion?: string;
  logo_url?: string;
  id_deporte: number;
  nombre_deporte?: string;
  firebase_uid: string;
  cantidad_jugadores?: number;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/m/client`;

  /**
   * Obtiene los equipos del usuario autenticado
   */
  getEquiposUsuario(): Observable<EquipoUsuario[]> {
    return this.http.get<EquipoUsuario[] | ApiResponse<EquipoUsuario[]>>(
      `${this.API_URL}/equipos/mis-equipos`
    ).pipe(
      map(response => {
        // Si viene con estructura ApiResponse
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as ApiResponse<EquipoUsuario[]>).data || [];
        }
        // Si viene directo como array
        return (response as EquipoUsuario[]) || [];
      })
    );
  }

  /**
   * Filtra equipos por deporte
   */
  filtrarPorDeporte(equipos: EquipoUsuario[], idDeporte: number): EquipoUsuario[] {
    return equipos.filter(e => e.id_deporte === idDeporte);
  }

  /**
   * Filtra equipos por nombre de deporte
   */
  filtrarPorNombreDeporte(equipos: EquipoUsuario[], nombreDeporte: string): EquipoUsuario[] {
    return equipos.filter(e =>
      e.nombre_deporte?.toLowerCase() === nombreDeporte.toLowerCase()
    );
  }
}
