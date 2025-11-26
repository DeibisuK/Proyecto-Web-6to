import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  Evento,
  RegistrarEventoRequest,
  Goleador,
  EstadisticasJugador
} from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventosPartidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/arbitro`;

  // ===== OBTENER EVENTOS DEL PARTIDO =====
  getEventosByPartido(idPartido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidos/${idPartido}/eventos`);
  }

  // ===== REGISTRAR EVENTO =====
  registrarEvento(evento: RegistrarEventoRequest): Observable<any> {
    const { id_partido, ...eventoData } = evento;
    return this.http.post<any>(
      `${this.apiUrl}/partidos/${id_partido}/eventos`,
      eventoData
    );
  }

  // ===== ELIMINAR EVENTO =====
  eliminarEvento(idPartido: number, idEvento: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/partidos/${idPartido}/eventos/${idEvento}`
    );
  }

  // ===== OBTENER GOLEADORES DEL TORNEO =====
  getGoleadoresByTorneo(idTorneo: number, limite: number = 20): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/torneos/${idTorneo}/goleadores?limite=${limite}`
    );
  }

  // ===== OBTENER ESTADÍSTICAS DE JUGADOR =====
  getEstadisticasJugador(idPartido: number, idJugador: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/partidos/${idPartido}/jugadores/${idJugador}/estadisticas`
    );
  }
}
