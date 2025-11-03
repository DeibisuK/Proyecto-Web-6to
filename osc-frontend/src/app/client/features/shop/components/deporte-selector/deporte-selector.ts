import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deporte } from '../../../../../core/models/deporte.model';
import { DeporteService } from '../../../../../core/services/deportes.service';

@Component({
  selector: 'app-deporte-selector',
  imports: [CommonModule],
  templateUrl: './deporte-selector.html',
  styleUrls: ['./deporte-selector.css'],
})
export class DeporteSelector implements OnInit {
  @Input() deporteActivo: number = 1; // Cambio: ahora es number (ID del deporte)
  @Output() deporteChange = new EventEmitter<number>(); // Cambio: emite number
  private deporteService = inject(DeporteService);
  deportes: Deporte[] | null = [];

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe((deportes) => {
      this.deportes = deportes;
    });
  }

  seleccionarDeporte(id: number) { // Cambio: parámetro ahora es number
    this.deporteActivo = id;
    this.deporteChange.emit(id); // Emite el número directamente
  }
}
