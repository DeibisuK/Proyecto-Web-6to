import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  EstadoPartidoTiempoReal,
  IniciarCronometroRequest,
  ActualizarTiempoRequest
} from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TiempoRealService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/arbitro`;

  // ===== OBTENER ESTADO DEL PARTIDO =====
  getEstadoPartido(idPartido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidos/${idPartido}/tiempo-real`);
  }

  // ===== CREAR/ACTUALIZAR ESTADO =====
  crearEstado(estado: Partial<EstadoPartidoTiempoReal>): Observable<any> {
    const { id_partido, ...estadoData } = estado as any;
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${id_partido}/tiempo-real`,
      estadoData
    );
  }

  // ===== INICIAR CRONÓMETRO =====
  iniciarCronometro(datos: IniciarCronometroRequest): Observable<any> {
    const { id_partido, periodo } = datos;
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${id_partido}/tiempo-real/iniciar`,
      { periodo }
    );
  }

  // ===== PAUSAR CRONÓMETRO =====
  pausarCronometro(idPartido: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${idPartido}/tiempo-real/pausar`,
      {}
    );
  }

  // ===== DETENER CRONÓMETRO =====
  detenerCronometro(idPartido: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${idPartido}/tiempo-real/detener`,
      {}
    );
  }

  // ===== REINICIAR CRONÓMETRO =====
  reiniciarCronometro(idPartido: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${idPartido}/tiempo-real/reiniciar`,
      {}
    );
  }

  // ===== ACTUALIZAR TIEMPO =====
  actualizarTiempo(datos: ActualizarTiempoRequest): Observable<any> {
    const { id_partido, tiempo_actual } = datos;
    return this.http.put<any>(
      `${this.apiUrl}/partidos/${id_partido}/tiempo-real/tiempo`,
      { tiempo_actual }
    );
  }

  // ===== ACTUALIZAR PUNTUACIÓN =====
  actualizarPuntuacion(idPartido: number, puntuacion: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/partidos/${idPartido}/tiempo-real/puntuacion`,
      { puntuacion_detallada: puntuacion }
    );
  }

  // ===== POLLING AUTOMÁTICO DEL ESTADO (para updates en tiempo real) =====
  watchEstadoPartido(idPartido: number, intervalMs: number = 2000): Observable<any> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getEstadoPartido(idPartido)),
      takeWhile((response: any) => {
        return response.data?.estado !== 'finalizado';
      }, true) // Incluye la última emisión cuando se finaliza
    );
  }
}
