import { Component, inject, OnInit, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deporte } from '@shared/models/index';
import { DeporteService } from '@shared/services/index';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-deporte-selector',
  imports: [CommonModule],
  templateUrl: './deporte-selector.html',
  styleUrls: ['./deporte-selector.css'],
})
export class DeporteSelector implements OnInit {
  // ====================
  // MODEL bidireccional (reemplaza @Input/@Output)
  // ====================
  deporteActivo = model<number>(0); // 0 = Todos los deportes

  // ====================
  // SERVICES
  // ====================
  private deporteService = inject(DeporteService);

  // ====================
  // SIGNALS
  // ====================
  deportes = signal<Deporte[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe({
      next: (deportes) => {
        this.deportes.set(deportes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar deportes:', error);
        this.isLoading.set(false);
      }
    });
  }

  // ====================
  // MÉTODOS
  // ====================
  seleccionarDeporte(id: number) {
    this.deporteActivo.set(id); // Actualiza el model bidireccional
  }
}
