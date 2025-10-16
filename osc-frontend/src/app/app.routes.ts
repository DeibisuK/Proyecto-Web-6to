import { Routes } from '@angular/router';
import { ClientLayout } from './client/client-layout/client-layout';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { clienteRoutes } from './client/cliente.routes';
import { adminRoutes } from './admin/admin.routes';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: adminRoutes,
  },
  {
    path: '',
    component: ClientLayout,
    children: clienteRoutes
  },
  {
    path: '**',
    redirectTo: '/inicio'
  }
];
