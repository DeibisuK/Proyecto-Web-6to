import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';

// Función factory para inicializar la autenticación
export function initializeAuth(authService: AuthService) {
  console.log('APP_INITIALIZER: Esperando estado de autenticación...');
  return firstValueFrom(authService.authReady$).then(() => {
    console.log('APP_INITIALIZER: Estado de autenticación cargado');
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'proyect-osc-593c5',
        appId: '1:853149246137:web:88809962547665f5c87168',
        storageBucket: 'proyect-osc-593c5.firebasestorage.app',
        apiKey: 'AIzaSyDA4JAIQFGcNqMIerzBmwys3kEdehAVtZs',
        authDomain: 'proyect-osc-593c5.firebaseapp.com',
        messagingSenderId: '853149246137',
        measurementId: 'G-4M3CZ799Q2',
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    // Register HTTP interceptor to attach Firebase ID token
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return initializeAuth(authService);
    }),
  ],
};
