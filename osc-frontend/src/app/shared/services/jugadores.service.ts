import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Jugador, CrearJugadorRequest } from '../interfaces/match.interfaces';

@Injectable({
  providedIn: 'root'
})
export class JugadoresService {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiUrl}/m/admin`;
  private clientUrl = `${environment.apiUrl}/m/client`;

  // ===== MÉTODOS PARA CLIENTE =====

  // Obtener jugadores por equipo (cliente)
  getJugadoresByEquipoCliente(idEquipo: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/equipos/${idEquipo}/jugadores`);
  }

  // Crear jugador (cliente)
  crearJugadorCliente(jugador: CrearJugadorRequest): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/equipos/${jugador.id_equipo}/jugadores`, jugador);
  }

  // ===== MÉTODOS PARA ADMIN =====

  // OBTENER JUGADORES POR EQUIPO =====
  getJugadoresByEquipo(idEquipo: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/equipos/${idEquipo}/jugadores`);
  }

  // ===== OBTENER JUGADOR POR ID =====
  getJugadorById(idJugador: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/jugadores/${idJugador}`);
  }

  // ===== CREAR JUGADOR =====
  crearJugador(jugador: CrearJugadorRequest): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/equipos/${jugador.id_equipo}/jugadores`, jugador);
  }

  // ===== ACTUALIZAR JUGADOR =====
  actualizarJugador(idJugador: number, jugador: Partial<Jugador>): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/jugadores/${idJugador}`, jugador);
  }

  // ===== ELIMINAR JUGADOR =====
  eliminarJugador(idJugador: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/jugadores/${idJugador}`);
  }

  // ===== BUSCAR JUGADORES POR NOMBRE =====
  buscarJugadores(nombre: string, idEquipo?: number): Observable<any> {
    let params = new HttpParams().set('nombre', nombre);
    if (idEquipo) params = params.set('idEquipo', idEquipo.toString());

    return this.http.get<any>(`${this.adminUrl}/jugadores/buscar`, { params });
  }

  // ===== OBTENER JUGADORES DISPONIBLES =====
  getJugadoresDisponibles(idEquipo: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/equipos/${idEquipo}/jugadores/disponibles`);
  }

  // ===== CAMBIAR ESTADO DE JUGADOR =====
  cambiarEstado(idJugador: number, estado: 'activo' | 'inactivo' | 'lesionado' | 'suspendido'): Observable<any> {
    return this.http.patch<any>(
      `${this.adminUrl}/jugadores/${idJugador}/estado`,
      { estado }
    );
  }

  // ===== ASIGNAR CAPITÁN =====
  asignarCapitan(idEquipo: number, idJugador: number): Observable<any> {
    return this.http.patch<any>(
      `${this.adminUrl}/equipos/${idEquipo}/jugadores/${idJugador}/capitan`,
      {}
    );
  }
}
