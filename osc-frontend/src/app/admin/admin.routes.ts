import { Routes } from "@angular/router";
import { Dashboard } from "./features/dashboard/dashboard";
import { ListCancha } from "./features/canchas/list-cancha/list-cancha";
import { CrearCancha } from "./features/canchas/crear-cancha/crear-cancha";
import { UsuarioComponent } from "./features/usuario/usuario";
import { Anuncios } from "./features/anuncios/anuncios";
import { ListSede } from "./features/sedes/list-sede/list-sede";
import { CrearSede } from "./features/sedes/crear-sede/crear-sede";
import { Equipos } from "./features/equipos/equipos";
import { Productos } from "./features/productos/productos";

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
    component: Productos,
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
