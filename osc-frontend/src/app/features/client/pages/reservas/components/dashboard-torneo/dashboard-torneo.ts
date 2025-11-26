import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TorneosService } from './services/torneos.service';
import { EstadisticasUsuario } from './models/torneo.models';

@Component({
  selector: 'app-dashboard-torneo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard-torneo.html',
  styleUrls: ['./dashboard-torneo.css', './shared-styles.css']
})
export class DashboardTorneo implements OnInit {
  private torneosService = inject(TorneosService);

  activeTab: string = 'torneos';
  searchQuery: string = '';
  showStats: boolean = false;
  selectedSport: string | null = null;
  loading: boolean = true;
  error: string | null = null;

  stats: EstadisticasUsuario = {
    inscripcionesActivas: 0,
    proximosPartidos: 0,
    torneosGanados: 0,
    victorias: 0
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSearch(): void {
    console.log('Buscando:', this.searchQuery);
    // La búsqueda se manejará en el componente hijo (torneo.component)
  }

  openInscriptionModal(): void {
    console.log('Abriendo modal de inscripción');
    // TODO: Implementar modal de nueva inscripción
  }

  filterBySport(sport: string | null): void {
    this.selectedSport = this.selectedSport === sport ? null : sport;
    console.log('Filtrando por deporte:', this.selectedSport);
    // Comunicar el filtro al componente hijo a través del servicio
    this.torneosService.setFiltroDeporte(this.selectedSport);
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.torneosService.getEstadisticasUsuario().subscribe({
      next: (estadisticas) => {
        this.stats = estadisticas;
        this.showStats = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = 'No se pudieron cargar las estadísticas';
        this.loading = false;
        // Mostrar estadísticas en 0 en caso de error
        this.showStats = true;
      }
    });
  }

  reloadStats(): void {
    this.loadDashboardData();
  }
}
