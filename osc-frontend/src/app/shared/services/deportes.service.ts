// src/app/core/services/deportes.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Deporte } from '@shared/models/index';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeporteService {
  private clientUrl = `${environment.apiUrl}/p/client/deportes`;
  private adminUrl = `${environment.apiUrl}/p/admin/deportes`;

  constructor(private http: HttpClient) {}

  // Configuración de jugadores mínimos por deporte
  private jugadoresMinimosPorDeporte: { [key: string]: number } = {
    'futbol': 11,
    'fútbol': 11,
    'soccer': 11,
    'futbol 5': 5,
    'futbol 7': 7,
    'futbol 11': 11,
    'basketball': 5,
    'baloncesto': 5,
    'basket': 5,
    'volleyball': 6,
    'voleibol': 6,
    'voley': 6,
    'tenis': 1,
    'tennis': 1,
    'padel': 2,
    'pádel': 2,
    'rugby': 15,
    'hockey': 11,
    'handball': 7,
    'balonmano': 7,
    'waterpolo': 7,
    'polo acuático': 7,
    'beisbol': 9,
    'baseball': 9,
    'softbol': 9,
    'softball': 9
  };

  /**
   * Obtiene el número mínimo de jugadores requerido para un deporte
   */
  getJugadoresMinimos(nombreDeporte: string): number {
    const deporteNormalizado = nombreDeporte.toLowerCase().trim();
    return this.jugadoresMinimosPorDeporte[deporteNormalizado] || 5; // Default: 5 jugadores
  }

  /**
   * Valida si un equipo tiene suficientes jugadores para un deporte
   */
  tieneJugadoresSuficientes(cantidadJugadores: number, nombreDeporte: string): boolean {
    const minimo = this.getJugadoresMinimos(nombreDeporte);
    return cantidadJugadores >= minimo;
  }

  getDeportes() {
    return this.http.get<Deporte[]>(this.clientUrl);
  }
  getDeporteById(id: number) {
    return this.http.get<Deporte>(`${this.clientUrl}/${id}`);
  }
  crearDeporte(deporte: Deporte) {
    return this.http.post<Deporte>(this.adminUrl, deporte);
  }
  actualizarDeporte(id: number, deporte: Deporte) {
    return this.http.put<Deporte>(`${this.adminUrl}/${id}`, deporte);
  }
  eliminarDeporte(id: number) {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
