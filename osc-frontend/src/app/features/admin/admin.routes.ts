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

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard'
  },
  {
    path: 'productos',
    component: ProductosComponent,
    title: 'Productos'
  },
  {
    path: 'sedes',
    component: ListSede,
    title: 'Sedes'
  },
  {
    path: 'crear-sede',
    component: CrearSede,
    title: 'Crear Sede'
  },
  {
    path: 'editar-sede/:id',
    component: CrearSede,
    title: 'Editar Sede'
  },
  {
    path: 'canchas',
    component: ListCancha,
    title: 'Canchas'
  },
  {
    path: 'crear-cancha',
    component: CrearCancha,
    title: 'Crear Cancha'
  },
  {
    path: 'editar-cancha/:id',
    component: CrearCancha,
    title: 'Editar Cancha'
  },
  {
    path: 'torneos',
    component: ListTorneos,
    title: 'Torneos'
  },
  {
    path: 'crear-torneo',
    component: CrearTorneo,
    title: 'Crear Torneo'
  },
  {
    path: 'editar-torneo/:id',
    component: CrearTorneo,
    title: 'Editar Torneo'
  },
  {
    path: 'equipos', component: Equipos
  },
  {
    path: 'usuarios',
    component: UsuarioComponent,
    title: 'Usuarios'
  },
  {
    path: 'anuncios',
    component: Anuncios,
    title: 'Anuncios'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
]
