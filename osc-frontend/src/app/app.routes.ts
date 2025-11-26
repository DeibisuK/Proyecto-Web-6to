import { Routes } from '@angular/router';
import { ClientLayout } from './features/client/layout/client-layout/client-layout';
import { AdminLayout } from './features/admin/layout/admin-layout/admin-layout';
import { clienteRoutes } from './features/client/cliente.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { arbitroRoutes } from './features/arbitro/arbitro.routes';
import { adminGuard, arbitroGuard } from './core/guards/auth.guard';
import { ArbitroLayout } from './features/arbitro/layout/arbitro-layout/arbitro-layout';


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
    path: 'arbitro',
    component: ArbitroLayout,
    canActivate: [arbitroGuard],
    children: arbitroRoutes,
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
