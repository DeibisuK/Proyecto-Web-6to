import { Routes } from '@angular/router';
import { Home } from './client/features/home/pages/home-page/home-page';
import { Contact } from './client/features/contact/contact';
import { Productos } from './client/features/productos/productos';
import { Reservas } from './client/features/reservas/reservas';
import { CanchaFutbolCompletoComponent } from './client/features/articulos/cancha-futbol-completo/cancha-futbol-completo';
import { EstudioDeportivoCompletoComponent } from './client/features/articulos/estudio-deportivo-completo/estudio-deportivo-completo';
import { PadelBeneficiosCompletoComponent } from './client/features/articulos/padel-beneficios-completo/padel-beneficios-completo';
import { TiendaPage } from './client/features/shop/pages/tienda-page/tienda-page';
import { DetalleProducto } from './client/features/shop/components/detalle-producto/detalle-producto';
import { CarritoComponent } from './client/features/shop/components/carrito/carrito';
import { MisionVision } from './client/features/informacion/nosotros/mision-vision/mision-vision';
import { Historia } from './client/features/informacion/nosotros/historia/historia';
import { Equipo } from './client/features/informacion/nosotros/equipo/equipo';
import { PoliticaDePrivacidad } from './client/features/informacion/legal/politica-de-privacidad/politica-de-privacidad';
import { TerminosYCondiciones } from './client/features/informacion/legal/terminos-y-condiciones/terminos-y-condiciones';
import { PuntosLealtad } from './client/features/informacion/puntos-lealtad/puntos-lealtad';


export const routes: Routes = [
  {
    path: '', 
    redirectTo: '/inicio', 
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
    path: 'carrito', component: CarritoComponent
  },
  {
    path: 'puntos-de-lealtad', component: PuntosLealtad
  },
  {
    path: 'politica-de-privacidad', component: PoliticaDePrivacidad
  },
  {
    path: 'terminos-y-condiciones', component: TerminosYCondiciones
  },
  {
    path: '**', 
    redirectTo: '/inicio'
  }
];
