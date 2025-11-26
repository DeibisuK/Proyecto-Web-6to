import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasificacionService } from '../../../../shared/services/clasificacion.service';
import { Clasificacion } from '../../../../shared/interfaces/match.interfaces';

@Component({
  selector: 'app-clasificacion-torneo',
  imports: [CommonModule],
  templateUrl: './clasificacion-torneo.html',
  styleUrl: './clasificacion-torneo.css',
})
export class ClasificacionTorneo implements OnInit {
  @Input() idTorneo!: number;
  @Input() idFase?: number;
  @Input() idGrupo?: number;

  private clasificacionService = inject(ClasificacionService);

  clasificacion = signal<Clasificacion[]>([]);
  cargando = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarClasificacion();
  }

  cargarClasificacion(): void {
    this.cargando.set(true);
    this.clasificacionService.getClasificacionByTorneo(
      this.idTorneo,
      this.idFase,
      this.idGrupo
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.clasificacion.set(response.data);
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar clasificación:', error);
        this.cargando.set(false);
      }
    });
  }

  recalcularClasificacion(): void {
    if (!confirm('¿Recalcular la clasificación del torneo?')) return;

    this.cargando.set(true);
    this.clasificacionService.recalcularClasificacion({
      id_torneo: this.idTorneo,
      id_fase: this.idFase,
      id_grupo: this.idGrupo
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarClasificacion();
          alert('Clasificación recalculada exitosamente');
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al recalcular:', error);
        alert('Error al recalcular la clasificación');
        this.cargando.set(false);
      }
    });
  }
}
