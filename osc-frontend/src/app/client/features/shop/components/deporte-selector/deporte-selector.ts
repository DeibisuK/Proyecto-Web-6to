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
  @Input() deporteActivo: string = 'futbol';
  @Output() deporteChange = new EventEmitter<string>();
  private deporteService = inject(DeporteService);
  deportes: Deporte[] | null = [];

  ngOnInit(): void {
    this.deporteService.getDeportes().subscribe((deportes) => {
      this.deportes = deportes;
      console.log('⚽ Deportes cargados en DeporteSelector:', deportes);
      console.log('   Tipos de ID:', deportes?.map(d => ({ id: d.id_deporte, tipo: typeof d.id_deporte })));
    });
  }

  seleccionarDeporte(id: string) {
    console.log('⚽ DeporteSelector - ID seleccionado:', id, '(tipo:', typeof id + ')');
    this.deporteActivo = id;
    console.log('📤 DeporteSelector - Emitiendo deporte:', id);
    this.deporteChange.emit(id);
  }
}
