import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Productos } from '../../models/producto';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css'],
})
export class ProductoCard {
  @Input() producto!: Productos;

  constructor(
    private router: Router
  ) {}

  /**
   * Navega a la página de detalle del producto
   */
  verDetalle() {
    this.router.navigate(['/tienda/producto', this.producto.id]);
  }

  /**
   * Redirige al detalle del producto para seleccionar variante
   * Ya no se puede agregar directamente desde la tarjeta porque
   * se necesita seleccionar la variante (color, talla, etc.)
   */
  agregarAlCarrito(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/tienda/producto', this.producto.id]);
  }

  /**
   * Maneja errores al cargar la imagen
   * Muestra placeholder en caso de error
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/placeholder.png';
    }
  }

  /**
   * Calcula el porcentaje de descuento
   * @returns Porcentaje de descuento redondeado
   */
  calcularDescuento(): number {
    if (!this.producto.precio_anterior || this.producto.precio_anterior <= this.producto.precio) {
      return 0;
    }

    const descuento = ((this.producto.precio_anterior - this.producto.precio) / this.producto.precio_anterior) * 100;
    return Math.round(descuento);
  }

  /**
   * Verifica si el producto tiene stock disponible
   */
  get tieneStock(): boolean {
    return this.producto.stock > 0;
  }

  /**
   * Verifica si el stock es bajo (menos de 5 unidades)
   */
  get stockBajo(): boolean {
    return this.producto.stock > 0 && this.producto.stock < 5;
  }
}
