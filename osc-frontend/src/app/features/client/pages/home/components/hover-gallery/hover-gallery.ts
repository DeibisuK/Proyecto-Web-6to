import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hover-gallery',
  imports: [CommonModule, RouterLink],
  templateUrl: './hover-gallery.html',
  styleUrls: ['./hover-gallery.css']
})
export class HoverGalleryComponent {
  hoveredIndex = -1;

  images = [
    {
      src: 'https://reservascampillos.com/public/2_1758191264T4FJM7MVcHfTr4zMcVwgEaK7Szy934UxIJFARfFrT3bHAaW2bn.webp',
      title: 'Canchas de Fútbol',
      description: 'Instalaciones profesionales con césped sintético de última generación'
    },
    {
      src: 'https://alquilatucancha-public.s3.sa-east-1.amazonaws.com/production/public/clubs/bg/set-padel-house.jpeg?368128',
      title: 'Pistas de Pádel',
      description: 'Modernas pistas con iluminación LED y superficie profesional'
    },
    {
      // Usando imagen directa sin conversión (servidor externo)
      src: 'https://termasvillaelisa.com/wp-content/uploads/2022/03/tenis-1.jpg',
      title: 'Canchas de Tenis',
      description: 'Superficie de arcilla y césped para torneos profesionales'
    }
  ];

  // Helper para convertir URLs de imagen a formato WebP
  toWebP(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // Helper para convertir URLs de imagen a formato AVIF
  toAVIF(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  }

  // Verificar si la URL soporta formatos modernos (solo si es de tu servidor o Cloudinary)
  supportsModernFormats(url: string): boolean {
    // Solo intentar WebP/AVIF si es Cloudinary o tu dominio
    return url.includes('cloudinary.com') ||
           url.includes('res.cloudinary.com') ||
           url.includes('tu-dominio.com'); // Reemplaza con tu dominio
  }
}
