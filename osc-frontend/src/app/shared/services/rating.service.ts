import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating, RatingEstadisticas, RatingRequest } from '@shared/models/rating.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/c/ratings`;

  // Obtener todos los ratings de una cancha
  getRatingsByCancha(idCancha: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/cancha/${idCancha}`);
  }

  // Obtener estadísticas de ratings de una cancha
  getEstadisticasCancha(idCancha: number): Observable<RatingEstadisticas> {
    return this.http.get<RatingEstadisticas>(`${this.apiUrl}/cancha/${idCancha}/estadisticas`);
  }

  // Crear un nuevo rating
  createRating(rating: RatingRequest): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating);
  }

  // Actualizar un rating existente
  updateRating(idRating: number, rating: Partial<RatingRequest>): Observable<Rating> {
    return this.http.put<Rating>(`${this.apiUrl}/${idRating}`, rating);
  }

  // Eliminar un rating
  deleteRating(idRating: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${idRating}`);
  }

  // Verificar si un usuario ya dejó rating en una cancha
  checkUserRating(idCancha: number, firebaseUid: string): Observable<{ exists: boolean; rating?: Rating }> {
    return this.http.get<{ exists: boolean; rating?: Rating }>(
      `${this.apiUrl}/cancha/${idCancha}/usuario/${firebaseUid}`
    );
  }

  // Obtener top canchas mejor valoradas
  getTopCanchas(limit: number = 10): Observable<RatingEstadisticas[]> {
    return this.http.get<RatingEstadisticas[]>(`${this.apiUrl}/top?limit=${limit}`);
  }
}
