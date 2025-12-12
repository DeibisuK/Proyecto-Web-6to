import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TorneosService } from '../services/torneos.service';
import { Torneo } from '../models/torneo.models';

@Component({
  selector: 'app-bracket-torneo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bracket-torneo.html',
  styleUrls: ['./bracket-torneo.css', '../shared-styles.css']
})
export class BracketTorneoComponent implements OnInit, OnDestroy {
  private torneosService = inject(TorneosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  torneo: Torneo | null = null;
  bracket: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Panel lateral de estadísticas
  equipoSeleccionado: any = null;
  estadisticasEquipo: any = null;
  mostrarEstadisticas: boolean = false;

  ngOnInit(): void {
    const idTorneo = this.route.snapshot.paramMap.get('id');
    if (!idTorneo || isNaN(parseInt(idTorneo))) {
      this.error = 'ID de torneo inválido';
      this.isLoading = false;
      return;
    }

    this.cargarTorneo(parseInt(idTorneo));
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  cargarTorneo(idTorneo: number): void {
    this.isLoading = true;
    this.error = null;

    // Cargar información del torneo
    this.torneosService.getTorneosPublicos().subscribe({
      next: (torneos) => {
        // Convertir id_torneo a número para comparación (backend devuelve strings)
        this.torneo = torneos.find(t => Number(t.id_torneo) === idTorneo) || null;
        if (!this.torneo) {
          this.error = 'Torneo no encontrado';
          this.isLoading = false;
          return;
        }

        // Generar bracket
        this.generarBracket();
      },
      error: (error) => {
        console.error('Error al cargar torneo:', error);
        this.error = 'Error al cargar información del torneo';
        this.isLoading = false;
      }
    });
  }

  generarBracket(): void {
    if (!this.torneo) return;

    // Cargar equipos inscritos reales del backend
    this.torneosService.getEquiposInscritos(this.torneo.id_torneo).subscribe({
      next: (equiposInscritos) => {
        if (equiposInscritos.length === 0) {
          this.bracket = [];
          this.isLoading = false;
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

        // Mezclar aleatoriamente
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

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipos inscritos:', error);
        this.bracket = [];
        this.isLoading = false;
      }
    });
  }

  obtenerNombreRonda(indiceRonda: number, totalRondas: number): string {
    const rondaDesdeElFinal = totalRondas - indiceRonda;
    if (rondaDesdeElFinal === 1) return 'Final';
    if (rondaDesdeElFinal === 2) return 'Semifinal';
    if (rondaDesdeElFinal === 3) return 'Cuartos de Final';
    if (rondaDesdeElFinal === 4) return 'Octavos de Final';
    return `Ronda ${indiceRonda + 1}`;
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  verEstadisticasEquipo(equipo: any, event: Event): void {
    event.stopPropagation();
    if (!equipo || !this.torneo) return;

    this.equipoSeleccionado = equipo;
    this.mostrarEstadisticas = true;

    // Cargar estadísticas del equipo en el torneo
    this.torneosService.getClasificacionTorneo(this.torneo.id_torneo).subscribe({
      next: (clasificacion) => {
        this.estadisticasEquipo = clasificacion.find(c => c.id_equipo === equipo.id);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.estadisticasEquipo = null;
      }
    });
  }

  cerrarEstadisticas(): void {
    this.mostrarEstadisticas = false;
    this.equipoSeleccionado = null;
    this.estadisticasEquipo = null;
  }

  verDetallePartido(partido: any): void {
    if (typeof partido.id_partido === 'number' && partido.id_partido > 0) {
      this.router.navigate(['../partido', partido.id_partido], { relativeTo: this.route });
    } else {
      alert('Este partido aún no ha sido programado por un administrador.');
    }
  }

  esPartidoReal(partido: any): boolean {
    const tieneIdReal = typeof partido.id_partido === 'number' && partido.id_partido > 0;
    const tieneAmbosEquipos = partido.equipo1 && partido.equipo2;
    return tieneIdReal || tieneAmbosEquipos;
  }

  goBack(): void {
    this.router.navigate(['/dashboard-torneo/torneos']);
  }
}
