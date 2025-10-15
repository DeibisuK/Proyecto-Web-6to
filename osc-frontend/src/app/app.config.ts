import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

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
  ],
};
