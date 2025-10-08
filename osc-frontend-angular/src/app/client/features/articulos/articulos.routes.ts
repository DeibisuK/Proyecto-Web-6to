import { Routes } from '@angular/router';

export const articulosRoutes: Routes = [
  {
    path: 'cancha-futbol',
    loadComponent: () => import('./pages/cancha-futbol/cancha-futbol').then(m => m.CanchaFutbolPage)
  },
  {
    path: 'estudio-deportivo', 
    loadComponent: () => import('./pages/estudio-deportivo/estudio-deportivo').then(m => m.EstudioDeportivoPage)
  },
  {
    path: 'instalaciones-padel',
    loadComponent: () => import('./pages/instalaciones-padel/instalaciones-padel').then(m => m.InstalacionesPadelPage)
  },
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  }
];