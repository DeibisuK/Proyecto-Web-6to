import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Productos } from '@shared/models/index';
import { LazyLoadDirective } from '../../shared/directives/lazy-load.directive';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule, LazyLoadDirective],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css'],
})
export class ProductoCard {

  producto = input.required<Productos>();
  private router = inject(Router);

  /**
   * Calcula el porcentaje de descuento
   * @returns Porcentaje de descuento redondeado
   */
  descuento = computed(() => {
    const prod = this.producto();
    if (!prod.precio_anterior || prod.precio_anterior <= prod.precio) {
      return 0;
    }

    const descuento = ((prod.precio_anterior - prod.precio) / prod.precio_anterior) * 100;
    return Math.round(descuento);
  });

  /**
   * Verifica si el producto tiene stock disponible
   */
  tieneStock = computed(() => {
    return this.producto().stock > 0;
  });

  /**
   * Verifica si el stock es bajo (menos de 5 unidades)
   */
  stockBajo = computed(() => {
    const stock = this.producto().stock;
    return stock > 0 && stock < 5;
  });

  /**
   * Verifica si el producto tiene descuento
   */
  tieneDescuento = computed(() => {
    const prod = this.producto();
    return prod.precio_anterior && prod.precio_anterior > prod.precio;
  });

  /**
   * Navega a la página de detalle del producto
   */
  verDetalle() {
    this.router.navigate(['/tienda/producto', this.producto().id]);
  }

  /**
   * Redirige al detalle del producto para seleccionar variante
   * Ya no se puede agregar directamente desde la tarjeta porque
   * se necesita seleccionar la variante (color, talla, etc.)
   */
  agregarAlCarrito(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/tienda/producto', this.producto().id]);
  }

  /**
   * Maneja errores al cargar la imagen
   * Muestra placeholder en caso de error
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  /**
   * Convierte URL de imagen a formato WebP
   */
  toWebP(url: string | null): string {
    if (!url) return 'assets/placeholder.png';
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  /**
   * Convierte URL de imagen a formato AVIF
   */
  toAVIF(url: string | null): string {
    if (!url) return 'assets/placeholder.png';
    return url.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  }
}
