import { Routes } from "@angular/router";
import { Contact } from "./pages/contact/contact";
import { Home } from "./pages/home/pages/home-page/home-page";
import { MisionVision } from "./pages/informacion/nosotros/mision-vision/mision-vision";
import { Equipo } from "./pages/informacion/nosotros/equipo/equipo";
import { Historia } from "./pages/informacion/nosotros/historia/historia";
import { CanchaFutbolCompletoComponent } from "./pages/articulos/cancha-futbol-completo/cancha-futbol-completo";
import { EstudioDeportivoCompletoComponent } from "./pages/articulos/estudio-deportivo-completo/estudio-deportivo-completo";
import { PadelBeneficiosCompletoComponent } from "./pages/articulos/padel-beneficios-completo/padel-beneficios-completo";
import { TiendaPage } from "./pages/shop/pages/tienda-page/tienda-page";
import { DetalleProducto } from "./pages/shop/components/detalle-producto/detalle-producto";
import { CheckoutPage } from "./pages/shop/pages/checkout-page/checkout-page";
import { MisPedidosPage } from "./pages/shop/pages/mis-pedidos-page/mis-pedidos-page";
import { DetallePedidoPage } from "./pages/shop/pages/detalle-pedido-page/detalle-pedido-page";
import { PoliticaDePrivacidad } from "./pages/informacion/legal/politica-de-privacidad/politica-de-privacidad";
import { TerminosYCondiciones } from "./pages/informacion/legal/terminos-y-condiciones/terminos-y-condiciones";
import { PuntosLealtad } from "./pages/informacion/puntos-lealtad/puntos-lealtad";
import { ListEquipo } from "./pages/reservas/components/mis-equipos/list-equipo/list-equipo";
import { EquipoFormPage } from "./pages/reservas/components/mis-equipos/equipo-form-page/equipo-form-page";
import { Historial } from "./pages/reservas/components/historial/historial";
import { ListSedes } from "./pages/sedes/list-sedes/list-sedes";
import { SedesDetalle } from "./pages/sedes/sedes-detalle/sedes-detalle";
import { ListMetodo } from "./pages/user-profile/metodos-pago/list-metodo/list-metodo";
import { Perfil } from "./pages/user-profile/perfil/perfil";
import { ReservarCancha } from "./pages/reservas/components/reservar-cancha/reservar-cancha";
import { DetalleReservarCancha } from "./pages/reservas/components/detalle-reservar-cancha/detalle-reservar-cancha";
import { DashboardTorneo } from "./pages/reservas/components/dashboard-torneo/dashboard-torneo";
import { Torneo } from "./pages/reservas/components/dashboard-torneo/torneo/torneo";
import { Inscripciones } from "./pages/reservas/components/dashboard-torneo/inscripciones/inscripciones";
import { DetallePartidoComponent } from "./pages/reservas/components/dashboard-torneo/detalle-partido/detalle-partido";
import { ClasificacionComponent } from "./pages/reservas/components/dashboard-torneo/clasificacion/clasificacion";
import { BracketTorneoComponent } from "./pages/reservas/components/dashboard-torneo/bracket-torneo/bracket-torneo";
import { EstadisticasPartidoComponent } from "./pages/reservas/components/dashboard-torneo/estadisticas-partido/estadisticas-partido";
import { PlanesSuscripcionComponent } from "./pages/subscription/planes-suscripcion.component";
import { MiSuscripcionComponent } from "./pages/subscription/mi-suscripcion.component";
import { premiumGuard } from "@app/core/guards/subscription.guard";
import { BandejaNotificaciones } from "@app/shared/components/notificaciones/bandeja-notificaciones/bandeja-notificaciones";

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
      { path: 'checkout', component: CheckoutPage },
      { path: 'reservar-cancha/:id', component: DetalleReservarCancha}
    ]
  },
  // {
  //   path: 'carrito',
  //   component: CarritoComponent
  // },
  // Carrito ahora se muestra como overlay en el navbar, ya no necesita ruta propia
  {
    path: 'mis-pedidos',
    children: [
      { path: '', component: MisPedidosPage },
      { path: ':id_pedido', component: DetallePedidoPage }
    ]
  },
  {
    path: 'cashback-de-lealtad',
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
      { path: 'clasificacion/:id', component: ClasificacionComponent },
      { path: 'bracket/:id', component: BracketTorneoComponent },
      { path: 'estadisticas/:id', component: EstadisticasPartidoComponent }
    ],
    canActivate: [premiumGuard]
  },
  {
    path: 'planes',
    component: PlanesSuscripcionComponent
  },
  {
    path: 'mis-subscripciones',
    component: MiSuscripcionComponent
  },
  {
    path: 'notificaciones',
    component: BandejaNotificaciones
  }
]
