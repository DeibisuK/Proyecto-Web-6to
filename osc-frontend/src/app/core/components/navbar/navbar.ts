import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../../../auth/login/login';
import { RecuperarPassword } from '../../../auth/recuperar-password/recuperar-password';
import { CarritoComponent } from '../../../client/features/shop/components/carrito/carrito';
import { CarritoService } from '../../../client/features/shop/services/carrito.service';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SedeService } from '../../services/sede.service';
import { Sede } from '../../models/sede.model';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    Login,
    RecuperarPassword,
    FormsModule,
    CarritoComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None,
})
export class Navbar implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private authService = inject(AuthService);

  mostrarLogin = false;
  mostrarRecuperarPassword = false;
  searchTerm = '';
  showSidebar = false;
  showCart = false;
  cartItemCount = 0;

  user = this.authService.currentUser;
  isAdmin$!: Observable<boolean>;
  isArbitro$!: Observable<boolean>;

  dropdowns = {
    productos: false,
    reservas: false,
    sedes: false,
    nosotros: false,
    servicios: false,
    usuario: false,
  };

  sedesAgrupadas: { nombre: string; sedes: Sede[] }[] = [];

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private sedeService: SedeService
  ) {
    // Cierra el menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.showSidebar) {
        this.toggleSidebar();
      }
    });
  }

  ngOnInit() {
    // Suscribirse al observable de usuario y gestionarlo dentro de this.subscriptions
    this.subscriptions.add(this.authService.user$.subscribe((u) => (this.user = u)));
    this.isAdmin$ = this.authService.isAdmin$;
    this.isArbitro$ = this.authService.isArbitro$;
    // Comprobar la URL actual al iniciar (caso de carga inicial)
    const initialUrlTree = this.router.parseUrl(this.router.url || '');
    const initialOpen = initialUrlTree.queryParams['openLogin'] === 'true';
    if (initialOpen && !this.mostrarLogin) {
      this.abrirLoginModal();
      this.router.navigate([], { queryParams: { openLogin: null }, queryParamsHandling: 'merge' });
    }

    // Suscribirse al contador de items del carrito
    this.subscriptions.add(
      this.carritoService.obtenerCantidadTotal().subscribe((count) => {
        this.cartItemCount = count;
      })
    );

    // Scroll al inicio cuando se navega a una nueva ruta
    this.subscriptions.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );

    // Cargar sedes dinámicamente
    this.cargarSedes();
  }

  cargarSedes() {
        console.log('listar sedes de navbar');

    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        console.log('Sedes recibidas en navbar:', sedes);
        this.sedesAgrupadas = this.agruparSedesPorCiudad(sedes);
        console.log('Sedes agrupadas:', this.sedesAgrupadas);
      },
      error: (error) => {
        console.error('Error al cargar sedes en navbar:', error);
      },
    });
  }

  agruparSedesPorCiudad(sedes: Sede[]): { nombre: string; sedes: Sede[] }[] {
    const sedesActivas = sedes.filter(
      (s) => s.ciudad && (s.estado?.toLowerCase() === 'activo' || s.estado === 'Activo')
    );
    const ciudades = new Map<string, Sede[]>();

    sedesActivas.forEach((sede) => {
      const ciudad = sede.ciudad!;
      if (!ciudades.has(ciudad)) {
        ciudades.set(ciudad, []);
      }
      ciudades.get(ciudad)!.push(sede);
    });

    return Array.from(ciudades.entries()).map(([nombre, sedes]) => ({
      nombre,
      sedes,
    }));
  }

  ngOnDestroy() {
    // Restaura el scroll cuando se destruye el componente
    document.body.style.overflow = '';
    this.subscriptions.unsubscribe();
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns, show: boolean) {
    this.dropdowns[dropdown] = show;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleCart() {
    this.showCart = !this.showCart;
    if (this.showCart) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
  }

  closeCart() {
    this.showCart = false;
    document.body.classList.remove('cart-open');
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      console.log('Searching for:', this.searchTerm);
      // Aquí implementarías la lógica de búsqueda
    }
  }

  logout() {
    this.authService.logout();
  }

  abrirLoginModal() {
    this.mostrarLogin = true;
    document.body.classList.add('modal-open');
  }

  cerrarLoginModal() {
    this.mostrarLogin = false;
    document.body.classList.remove('modal-open');
  }

  abrirRecuperarPasswordModal() {
    this.mostrarLogin = false;
    this.mostrarRecuperarPassword = true;
    // El body ya tiene modal-open del modal anterior
  }

  cerrarRecuperarPasswordModal() {
    this.mostrarRecuperarPassword = false;
    document.body.classList.remove('modal-open');
  }

  volverAlLoginDesdeRecuperacion() {
    this.mostrarRecuperarPassword = false;
    this.mostrarLogin = true;
    // El body ya tiene modal-open
  }

  navegarSedesPorCiudad(ciudad: string) {
    this.router.navigate(['/todas-las-sedes'], {
      queryParams: { ciudad: ciudad },
    });
    this.toggleDropdown('sedes', false);
  }
}
