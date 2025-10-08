import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../../../acceso/login/login';
import { CarritoComponent } from '../../../client/features/shop/components/carrito/carrito';
import { CarritoService } from '../../../client/features/shop/services/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Login, FormsModule, CarritoComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None
})
export class Navbar implements OnInit, OnDestroy {
  mostrarLogin = false;
  searchTerm = '';
  showSidebar = false;
  showCart = false;
  cartItemCount = 0;
  private subscriptions: Subscription = new Subscription();

  dropdowns = {
    productos: false,
    reservas: false,
    sedes: false,
    nosotros: false,
    servicios: false
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

    // Suscribirse al contador de items del carrito
    this.subscriptions.add(
      this.carritoService.obtenerCantidadTotal().subscribe(count => {
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

  abrirLoginModal() {
    this.mostrarLogin = true;
    document.body.classList.add('modal-open');
  }

  cerrarLoginModal() {
    this.mostrarLogin = false;
    document.body.classList.remove('modal-open');
  }
}
