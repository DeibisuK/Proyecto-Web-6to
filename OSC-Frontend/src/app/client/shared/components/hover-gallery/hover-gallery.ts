import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hover-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hover-gallery.html',
  styleUrls: ['./hover-gallery.css']
})
export class HoverGalleryComponent {
  hoveredIndex = -1;
  
  images = [
    {
      src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Canchas de Fútbol',
      description: 'Instalaciones profesionales con césped sintético de última generación'
    },
    {
      src: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Pistas de Pádel',
      description: 'Modernas pistas con iluminación LED y superficie profesional'
    },
    {
      src: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Canchas de Tenis',
      description: 'Superficie de arcilla y césped para torneos profesionales'
    },
    {
      src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Gimnasio Equipado',
      description: 'Equipamiento de última generación para todos los niveles'
    }
  ];
}