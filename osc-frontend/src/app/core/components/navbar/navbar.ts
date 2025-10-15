import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../../../auth/login/login';
import { RecuperarPassword } from '../../../auth/recuperar-password/recuperar-password';
import { CarritoComponent } from '../../../client/features/shop/components/carrito/carrito';
import { CarritoService } from '../../../client/features/shop/services/carrito.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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

  dropdowns = {
    productos: false,
    reservas: false,
    sedes: false,
    nosotros: false,
    servicios: false,
  };

  constructor(private carritoService: CarritoService) {
    // Cierra el menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.showSidebar) {
        this.toggleSidebar();
      }
    });
  }

  ngOnInit() {
    console.log('Navbar e-commerce loaded');

    this.authService.user$.subscribe((u) => (this.user = u));
    // Suscribirse al contador de items del carrito
    this.subscriptions.add(
      console.log('Usuario actual:', this.user?.providerData);
      this.carritoService.obtenerCantidadTotal().subscribe((count) => {
        this.cartItemCount = count;
      })
    );
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
}
