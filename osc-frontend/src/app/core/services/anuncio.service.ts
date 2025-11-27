import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Anuncio {
  id_anuncio?: number;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  activo?: boolean;
  fecha_creacion?: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/n/api/anuncios`;

  // Subject para notificar cambios
  private anunciosUpdated = new BehaviorSubject<void>(undefined);
  anunciosUpdated$ = this.anunciosUpdated.asObservable();

  /**
   * Crear un nuevo anuncio global (solo admin)
   */
  createAnuncio(anuncio: Omit<Anuncio, 'id_anuncio'>): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.apiUrl, anuncio).pipe(
      tap(() => {
        console.log('✅ Anuncio creado exitosamente');
        this.anunciosUpdated.next(); // Notificar que hubo cambios
      })
    );
  }

  /**
   * Obtener todos los anuncios activos (público)
   */
  getAnunciosActivos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Obtener todos los anuncios (admin)
   */
  getAllAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.apiUrl);
  }

  /**
   * Obtener anuncios no leídos para un usuario
   */
  getUnreadAnuncios(uid: string): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/no-leidos`, {
      params: { uid }
    });
  }

  /**
   * Marcar anuncio como leído
   */
  markAnuncioAsRead(id_anuncio: number, uid: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id_anuncio}/leer`, { uid });
  }

  /**
   * Actualizar anuncio (admin)
   */
  updateAnuncio(id_anuncio: number, updates: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${this.apiUrl}/${id_anuncio}`, updates).pipe(
      tap(() => {
        console.log('✅ Anuncio actualizado');
        this.anunciosUpdated.next();
      })
    );
  }

  /**
   * Eliminar anuncio (admin)
   */
  deleteAnuncio(id_anuncio: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id_anuncio}`).pipe(
      tap(() => {
        console.log('✅ Anuncio eliminado');
        this.anunciosUpdated.next();
      })
    );
  }

  /**
   * Helpers para UI
   */
  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      promotion: 'local_offer'
    };
    return iconos[tipo] || 'notifications';
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      info: 'Información',
      success: 'Éxito',
      warning: 'Advertencia',
      error: 'Error/Urgente',
      promotion: 'Promoción'
    };
    return labels[tipo] || 'Información';
  }
}
