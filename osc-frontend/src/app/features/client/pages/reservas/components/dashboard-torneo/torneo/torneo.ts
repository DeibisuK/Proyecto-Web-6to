import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TorneosService } from '../services/torneos.service';
import { EquiposService, type EquipoUsuario } from '../services/equipos.service';
import { Torneo as TorneoModel, FiltrosTorneos } from '../models/torneo.models';
import { TorneoQuickViewModalComponent, InscripcionModalComponent } from '../modals';

@Component({
  selector: 'app-torneo',
  standalone: true,
  imports: [CommonModule, TorneoQuickViewModalComponent, InscripcionModalComponent],
  templateUrl: './torneo.html',
  styleUrls: ['./torneo.css', '../shared-styles.css']
})
export class Torneo implements OnInit {
  private torneosService = inject(TorneosService);
  private equiposService = inject(EquiposService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  filterStatus: string = 'todos';
  deporteFiltrado: string | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  // Modales
  showQuickViewModal: boolean = false;
  showInscripcionModal: boolean = false;
  torneoSeleccionado: TorneoModel | null = null;

  // Equipos del usuario
  equiposDisponibles: EquipoUsuario[] = [];
  equiposDelTorneo: EquipoUsuario[] = [];

  torneos: TorneoModel[] = [];
  torneosFiltrados: TorneoModel[] = [];

  ngOnInit(): void {
    this.loadTorneos();
    this.loadEquipos();

    // Suscribirse al filtro de deporte del sidebar
    this.torneosService.filtroDeporte$.subscribe(deporte => {
      this.deporteFiltrado = deporte;
      this.aplicarFiltros();
    });
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar torneos:', err);
        this.error = 'No se pudieron cargar los torneos';
        this.isLoading = false;
      }
    });
  }

  /**
   * Carga los equipos del usuario
   */
  private loadEquipos(): void {
    this.equiposService.getEquiposUsuario().subscribe({
      next: (equipos) => {
        console.log('✅ Equipos cargados:', equipos);
        this.equiposDisponibles = equipos;
      },
      error: (err) => {
        console.error('❌ Error al cargar equipos:', err);
        // No mostramos error al usuario, solo no tendrá equipos disponibles
      }
    });
  }

  private aplicarFiltros(): void {
    let resultado = this.torneos;

    // Filtrar por deporte (del sidebar)
    if (this.deporteFiltrado) {
      console.log('🔍 Filtrando por:', this.deporteFiltrado);
      console.log('🎯 Torneos disponibles:', this.torneos.map(t => ({ nombre: t.nombre, deporte: t.nombre_deporte })));

      resultado = resultado.filter(t => {
        const nombreDeporte = t.nombre_deporte?.toLowerCase() || '';
        const filtro = this.deporteFiltrado!.toLowerCase();

        // Mapeo de nombres: basket -> baloncesto, padel -> pádel
        const deportesEquivalentes: { [key: string]: string[] } = {
          'basket': ['baloncesto', 'basketball', 'basket'],
          'futbol': ['fútbol', 'futbol', 'soccer'],
          'padel': ['pádel', 'padel'],
          'tenis': ['tenis', 'tennis']
        };

        // Verificar si el filtro tiene equivalentes
        const equivalentes = deportesEquivalentes[filtro] || [filtro];
        const match = equivalentes.some(eq => nombreDeporte.includes(eq));

        console.log(`  ${t.nombre} (${nombreDeporte}) -> ${match ? '✅' : '❌'}`);
        return match;
      });

      console.log('✅ Torneos filtrados:', resultado.length);
    }

    // Filtrar por estado
    if (this.filterStatus !== 'todos') {
      resultado = resultado.filter(t => t.estado === this.filterStatus);
    }

    this.torneosFiltrados = resultado;
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

    console.log('🏆 Torneo seleccionado:', torneo);
    console.log('📋 Equipos disponibles (TODOS):', this.equiposDisponibles);
    console.log('🔍 Filtrando por id_deporte:', torneo.id_deporte);

    // Filtrar equipos por deporte del torneo
    this.equiposDelTorneo = this.equiposService.filtrarPorDeporte(
      this.equiposDisponibles,
      torneo.id_deporte
    );

    console.log('✅ Equipos filtrados para este torneo:', this.equiposDelTorneo);

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
    this.loadEquipos();
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
