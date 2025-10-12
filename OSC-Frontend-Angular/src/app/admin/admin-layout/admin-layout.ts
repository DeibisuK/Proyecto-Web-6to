import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../components/header/header';
import { filter } from 'rxjs/operators';
import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule, CommonModule, Navbar, Header],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  isCollapsed = false;
  currentPageTitle = 'Dashboard';

  private routeTitles: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'usuarios': 'Gestión de Usuarios',
    'productos': 'Gestión de Productos',
    'reportes': 'Reportes y Estadísticas',
    'pedidos': 'Pedidos y Ventas',
    'canchas': 'Gestión de Canchas',
    'sedes': 'Gestión de Sedes',
    'reservas': 'Gestión de Reservas',
    'torneos': 'Torneos y Campeonatos',
    'historial': 'Historial de Partidos',
    'equipos': 'Gestión de Equipos',
    'partidos': 'Gestión de Partidos',
    'anuncios': 'Gestión de Anuncios'
  };

  constructor(private router: Router) {
    // Detectar cambios de ruta para actualizar el título
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const route = event.url.split('/').pop() || 'dashboard';
      this.currentPageTitle = this.routeTitles[route] || 'Dashboard';
    });
  }

  onSidebarToggle(isCollapsed: boolean) {
    this.isCollapsed = isCollapsed;
  }
}
