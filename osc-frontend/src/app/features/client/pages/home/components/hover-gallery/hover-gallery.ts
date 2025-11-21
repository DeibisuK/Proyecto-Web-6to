import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hover-gallery',
  imports: [CommonModule],
  templateUrl: './hover-gallery.html',
  styleUrls: ['./hover-gallery.css']
})
export class HoverGalleryComponent {
  hoveredIndex = -1;

  images = [
    {
      src: 'https://www.deporte.gob.ec/wp-content/uploads/2016/12/20161223CanchaJuncal.jpg',
      title: 'Canchas de Fútbol',
      description: 'Instalaciones profesionales con césped sintético de última generación'
    },
    {
      src: 'https://cespedecuador.com/wp-content/uploads/2024/12/Cancha-de-padel-en-Ecuador-con-cesped-sintetico-profesional.jpg',
      title: 'Pistas de Pádel',
      description: 'Modernas pistas con iluminación LED y superficie profesional'
    },
    {
      src: 'https://termasvillaelisa.com/wp-content/uploads/2022/03/tenis-1.jpg',
      title: 'Canchas de Tenis',
      description: 'Superficie de arcilla y césped para torneos profesionales'
    },
    {
      src: 'https://pdq-funding.co.uk/wp-content/uploads/2022/08/How-to-start-up-a-sports-shop.jpg.webp',
      title: 'Tienda Deportiva',
      description: 'Equipamiento y accesorios de las mejores marcas'
    }
  ];
}
