import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';
import { take, tap, map, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

/**
 * Guard para proteger rutas que requieren suscripción premium activa
 * Verifica los Firebase Custom Claims (premium: true)
 *
 * Uso en las rutas:
 * {
 *   path: 'crear-torneo',
 *   component: CrearTorneoComponent,
 *   canActivate: [authGuard, subscriptionGuard]
 * }
 */
export const subscriptionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const subscription = inject(SubscriptionService);
  const router = inject(Router);

  // Esperar a que Firebase esté listo y verificar si tiene suscripción activa
  return combineLatest([
    auth.authReady$,
    auth.isAuthenticated$,
    subscription.tieneSuscripcionActiva$
  ]).pipe(
    take(1),
    tap(([ready, isAuth, hasSub]) => {
      console.log('SubscriptionGuard - ready:', ready, 'isAuth:', isAuth, 'hasSub:', hasSub);

      if (!isAuth) {
        // Si no está autenticado, redirigir al login
        router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
      } else if (!hasSub) {
        // Si está autenticado pero no tiene suscripción, redirigir a planes
        router.navigate(['/planes'], {
          queryParams: {
            message: 'Se requiere suscripción premium para acceder a esta funcionalidad'
          }
        });
      }
    }),
    map(([, isAuth, hasSub]) => isAuth && hasSub)
  );
};

/**
 * Guard combinado que verifica autenticación Y suscripción en un solo paso
 * Más eficiente que usar authGuard + subscriptionGuard por separado
 *
 * Uso en las rutas:
 * {
 *   path: 'crear-torneo',
 *   component: CrearTorneoComponent,
 *   canActivate: [premiumGuard]
 * }
 */
export const premiumGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const subscription = inject(SubscriptionService);
  const router = inject(Router);

  return combineLatest([
    auth.authReady$,
    auth.user$
  ]).pipe(
    take(1),
    switchMap(([ready, user]) => {
      if (!user) {
        // No autenticado
        router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
        return of(false);
      }

      // Usuario autenticado, verificar claims
      return subscription.tieneSuscripcionActiva$.pipe(
        take(1),
        tap(hasSub => {
          if (!hasSub) {
            router.navigate(['/planes'], {
              queryParams: {
                message: 'Se requiere suscripción premium para acceder a esta funcionalidad'
              }
            });
          }
        })
      );
    })
  );
};

/**
 * Guard inverso: permite acceso solo a usuarios SIN suscripción
 * Útil para redirigir a usuarios premium lejos de la página de planes
 *
 * Uso en las rutas:
 * {
 *   path: 'planes',
 *   component: PlanesComponent,
 *   canActivate: [noSubscriptionGuard]  // Opcional, solo si quieres este comportamiento
 * }
 */
export const noSubscriptionGuard: CanActivateFn = () => {
  const subscription = inject(SubscriptionService);
  const router = inject(Router);

  return subscription.tieneSuscripcionActiva$.pipe(
    take(1),
    tap(hasSub => {
      if (hasSub) {
        // Ya tiene suscripción, redirigir al dashboard
        router.navigate(['/client/dashboard']);
      }
    }),
    map(hasSub => !hasSub)
  );
};
