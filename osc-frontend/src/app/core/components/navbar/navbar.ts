import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../../../auth/login/login';
import { RecuperarPassword } from '../../../auth/recuperar-password/recuperar-password';
import { ReactWrapperComponent } from '../../../shared/react-wrapper/react-wrapper.component';
import Cart from '../../react-components/carrito/cart';
import { CarritoService } from '../../../client/features/shop/services/carrito.service';
import { setCarritoServiceInstance } from '../../services/carrito-bridge.service';
import { setRouterInstance } from '../../services/router-bridge.service';
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
    ReactWrapperComponent,
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
  showCart:boolean = false;
  cartItemCount = 0;

  // Componente React del carrito
  CartComponent = Cart;

  // Props del carrito - creadas una sola vez para evitar re-renderizados
  cartProps = {
    mode: 'sidebar' as const,
    onClose: () => this.closeCart()
  };

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
    setCarritoServiceInstance(this.carritoService);
    setRouterInstance(this.router);

    this.subscriptions.add(
      this.authService.user$.subscribe((u) => {
        this.user = u;

        if (u) {
          this.carritoService.cargarCarrito(u.uid).subscribe();
        } else {
          this.carritoService.limpiarEstadoLocal();
        }
      })
    );

    this.isAdmin$ = this.authService.isAdmin$;
    this.isArbitro$ = this.authService.isArbitro$;

    const initialUrlTree = this.router.parseUrl(this.router.url || '');
    const initialOpen = initialUrlTree.queryParams['openLogin'] === 'true';
    if (initialOpen && !this.mostrarLogin) {
      this.abrirLoginModal();
      this.router.navigate([], { queryParams: { openLogin: null }, queryParamsHandling: 'merge' });
    }

    this.subscriptions.add(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        const urlTree = this.router.parseUrl(this.router.url || '');
        const shouldOpenLogin = urlTree.queryParams['openLogin'] === 'true';

        if (shouldOpenLogin && !this.mostrarLogin) {
          this.abrirLoginModal();
          this.router.navigate([], {
            queryParams: { openLogin: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );

    this.subscriptions.add(
      this.carritoService.obtenerCantidadTotal().subscribe((count) => {
        this.cartItemCount = count;
      })
    );

    this.cargarSedes();
  }

  cargarSedes() {

    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.sedesAgrupadas = this.agruparSedesPorCiudad(sedes);
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
  }

  closeCart() {
    this.showCart = false;
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
