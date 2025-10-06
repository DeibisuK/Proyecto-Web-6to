import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deporte-selector',
  imports: [CommonModule],
  templateUrl: './deporte-selector.html',
  styleUrls: ['./deporte-selector.css']
})
export class DeporteSelector {
  @Input() deporteActivo: string = 'futbol';
  @Output() deporteChange = new EventEmitter<string>();

  deportes = [
    { id: 'futbol', nombre: 'Fútbol', imagen: 'assets/images/deportes/futbol.jpg' },
    { id: 'padel', nombre: 'Pádel', imagen: 'assets/images/deportes/padel.jpg' },
    { id: 'tenis', nombre: 'Tenis', imagen: 'assets/images/deportes/tenis.jpg' }
  ];

  seleccionarDeporte(id: string) {
    this.deporteActivo = id;
    this.deporteChange.emit(id);
  }
}
