import { Routes } from "@angular/router";

export const arbitroRoutes: Routes = [
  {
    path: 'panel/:id',
    loadComponent: () =>
      import('./pages/panel-arbitro/panel-arbitro').then((m) => m.PanelArbitroComponent),
    data: { title: 'Panel de Árbitro' }
  },
  {
    path: 'panel',
    loadComponent: () =>
      import('./pages/panel-arbitro/panel-arbitro').then((m) => m.PanelArbitroComponent),
    data: { title: 'Panel de Árbitro' }
  },
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  }
];
