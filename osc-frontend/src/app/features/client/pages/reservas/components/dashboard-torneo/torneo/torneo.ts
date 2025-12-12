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
  showBracketModal: boolean = false;
  torneoSeleccionado: TorneoModel | null = null;

  // Bracket
  bracket: any[] = [];

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
    let equiposFiltrados = this.equiposService.filtrarPorDeporte(
      this.equiposDisponibles,
      torneo.id_deporte
    );

    console.log('✅ Equipos filtrados por deporte:', equiposFiltrados);

    // Cargar equipos ya inscritos en este torneo y filtrarlos
    this.torneosService.getEquiposInscritos(torneo.id_torneo).subscribe({
      next: (equiposInscritos) => {
        console.log('📋 Equipos ya inscritos:', equiposInscritos);

        // Filtrar equipos que ya están inscritos
        const idsInscritos = equiposInscritos.map((e: any) => e.id_equipo);
        this.equiposDelTorneo = equiposFiltrados.filter(
          equipo => !idsInscritos.includes(equipo.id_equipo)
        );

        console.log('✅ Equipos disponibles para inscripción:', this.equiposDelTorneo);
        this.showInscripcionModal = true;
      },
      error: (err) => {
        console.error('❌ Error al cargar equipos inscritos:', err);
        // Si falla, mostrar todos los equipos filtrados por deporte
        this.equiposDelTorneo = equiposFiltrados;
        this.showInscripcionModal = true;
      }
    });
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
    // Recargar equipos también por si hay cambios
    this.loadEquipos();
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

  viewBracket(torneo: TorneoModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.torneoSeleccionado = torneo;
    this.generarBracket(torneo);
    this.showBracketModal = true;
  }

  closeBracketModal(): void {
    this.showBracketModal = false;
    this.bracket = [];
  }

  /**
   * Ver detalles de un partido específico
   */
  verDetallePartido(partido: any): void {
    // Si tiene id_partido real de BD, navegar
    if (typeof partido.id_partido === 'number' && partido.id_partido > 0) {
      this.router.navigate(['/client/reservas/dashboard-torneo/partido', partido.id_partido]);
    } else {
      // Si no tiene id_partido, mostrar mensaje que aún no está programado
      alert('Este partido aún no ha sido programado por un administrador.');
    }
  }

  /**
   * Verifica si un partido tiene ambos equipos asignados (puede mostrar detalles)
   */
  esPartidoReal(partido: any): boolean {
    // Mostrar botón si tiene id_partido de BD O si tiene ambos equipos asignados
    const tieneIdReal = typeof partido.id_partido === 'number' && partido.id_partido > 0;
    const tieneAmbosEquipos = partido.equipo1 && partido.equipo2;
    return tieneIdReal || tieneAmbosEquipos;
  }

  generarBracket(torneo: TorneoModel): void {
    // Cargar equipos inscritos reales del backend
    this.torneosService.getEquiposInscritos(torneo.id_torneo).subscribe({
      next: (equiposInscritos) => {
        if (equiposInscritos.length === 0) {
          this.bracket = [];
          return;
        }

        // Usar equipos reales
        const equipos = equiposInscritos.map((eq, index) => ({
          id: eq.id_equipo,
          nombre: eq.nombre_equipo,
          logo: eq.logo_url,
          seed: index + 1
        }));

        // Calcular número de rondas basado en potencia de 2 más cercana
        const cantidadEquipos = Math.pow(2, Math.ceil(Math.log2(equipos.length)));
        const numRondas = Math.log2(cantidadEquipos);

        // Mezclar aleatoriamente para no tener preferencias
        const equiposMezclados: (typeof equipos[0] | null)[] = this.shuffleArray([...equipos]);

        // Rellenar con equipos TBD si es necesario
        while (equiposMezclados.length < cantidadEquipos) {
          equiposMezclados.push(null);
        }

        this.bracket = [];

        // Crear estructura de bracket
        for (let ronda = 0; ronda < numRondas; ronda++) {
          const partidosPorRonda = Math.pow(2, numRondas - ronda - 1);
          const rondaNombre = this.obtenerNombreRonda(ronda, numRondas);

          const partidos = [];
          for (let i = 0; i < partidosPorRonda; i++) {
            if (ronda === 0) {
              // Primera ronda: asignar equipos
              const equipo1 = equiposMezclados[i * 2];
              const equipo2 = equiposMezclados[i * 2 + 1];
              partidos.push({
                id: `r${ronda}-p${i}`,
                equipo1: equipo1,
                equipo2: equipo2,
                ganador: null
              });
            } else {
              // Rondas siguientes: esperar ganadores
              partidos.push({
                id: `r${ronda}-p${i}`,
                equipo1: null,
                equipo2: null,
                ganador: null
              });
            }
          }

          this.bracket.push({
            ronda: ronda,
            nombre: rondaNombre,
            partidos: partidos
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar equipos inscritos:', error);
        this.bracket = [];
      }
    });
  }

  obtenerNombreRonda(indiceRonda: number, totalRondas: number): string {
    const rondaDesdeElFinal = totalRondas - indiceRonda;
    if (rondaDesdeElFinal === 1) return 'Final';
    if (rondaDesdeElFinal === 2) return 'Semifinal';
    if (rondaDesdeElFinal === 3) return 'Cuartos';
    if (rondaDesdeElFinal === 4) return 'Octavos';
    return `Ronda ${indiceRonda + 1}`;
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Métodos de compatibilidad con el HTML existente
  isLive(estado: string): boolean {
    return estado === 'en_curso';
  }
}
