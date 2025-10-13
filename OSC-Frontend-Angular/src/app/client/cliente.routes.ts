import { Routes } from "@angular/router";
import { Contact } from "./features/contact/contact";
import { Home } from "./features/home/pages/home-page/home-page";
import { Productos } from "./features/productos/productos";
import { Reservas } from "./features/reservas/reservas";
import { MisionVision } from "./features/informacion/nosotros/mision-vision/mision-vision";
import { Equipo } from "./features/informacion/nosotros/equipo/equipo";
import { Historia } from "./features/informacion/nosotros/historia/historia";
import { CanchaFutbolCompletoComponent } from "./features/articulos/cancha-futbol-completo/cancha-futbol-completo";
import { EstudioDeportivoCompletoComponent } from "./features/articulos/estudio-deportivo-completo/estudio-deportivo-completo";
import { PadelBeneficiosCompletoComponent } from "./features/articulos/padel-beneficios-completo/padel-beneficios-completo";
import { TiendaPage } from "./features/shop/pages/tienda-page/tienda-page";
import { DetalleProducto } from "./features/shop/components/detalle-producto/detalle-producto";
import { CarritoComponent } from "./features/shop/components/carrito/carrito";
import { PoliticaDePrivacidad } from "./features/informacion/legal/politica-de-privacidad/politica-de-privacidad";
import { TerminosYCondiciones } from "./features/informacion/legal/terminos-y-condiciones/terminos-y-condiciones";
import { PuntosLealtad } from "./features/informacion/puntos-lealtad/puntos-lealtad";
import { Prueba } from "../core/components/prueba/prueba";

export const clienteRoutes: Routes = [
  {
    path: '', 
    redirectTo: 'inicio', 
    pathMatch: 'full'
  },
  {
    path: 'inicio', 
    component: Home
  },
  {
    path: 'productos', 
    component: Productos
  },
  {
    path: 'reservas', 
    component: Reservas
  },
  {
    path: 'contacto', 
    component: Contact
  },
  {
    path: 'articulos/cancha-futbol', 
    component: CanchaFutbolCompletoComponent
  },
  {
    path: 'articulos/estudio-deportivo', 
    component: EstudioDeportivoCompletoComponent
  },
  {
    path: 'articulos/padel-beneficios', 
    component: PadelBeneficiosCompletoComponent
  },
  {
    path: 'mision-y-vision', 
    component: MisionVision
  },
  {
    path: 'historia', 
    component: Historia
  },
  {
    path: 'nuestro-equipo', 
    component: Equipo
  },
  {
    path: 'tienda',
    children: [
      { path: '', component: TiendaPage },
      { path: 'producto/:id', component: DetalleProducto}
    ]
  },
  {
    path: 'carrito', 
    component: CarritoComponent
  },
  {
    path: 'puntos-de-lealtad', 
    component: PuntosLealtad
  },
  {
    path: 'politica-de-privacidad', 
    component: PoliticaDePrivacidad
  },
  {
    path: 'terminos-y-condiciones', 
    component: TerminosYCondiciones
  },
  {
    path: 'prueba',
    component: Prueba
  }
]