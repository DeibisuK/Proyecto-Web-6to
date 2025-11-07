import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take, tap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Wait until Firebase has reported the initial auth state (authReady$),
  // then take the current isAuthenticated$ value and decide.
  return combineLatest([auth.authReady$, auth.isAuthenticated$]).pipe(
    take(1),
    tap(([ready, isAuth]) => {
      // console.log('AuthGuard - ready:', ready, 'isAuth:', isAuth);
      if (!isAuth) {
        // Redirect to login (use the app's login route)
        router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
      }
    }),
    map(([, isAuth]) => !!isAuth)
  );
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Wait until Firebase has reported the initial auth state (authReady$),
  // then take the current isAdmin$ value and decide.
  return combineLatest([auth.authReady$, auth.isAdmin$]).pipe(
    take(1),
    tap(([ready, isAdmin]) => {
      console.log('AdminGuard - ready:', ready, 'isAdmin:', isAdmin);
      if (!isAdmin) {
        // Redirect to home if not admin
        router.navigate(['/inicio']); // Changed back to /inicio to match original
      }
    }),
    map(([, isAdmin]) => !!isAdmin)
  );
};

export const arbitroGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Wait until Firebase has reported the initial auth state (authReady$),
  // then take the current isAdmin$ value and decide.
  return combineLatest([auth.authReady$, auth.isArbitro$]).pipe(
    take(1),
    tap(([ready, isArbitro]) => {
      console.log('ArbitroGuard - ready:', ready, 'isArbitro:', isArbitro);
      if (!isArbitro) {
        // Redirect to home if not admin
        router.navigate(['/inicio']); // Changed back to /inicio to match original
      }
    }),
    map(([, isArbitro]) => !!isArbitro)
  );
};
