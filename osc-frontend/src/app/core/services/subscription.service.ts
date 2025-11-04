import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  from,
  of,
  switchMap,
  map,
  shareReplay,
  catchError,
  tap
} from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// Interfaces
export interface PlanSuscripcion {
  id_plan: number;
  nombre: string;
  descripcion: string;
  precio_simulado: number;
  duracion_dias: number;
  tipo: 'mensual' | 'anual';
  activo: boolean;
}

export interface Suscripcion {
  id_suscripcion: number;
  uid_usuario: string;
  id_plan: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activa' | 'caducada' | 'cancelada';
  metodo_pago_simulado: string;
  nombre_plan: string;
  tipo_plan: 'mensual' | 'anual';
  precio_simulado: number;
  duracion_dias: number;
}

export interface EstadoSuscripcion {
  tieneSuscripcion: boolean;
  suscripcion: Suscripcion | null;
  esPremium: boolean;
}

export interface CustomClaimsWithSubscription {
  role?: string;
  id_rol?: number;
  premium?: boolean;
  subscriptionType?: 'mensual' | 'anual';
  subscriptionExpires?: string;
  subscriptionPlan?: string;
  subscriptionUpdatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // URL base del servicio de suscripciones
  private readonly API_URL = `${environment.apiUrl}/s/client`;
  private readonly PUBLIC_API_URL = `${environment.apiUrl}/s/public`;

  // Estado local de la suscripción
  private estadoSuscripcionSubject = new BehaviorSubject<EstadoSuscripcion | null>(null);

  // Subject para forzar re-evaluación de claims
  private forceRefreshSubject = new BehaviorSubject<number>(0);

  /**
   * Observable del estado de suscripción actual del usuario
   */
  estadoSuscripcion$ = this.estadoSuscripcionSubject.asObservable();

  /**
   * Observable que indica si el usuario tiene suscripción activa
   * Combina claims de Firebase + verificación en BD
   */
  tieneSuscripcionActiva$: Observable<boolean> = this.forceRefreshSubject.pipe(
    switchMap(() => this.authService.user$),
    switchMap(user => {
      if (!user) return of(false);

      // Primero verificamos los claims (más rápido)
      return from(user.getIdTokenResult()).pipe(
        map(tokenResult => {
          const claims = tokenResult.claims as CustomClaimsWithSubscription;
          return claims.premium === true;
        }),
        catchError(() => of(false))
      );
    }),
    shareReplay(1)
  );

  /**
   * Observable de los claims de Firebase incluyendo info de suscripción
   */
  subscriptionClaims$: Observable<CustomClaimsWithSubscription | null> = this.forceRefreshSubject.pipe(
    switchMap(() => this.authService.user$),
    switchMap(user => {
      if (!user) return of(null);
      return from(user.getIdTokenResult()).pipe(
        map(tokenResult => tokenResult.claims as CustomClaimsWithSubscription),
        catchError(() => of(null))
      );
    }),
    shareReplay(1)
  );

  /**
   * Obtener todos los planes disponibles (endpoint público)
   */
  obtenerPlanes(): Observable<{ success: boolean; planes: PlanSuscripcion[]; total: number }> {
    return this.http.get<any>(`${this.PUBLIC_API_URL}/planes`);
  }

  /**
   * Verificar el estado de suscripción del usuario autenticado
   */
  verificarEstado(): Observable<EstadoSuscripcion> {
    return this.http.get<EstadoSuscripcion>(`${this.API_URL}/estado`).pipe(
      tap(estado => this.estadoSuscripcionSubject.next(estado)),
      catchError(error => {
        console.error('Error al verificar estado de suscripción:', error);
        return of({ tieneSuscripcion: false, suscripcion: null, esPremium: false });
      })
    );
  }

  /**
   * Simular pago y activar suscripción
   */
  simularPago(idPlan: number, metodoPago: string = 'tarjeta'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/simular-pago`, {
      idPlan,
      metodoPago
    }).pipe(
      switchMap(async response => {
        if (response.success) {
          // Forzar actualización del token para obtener nuevos claims
          await this.refrescarToken();
          // Actualizar estado local después de refrescar el token
          this.verificarEstado().subscribe();
        }
        return response;
      })
    );
  }

  /**
   * Cancelar suscripción activa
   */
  cancelarSuscripcion(idSuscripcion: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/cancelar`, { idSuscripcion }).pipe(
      switchMap(async response => {
        if (response.success) {
          // Forzar actualización del token para obtener nuevos claims
          await this.refrescarToken();
          // Actualizar estado local
          this.estadoSuscripcionSubject.next({
            tieneSuscripcion: false,
            suscripcion: null,
            esPremium: false
          });
        }
        return response;
      })
    );
  }

  /**
   * Sincronizar estado de suscripción con Firebase Claims
   */
  sincronizarConFirebase(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/sincronizar`, {}).pipe(
      switchMap(async response => {
        // Forzar actualización del token
        await this.refrescarToken();
        // Actualizar estado local
        this.verificarEstado().subscribe();
        return response;
      })
    );
  }

  /**
   * Obtener historial de suscripciones
   */
  obtenerHistorial(): Observable<{ success: boolean; historial: Suscripcion[]; total: number }> {
    return this.http.get<any>(`${this.API_URL}/historial`);
  }

  /**
   * Forzar actualización del token de Firebase para obtener claims actualizados
   */
  private async refrescarToken(): Promise<void> {
    try {
      await this.authService.getIdToken(true);
      // Forzar re-evaluación de los observables
      this.forceRefreshSubject.next(this.forceRefreshSubject.value + 1);
    } catch (error) {
      console.error('Error al refrescar token:', error);
    }
  }

  /**
   * Verificar si el usuario actual tiene una característica premium específica
   * Útil para mostrar/ocultar funcionalidades en la UI
   */
  verificarAccesoPremium(): Observable<boolean> {
    return this.tieneSuscripcionActiva$;
  }

  /**
   * Obtener información completa de la suscripción desde los claims
   */
  obtenerInfoSuscripcionDesdeClaims(): Observable<{
    isPremium: boolean;
    tipo?: 'mensual' | 'anual';
    expira?: Date;
    nombrePlan?: string;
  } | null> {
    return this.subscriptionClaims$.pipe(
      map(claims => {
        if (!claims || !claims.premium) {
          return { isPremium: false };
        }

        return {
          isPremium: true,
          tipo: claims.subscriptionType,
          expira: claims.subscriptionExpires ? new Date(claims.subscriptionExpires) : undefined,
          nombrePlan: claims.subscriptionPlan
        };
      })
    );
  }
}
