import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Torneo } from '../models/torneo.models';
import { TorneosService } from '../services/torneos.service';

@Component({
  selector: 'app-torneo-quick-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneo-quick-view-modal.html',
  styleUrls: ['./torneo-quick-view-modal.css', '../shared-styles.css']
})
export class TorneoQuickViewModalComponent {
  private router = inject(Router);
  private torneosService = inject(TorneosService);

  @Input() isOpen: boolean = false;
  @Input() torneo: Torneo | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() inscribirse = new EventEmitter<Torneo>();

  close(): void {
    this.isOpen = false;
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onInscribirse(): void {
    if (this.torneo) {
      this.inscribirse.emit(this.torneo);
      this.close();
    }
  }

  verDetalleCompleto(): void {
    if (this.torneo) {
      this.router.navigate(['/client/reservas/dashboard-torneo/torneo', this.torneo.id_torneo]);
      this.close();
    }
  }

  verClasificacion(): void {
    if (this.torneo) {
      // Navegar al bracket del torneo
      this.router.navigate(['/client/reservas/dashboard-torneo/partido', this.torneo.id_torneo]);
      this.close();
    }
  }

  // Métodos helper del servicio
  getPorcentajeOcupacion(): number {
    return this.torneo ? this.torneosService.getPorcentajeOcupacion(this.torneo) : 0;
  }

  getRangoFechas(): string {
    return this.torneo ? this.torneosService.getRangoFechas(this.torneo) : '';
  }

  getColorEstado(): string {
    return this.torneo ? this.torneosService.getColorEstado(this.torneo.estado) : 'secondary';
  }

  getTextoEstado(): string {
    return this.torneo ? this.torneosService.getTextoEstado(this.torneo.estado) : '';
  }

  tieneCupos(): boolean {
    return this.torneo ? this.torneosService.tieneCuposDisponibles(this.torneo) : false;
  }

  puedeInscribirse(): boolean {
    return this.torneo?.estado === 'abierto' && this.tieneCupos();
  }
}
