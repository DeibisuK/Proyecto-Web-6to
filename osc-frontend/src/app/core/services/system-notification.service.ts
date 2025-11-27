import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SystemNotification {
  id_notificacion: number;
  uid_usuario: string;
  asunto: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  leida: boolean;
  fecha_creacion: string; // String porque viene del backend como ISO string
  fecha_leida?: string;
  origen: string;
  id_referencia?: number;
  url_accion?: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
}

@Injectable({
  providedIn: 'root'
})
export class SystemNotificationService {
  private apiUrl = `${environment.apiUrl}/n/api/notificaciones`;

  // Signals para estado reactivo
  unreadCount = signal<number>(0);
  notifications = signal<SystemNotification[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Iniciar polling automático cada 30 segundos
   */
  startPolling(uid: string): void {
    // Poll inicial - cargar notificaciones
    this.loadNotifications(uid);

    // Poll cada 30 segundos - recargar notificaciones (el contador se actualiza dentro de loadNotifications)
    interval(30000).pipe(
      switchMap(() => {
        this.loadNotifications(uid);
        return []; // No hacer nada más, loadNotifications ya actualiza el contador
      })
    ).subscribe();
  }

  /**
   * Cargar notificaciones y actualizar el signal
   */
  private loadNotifications(uid: string): void {
    this.getNotifications({ uid, limit: 20 }).subscribe(notifs => {
      console.log('🔔 Notificaciones cargadas:', notifs.length, notifs);

      // Preservar estado local de notificaciones ya marcadas como leídas
      const currentNotifs = this.notifications();
      const localReadIds = new Set(
        currentNotifs.filter(n => n.leida).map(n => n.id_notificacion)
      );

      // Marcar como leídas localmente las que el usuario ya marcó
      const mergedNotifs = notifs.map(n => ({
        ...n,
        leida: n.leida || localReadIds.has(n.id_notificacion)
      }));

      this.notifications.set(mergedNotifs);

      // Actualizar contador basado en notificaciones fusionadas
      const unread = mergedNotifs.filter(n => !n.leida).length;
      console.log('📊 No leídas locales:', unread);
      this.unreadCount.set(unread);
    });
  }  /**
   * Obtener notificaciones con filtros
   */
  getNotifications(filters: {
    uid: string;
    leida?: boolean;
    origen?: string;
    limit?: number;
    offset?: number;
  }): Observable<SystemNotification[]> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<SystemNotification[]>(this.apiUrl, { params });
  }

  /**
   * Obtener contador de no leídas
   */
  getUnreadCount(uid: string): Observable<number> {
    const params = new HttpParams().set('uid', uid);

    return this.http.get<{ unread: number }>(`${this.apiUrl}/contador`, { params }).pipe(
      map(res => {
        this.unreadCount.set(res.unread);
        return res.unread;
      })
    );
  }

  /**
   * Crear notificación
   */
  createNotification(notification: Partial<SystemNotification>): Observable<SystemNotification> {
    return this.http.post<SystemNotification>(this.apiUrl, notification);
  }

  /**
   * Marcar como leída
   */
  markAsRead(id_notificacion: number, uid: string): Observable<SystemNotification> {
    return this.http.put<SystemNotification>(`${this.apiUrl}/${id_notificacion}/leer`, { uid }).pipe(
      map(notification => {
        // Actualizar contador basado en notificaciones actuales
        const currentNotifs = this.notifications();
        const unreadAfter = currentNotifs.filter(n => !n.leida && n.id_notificacion !== id_notificacion).length;
        this.unreadCount.set(unreadAfter);
        console.log('📉 Contador actualizado después de marcar:', unreadAfter);
        return notification;
      })
    );
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(uid: string): Observable<{ success: boolean; updated: number }> {
    return this.http.put<{ success: boolean; updated: number }>(`${this.apiUrl}/leer-todas`, { uid }).pipe(
      map(res => {
        this.unreadCount.set(0);
        return res;
      })
    );
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(id_notificacion: number, uid: string): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/${id_notificacion}`, {
      body: { uid }
    });
  }

  /**
   * Eliminar todas las leídas
   */
  deleteAllRead(uid: string): Observable<{ success: boolean; deleted: number }> {
    return this.http.request<{ success: boolean; deleted: number }>('delete', `${this.apiUrl}/leidas`, {
      body: { uid }
    });
  }

  /**
   * Obtener tiempo relativo (ej: "Hace 5 minutos")
   */
  getTimeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
