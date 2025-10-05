import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../../../acceso/login/login';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Login, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None
})
export class Navbar implements OnInit {
  mostrarLogin = false;
  searchTerm = '';
  showSidebar = false;
  
  dropdowns = {
    productos: false,
    reservas: false,
    nosotros: false,
    servicios: false
  };

  ngOnInit() {
    console.log('Navbar e-commerce loaded');
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns, show: boolean) {
    this.dropdowns[dropdown] = show;
  }

  toggleSidebar() {
    this.showSidebar = true;
  }

  closeSidebar() {
    this.showSidebar = false;
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
