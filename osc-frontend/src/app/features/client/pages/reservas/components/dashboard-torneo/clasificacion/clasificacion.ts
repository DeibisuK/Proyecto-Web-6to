import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TorneosService } from '../services/torneos.service';
import { Clasificacion, Torneo } from '../models/torneo.models';

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clasificacion.html',
  styleUrls: ['./clasificacion.css', '../shared-styles.css']
})
export class ClasificacionComponent implements OnInit {
  private torneosService = inject(TorneosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estado del componente
  clasificacion: Clasificacion[] = [];
  torneo: Torneo | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  mostrarLeyenda: boolean = false;

  // Grupos únicos para agrupar equipos
  grupos: string[] = [];

  ngOnInit(): void {
    const idTorneo = this.route.snapshot.paramMap.get('id');

    if (!idTorneo || isNaN(parseInt(idTorneo))) {
      this.error = 'ID de torneo inválido';
      this.isLoading = false;
      return;
    }

    this.loadClasificacion(parseInt(idTorneo));
  }

  loadClasificacion(idTorneo: number): void {
    this.isLoading = true;
    this.error = null;

    // Primero cargar información del torneo
    this.torneosService.getTorneosPublicos().subscribe({
      next: (torneos) => {
        // Convertir id_torneo a número para comparación (backend devuelve strings)
        this.torneo = torneos.find(t => Number(t.id_torneo) === idTorneo) || null;

        if (!this.torneo) {
          this.error = 'Torneo no encontrado';
          this.isLoading = false;
          return;
        }

        // Luego cargar clasificación
        this.torneosService.getClasificacionTorneo(idTorneo).subscribe({
          next: (clasificacion) => {
            this.clasificacion = clasificacion;
            this.extractGrupos();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al cargar clasificación:', error);
            this.error = 'No se pudo cargar la clasificación del torneo';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar torneo:', error);
        this.error = 'Error al cargar información del torneo';
        this.isLoading = false;
      }
    });
  }

  extractGrupos(): void {
    const gruposUnicos = new Set<string>();
    this.clasificacion.forEach(equipo => {
      if (equipo.nombre_grupo) {
        gruposUnicos.add(equipo.nombre_grupo);
      }
    });
    this.grupos = Array.from(gruposUnicos).sort();
  }

  getEquiposPorGrupo(nombreGrupo: string): Clasificacion[] {
    return this.clasificacion.filter(e => e.nombre_grupo === nombreGrupo);
  }

  getEquiposSinGrupo(): Clasificacion[] {
    return this.clasificacion.filter(e => !e.nombre_grupo);
  }

  tieneGrupos(): boolean {
    return this.grupos.length > 0;
  }

  goBack(): void {
    this.router.navigate(['/dashboard-torneo/torneos']);
  }

  getPositionClass(posicion: number): string {
    // Top 4 posiciones califican a playoffs/siguiente fase
    if (posicion <= 4) return 'clasificacion';
    // Últimas 2 posiciones en zona de eliminación
    if (posicion >= this.clasificacion.length - 1) return 'eliminacion';
    return '';
  }

  getPositionBadgeClass(posicion: number): string {
    if (posicion === 1) return 'badge-gold';
    if (posicion === 2) return 'badge-silver';
    if (posicion === 3) return 'badge-bronze';
    if (posicion <= 4) return 'badge-success';
    if (posicion >= this.clasificacion.length - 1) return 'badge-danger';
    return 'badge-secondary';
  }
}
