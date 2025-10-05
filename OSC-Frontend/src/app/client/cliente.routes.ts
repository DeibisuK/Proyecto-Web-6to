import { Routes } from "@angular/router";
import { Contact } from "./features/contact/contact";
import { Home } from "./features/home/home";
import { Productos } from "./features/productos/productos";
import { Reservas } from "./features/reservas/reservas";
import { Nosotros } from "./features/nosotros/nosotros";
import { MisionVision } from "./features/nosotros/mision-vision/mision-vision";
import { Equipo } from "./features/nosotros/equipo/equipo";
import { Historia } from "./features/nosotros/historia/historia";

export const clienteRoutes: Routes = [
  {
    path: '', redirectTo: '/inicio', pathMatch: 'full',
  },
  {
    path: 'inicio', component: Home
  },
  {
    path: 'productos', component: Productos
  },
  {
    path: 'reservas', component: Reservas
  },
  {
    path: 'contacto', component: Contact
  },
  {
    path: 'nosotros', component: Nosotros
  },
  {
    path: 'mision-y-vision', component: MisionVision
  },
  {
    path: 'historia', component: History
  },
  {
    path: 'equipo', component: Equipo
  },
  {
    path: '**', redirectTo: 'inicio'
  }
]