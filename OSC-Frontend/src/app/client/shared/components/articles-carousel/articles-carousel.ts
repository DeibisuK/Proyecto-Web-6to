import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticuloCanchaComponent } from '../../../features/articulos/articulo-cancha/articulo-cancha';
import { ArticuloEstudioComponent } from '../../../features/articulos/articulo-estudio/articulo-estudio';
import { ArticuloPadelComponent } from '../../../features/articulos/articulo-padel/articulo-padel';

@Component({
  selector: 'app-articles-carousel',
  standalone: true,
  imports: [CommonModule, ArticuloCanchaComponent, ArticuloEstudioComponent, ArticuloPadelComponent],
  templateUrl: './articles-carousel.html',
  styleUrls: ['./articles-carousel.css']
})
export class ArticlesCarouselComponent {
  currentSlide = 0;
  maxSlides = 3;
  slideWidth = 100;
  slides = Array(this.maxSlides).fill(0);

  nextSlide() {
    if (this.currentSlide < this.maxSlides - 1) {
      this.currentSlide++;
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}