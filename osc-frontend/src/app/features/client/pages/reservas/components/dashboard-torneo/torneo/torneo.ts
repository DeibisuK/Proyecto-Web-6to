// torneo.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TorneosService } from '../services/torneos.service';
import { Torneo as TorneoModel, FiltrosTorneos } from '../models/torneo.models';
import { TorneoQuickViewModalComponent, InscripcionModalComponent } from '../modals';

interface DeporteTab {
  id_deporte: number;
  nombre: string;
  icono: string;
  count: number;
}

@Component({
  selector: 'app-torneo',
  standalone: true,
  imports: [CommonModule, TorneoQuickViewModalComponent, InscripcionModalComponent],
  templateUrl: './torneo.html',
  styleUrls: ['./torneo.css', '../shared-styles.css']
})
export class Torneo implements OnInit {
  private torneosService = inject(TorneosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: number = 0; // 0 = Todos
  filterStatus: string = 'todos';
  isLoading: boolean = true;
  error: string | null = null;

  // Modales
  showQuickViewModal: boolean = false;
  showInscripcionModal: boolean = false;
  torneoSeleccionado: TorneoModel | null = null;

  deportes: DeporteTab[] = [
    { id_deporte: 0, nombre: 'Todos', icono: '🏅', count: 0 }
  ];

  torneos: TorneoModel[] = [];
  torneosFiltrados: TorneoModel[] = [];

  ngOnInit(): void {
    this.loadTorneos();
  }

  selectTab(deporteId: number): void {
    this.activeTab = deporteId;
    this.aplicarFiltros();
  }

  setFilter(filter: string): void {
    this.filterStatus = filter;
    this.aplicarFiltros();
  }

  private loadTorneos(): void {
    this.isLoading = true;
    this.error = null;

    const filtros: FiltrosTorneos = {
      ordenar: 'fecha_desc'
    };

    this.torneosService.getTorneosPublicos(filtros).subscribe({
      next: (torneos) => {
        this.torneos = torneos;
        this.torneosFiltrados = torneos;
        this.actualizarContadoresDeportes();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
        this.error = 'No se pudieron cargar los torneos';
        this.isLoading = false;
      }
    });
  }

  private aplicarFiltros(): void {
    let resultado = this.torneos;

    // Filtrar por deporte
    if (this.activeTab !== 0) {
      resultado = resultado.filter(t => t.id_deporte === this.activeTab);
    }

    // Filtrar por estado
    if (this.filterStatus !== 'todos') {
      resultado = resultado.filter(t => t.estado === this.filterStatus);
    }

    this.torneosFiltrados = resultado;
  }

  private actualizarContadoresDeportes(): void {
    // Contar torneos por deporte
    const deportesMap = new Map<number, { nombre: string; icono: string; count: number }>();
    
    this.torneos.forEach(torneo => {
      if (!deportesMap.has(torneo.id_deporte)) {
        deportesMap.set(torneo.id_deporte, {
          nombre: torneo.nombre_deporte,
          icono: this.getIconoDeporte(torneo.nombre_deporte),
          count: 0
        });
      }
      const deporte = deportesMap.get(torneo.id_deporte)!;
      deporte.count++;
    });

    // Actualizar array de deportes
    this.deportes = [
      { id_deporte: 0, nombre: 'Todos', icono: '🏅', count: this.torneos.length }
    ];

    deportesMap.forEach((value, key) => {
      this.deportes.push({
        id_deporte: key,
        nombre: value.nombre,
        icono: value.icono,
        count: value.count
      });
    });
  }

  private getIconoDeporte(nombreDeporte: string): string {
    const iconos: Record<string, string> = {
      'Fútbol': '⚽',
      'Baloncesto': '🏀',
      'Pádel': '🎾',
      'Tenis': '🎾',
      'Voleibol': '🏐'
    };
    return iconos[nombreDeporte] || '🏅';
  }

  getColorEstado(estado: string): string {
    return this.torneosService.getColorEstado(estado);
  }

  getTextoEstado(estado: string): string {
    return this.torneosService.getTextoEstado(estado);
  }

  getRangoFechas(torneo: TorneoModel): string {
    return this.torneosService.getRangoFechas(torneo);
  }

  getPorcentajeOcupacion(torneo: TorneoModel): number {
    return this.torneosService.getPorcentajeOcupacion(torneo);
  }

  tieneCupos(torneo: TorneoModel): boolean {
    return this.torneosService.tieneCuposDisponibles(torneo);
  }

  quickView(torneo: TorneoModel, event: Event): void {
    event.stopPropagation();
    this.torneoSeleccionado = torneo;
    this.showQuickViewModal = true;
  }

  onQuickViewModalCerrar(): void {
    this.showQuickViewModal = false;
    this.torneoSeleccionado = null;
  }

  onQuickViewInscribirse(torneo: TorneoModel): void {
    this.showQuickViewModal = false;
    this.torneoSeleccionado = torneo;
    this.showInscripcionModal = true;
  }

  onInscripcionModalCerrar(): void {
    this.showInscripcionModal = false;
    // No limpiamos torneoSeleccionado aquí por si vuelve de quick view
  }

  onInscripcionExitosa(inscripcion: any): void {
    console.log('Inscripción exitosa:', inscripcion);
    this.showInscripcionModal = false;
    this.torneoSeleccionado = null;
    // Recargar torneos para actualizar cupos
    this.loadTorneos();
    // Mostrar mensaje de éxito (podrías usar un toast notification)
    alert('¡Inscripción exitosa! Te has inscrito al torneo.');
  }

  refreshLeagues(): void {
    this.loadTorneos();
  }

  viewTournamentDetail(torneo: TorneoModel): void {
    // Navegar al detalle del torneo (que mostrará los partidos)
    this.router.navigate(['../partido', torneo.id_torneo], { relativeTo: this.route });
  }

  viewClassification(torneo: TorneoModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // Navegar a la clasificación del torneo
    this.router.navigate(['../clasificacion', torneo.id_torneo], { relativeTo: this.route });
  }

  // Métodos de compatibilidad con el HTML existente
  isLive(estado: string): boolean {
    return estado === 'en_curso';
  }
}
