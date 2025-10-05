import { Routes } from '@angular/router';
import { ClientLayout } from './layout/client-layout/client-layout';

export const routes: Routes = [
  {
    path: '',
    component: ClientLayout,
    children: [
      {
        path: '',
        loadChildren: () => import('./client/cliente.routes').then((m) => m.clienteRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
