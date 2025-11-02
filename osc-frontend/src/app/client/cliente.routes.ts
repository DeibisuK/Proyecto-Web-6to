import { Routes } from "@angular/router";
import { Contact } from "./features/contact/contact";
import { Home } from "./features/home/pages/home-page/home-page";
//import { Productos } from "./features/productos/productos";
import { MisionVision } from "./features/informacion/nosotros/mision-vision/mision-vision";
import { Equipo } from "./features/informacion/nosotros/equipo/equipo";
import { Historia } from "./features/informacion/nosotros/historia/historia";
import { CanchaFutbolCompletoComponent } from "./features/articulos/cancha-futbol-completo/cancha-futbol-completo";
import { EstudioDeportivoCompletoComponent } from "./features/articulos/estudio-deportivo-completo/estudio-deportivo-completo";
import { PadelBeneficiosCompletoComponent } from "./features/articulos/padel-beneficios-completo/padel-beneficios-completo";
import { TiendaPage } from "./features/shop/pages/tienda-page/tienda-page";
import { DetalleProducto } from "./features/shop/components/detalle-producto/detalle-producto";
// import { CarritoComponent } from "./features/shop/components/carrito/carrito"; // Ya no se usa, el carrito ahora es un componente React en el navbar
import { PoliticaDePrivacidad } from "./features/informacion/legal/politica-de-privacidad/politica-de-privacidad";
import { TerminosYCondiciones } from "./features/informacion/legal/terminos-y-condiciones/terminos-y-condiciones";
import { PuntosLealtad } from "./features/informacion/puntos-lealtad/puntos-lealtad";
import { ListEquipo } from "./features/reservas/components/mis-equipos/list-equipo/list-equipo";
import { EquipoFormPage } from "./features/reservas/components/mis-equipos/equipo-form-page/equipo-form-page";
import { Historial } from "./features/reservas/components/historial/historial";
import { ListSedes } from "./features/sedes/list-sedes/list-sedes";
import { SedesDetalle } from "./features/sedes/sedes-detalle/sedes-detalle";
import { ListMetodo } from "./features/user-profile/metodos-pago/list-metodo/list-metodo";
import { Perfil } from "./features/user-profile/perfil/perfil";
import { ReservarCancha } from "./features/reservas/components/reservar-cancha/reservar-cancha";
import { DetalleReservarCancha } from "./features/reservas/components/detalle-reservar-cancha/detalle-reservar-cancha";
import { DashboardTorneo } from "./features/reservas/components/dashboard-torneo/dashboard-torneo";
import { Torneo } from "./features/reservas/components/dashboard-torneo/torneo/torneo";
import { Inscripciones } from "./features/reservas/components/dashboard-torneo/inscripciones/inscripciones";
import { DetallePartidoComponent } from "./features/reservas/components/dashboard-torneo/detalle-partido/detalle-partido";
import { ClasificacionComponent } from "./features/reservas/components/dashboard-torneo/clasificacion/clasificacion";

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
  // {
  //   path: 'productos',
  //   component: Productos
  // },
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
      { path: 'producto/:id', component: DetalleProducto},
      { path: 'reservar-cancha/:id', component: DetalleReservarCancha}
    ]
  },
  // {
  //   path: 'carrito',
  //   component: CarritoComponent
  // },
  // Carrito ahora se muestra como overlay en el navbar, ya no necesita ruta propia
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
    path: 'historial-partidos', component: Historial
  },
  {
    path: 'crear-equipo', component: EquipoFormPage
  },
  {
    path: 'editar-equipo/:id', component: EquipoFormPage
  },
  {
    path: 'mis-equipos', component: ListEquipo
  },
  {
    path: 'sede/:id', component: SedesDetalle
  },
  {
    path: 'todas-las-sedes', component: ListSedes
  },

  {
    path: 'metodos-de-pago', component: ListMetodo
  },
  {
    path: 'ver-perfil', component: Perfil
  },
  {
    path: 'reservar-cancha',
    component: ReservarCancha
  },
  {
    path: 'dashboard-torneo',
    component: DashboardTorneo,
    children: [
      { path: '', redirectTo: 'torneos', pathMatch: 'full' },
      { path: 'torneos', component: Torneo },
      { path: 'inscripciones', component: Inscripciones },
      { path: 'partido/:id', component: DetallePartidoComponent },
      { path: 'clasificacion/:id', component: ClasificacionComponent }
    ]
  }
]
