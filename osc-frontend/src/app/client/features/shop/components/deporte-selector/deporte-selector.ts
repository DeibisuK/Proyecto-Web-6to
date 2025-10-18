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
    { id: 'futbol', nombre: 'Fútbol', imagen: 'https://e0.pxfuel.com/wallpapers/429/476/desktop-wallpaper-football-background-16-9-football.jpg' },
    { id: 'padel', nombre: 'Pádel', imagen: 'https://media.gq.com.mx/photos/660b0d51a1f2991fdd335050/16:9/w_2560%2Cc_limit/Pa%25CC%2581del_1080225792.jpg' },
    { id: 'tenis', nombre: 'Tenis', imagen: 'https://album.mediaset.es/eimg/2025/07/08/pelotas-de-tenis-16-9-aspect-ratio-default-0_da39.jpg?w=1200' }
  ];

  seleccionarDeporte(id: string) {
    this.deporteActivo = id;
    this.deporteChange.emit(id);
  }
}
