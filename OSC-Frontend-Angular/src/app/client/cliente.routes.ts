import { Routes } from "@angular/router";
import { Contact } from "./features/contact/contact";
import { Home } from "./features/home/pages/home-page/home-page";
import { Productos } from "./features/productos/productos";
import { Reservas } from "./features/reservas/reservas";
import { MisionVision } from "./features/informacion/nosotros/mision-vision/mision-vision";
import { Equipo } from "./features/informacion/nosotros/equipo/equipo";
import { Historia } from "./features/informacion/nosotros/historia/historia";

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
    path: 'mision-y-vision', component: MisionVision
  },
  {
    path: 'historia', component: Historia
  },
  {
    path: 'equipo', component: Equipo
  },
  {
    path: '**', redirectTo: 'inicio'
  }
]