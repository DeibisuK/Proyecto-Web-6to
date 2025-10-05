import { Routes } from '@angular/router';
import { Home } from './client/features/home/home';
import { Contact } from './client/features/contact/contact';
import { Productos } from './client/features/productos/productos';
import { Reservas } from './client/features/reservas/reservas';
import { Nosotros } from './client/features/nosotros/nosotros';
import { MisionVision } from './client/features/nosotros/mision-vision/mision-vision';
import { Equipo } from './client/features/nosotros/equipo/equipo';
import { Historia } from './client/features/nosotros/historia/historia';
import { ArticuloCanchaComponent } from './client/features/articulos/articulo-cancha/articulo-cancha';
import { ArticuloEstudioComponent } from './client/features/articulos/articulo-estudio/articulo-estudio';
import { ArticuloPadelComponent } from './client/features/articulos/articulo-padel/articulo-padel';
import { CanchaFutbolCompletoComponent } from './client/features/articulos/cancha-futbol-completo/cancha-futbol-completo';
import { EstudioDeportivoCompletoComponent } from './client/features/articulos/estudio-deportivo-completo/estudio-deportivo-completo';
import { PadelBeneficiosCompletoComponent } from './client/features/articulos/padel-beneficios-completo/padel-beneficios-completo';

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
    path: 'nosotros', 
    component: Nosotros
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
    path: 'equipo', 
    component: Equipo
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
    path: '**', 
    redirectTo: '/inicio'
  }
];
