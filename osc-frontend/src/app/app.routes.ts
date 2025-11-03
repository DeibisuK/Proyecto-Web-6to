import { Routes } from '@angular/router';
import { ClientLayout } from './features/client/layout/client-layout/client-layout';
import { AdminLayout } from './features/admin/layout/admin-layout/admin-layout';
import { clienteRoutes } from './features/client/cliente.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { adminGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
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
