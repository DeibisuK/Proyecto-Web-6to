import { Routes } from "@angular/router";
import { Dashboard } from "./pages/dashboard/dashboard";
import { ListCancha } from "./pages/canchas/list-cancha/list-cancha";
import { CrearCancha } from "./pages/canchas/crear-cancha/crear-cancha";
import { UsuarioComponent } from "./pages/usuario/usuario";
import { Anuncios } from "./pages/anuncios/anuncios";
import { ListSede } from "./pages/sedes/list-sede/list-sede";
import { CrearSede } from "./pages/sedes/crear-sede/crear-sede";
import { Equipos } from "./pages/equipos/equipos";
import { ProductosComponent } from "./pages/productos/productos";
import { ListTorneos } from "./pages/torneos/list-torneos/list-torneos";
import { CrearTorneo } from "./pages/torneos/crear-torneo/crear-torneo";
import { Reportes } from "./pages/reportes/reportes";
import { ListReservas } from "./pages/reservas/list-reservas/list-reservas";
import { Historial } from "./pages/historial/historial";
import { Partidos } from "./pages/partidos/partidos";
import { ListPedidos } from "./pages/comercio/list-pedidos/list-pedidos";
import { ArbitroPanel } from "./pages/arbitro-panel/arbitro-panel";

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'OSC Dashboard'
  },
  {
    path: 'reportes',
    component: Reportes,
    title: 'OSC Reportes'
  },
  {
    path: 'reservas',
    component: ListReservas,
    title: 'OSC Reservas'
  },
  {
    path: 'productos',
    component: ProductosComponent,
    title: 'OSC Productos'
  },
  {
    path: 'sedes',
    component: ListSede,
    title: 'OSC Sedes'
  },
  {
    path: 'crear-sede',
    component: CrearSede,
    title: 'Crear Sede'
  },
  {
    path: 'editar-sede/:id',
    component: CrearSede,
    title: 'OSC Editar Sede'
  },
  {
    path: 'canchas',
    component: ListCancha,
    title: 'OSC Canchas'
  },
  {
    path: 'crear-cancha',
    component: CrearCancha,
    title: 'OSC Crear Cancha'
  },
  {
    path: 'editar-cancha/:id',
    component: CrearCancha,
    title: 'OSC Editar Cancha'
  },
  {
    path: 'historial',
    component: Historial,
    title: 'OSC Historial'
  },
  {
    path: 'partidos',
    component: Partidos,
    title: 'OSC Partidos'
  },
  {
    path: 'pedidos-y-ventas',
    component: ListPedidos,
    title: 'OSC Pedidos y Ventas'
  },
  {
    path: 'torneos',
    component: ListTorneos,
    title: 'OSC Torneos'
  },
  {
    path: 'crear-torneo',
    component: CrearTorneo,
    title: 'OSC Crear Torneo'
  },
  {
    path: 'editar-torneo/:id',
    component: CrearTorneo,
    title: 'OSC Editar Torneo'
  },
  {
    path: 'equipos',
    component: Equipos,
    title: 'OSC Equipos'
  },
  {
    path: 'usuarios',
    component: UsuarioComponent,
    title: 'OSC Usuarios'
  },
  {
    path: 'anuncios',
    component: Anuncios,
    title: 'OSC Anuncios'
  },
  {
    path: 'arbitro-panel/:idPartido',
    component: ArbitroPanel,
    title: 'OSC Panel de Árbitro'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
]
