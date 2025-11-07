import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/u/contacto', '/c/sedes', '/c/canchas'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    console.log('Ruta pública detectada, no se añade token:', req.url);
    return next(req);
  }

  // Only attach token for API gateway requests
  const isApiRequest = req.url.includes(environment.apiUrl) ||
                       req.url.startsWith('/admin') ||
                       req.url.startsWith('/u') ||
                       req.url.startsWith('/p') ||
                       req.url.startsWith('/b') ||
                       req.url.startsWith('/c') ||
                       req.url.startsWith('/m') ||
                       req.url.startsWith('/i');

  if (!isApiRequest) {
    return next(req);
  }

  // Convert promise to observable and continue the chain
  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        console.warn('AuthInterceptor: No se pudo obtener el token para', req.url);
        return next(req); // Continuar sin token si no hay
      }

      // console.log('AuthInterceptor: Adjuntando token a', req.url); // <-- Log para depurar
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(cloned);
    })
  );
};
