import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/u/contacto', '/c/sedes', '/c/canchas'];
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
    
    if (isPublicRoute) {
      console.log('Ruta pública detectada, no se añade token:', req.url);
      return next.handle(req);
    }

    // Only attach token for API gateway requests
    const isApiRequest = req.url.includes('localhost:3000') || 
                        req.url.startsWith('/u') || 
                        req.url.startsWith('/p') || 
                        req.url.startsWith('/b') || 
                        req.url.startsWith('/c') || 
                        req.url.startsWith('/m') || 
                        req.url.startsWith('/i');

    if (!isApiRequest) return next.handle(req);

    // Convert promise to observable and continue the chain
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) => {
        if (!token) return next.handle(req);
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(cloned);
      })
    );
  }
}
