import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Productos } from '../../models/producto';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css'],
})
export class ProductoCard {
  @Input() producto!: Productos;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  /**
   * Navega a la página de detalle del producto
   */
  verDetalle() {
    this.router.navigate(['/tienda/producto', this.producto.id]);
  }

  /**
   * Agrega el producto al carrito
   * Detiene la propagación del evento para no navegar al detalle
   */
  agregarAlCarrito(event: Event) {
    event.stopPropagation();

    // Adaptar Productos (listado) a Producto (carrito)
    const productoParaCarrito = this.adaptarProductoParaCarrito(this.producto);
    this.carritoService.agregarProducto(productoParaCarrito);

    console.log('✅ Producto agregado al carrito:', {
      id: this.producto.id,
      nombre: this.producto.nombre,
      precio: this.producto.precio
    });
  }

  /**
   * Adapta el modelo Productos (listado) al modelo Producto (carrito)
   * @param producto Producto del listado
   * @returns Producto adaptado para el carrito
   */
  private adaptarProductoParaCarrito(producto: Productos) {
    return {
      id: String(producto.id),
      nombre: producto.nombre,
      descripcion: producto.caracteristicas, // Usamos características como descripción
      caracteristicas: producto.caracteristicas ? [producto.caracteristicas] : [],
      precio: producto.precio,
      precioAnterior: producto.precio_anterior > producto.precio ? producto.precio_anterior : undefined,
      imagen: producto.imagen,
      categoria: producto.nombre_categoria,
      deporte: producto.deporte,
      marca: producto.marca,
      color: '', // No disponible en el listado
      tallas: [], // No disponible en el listado
      stock: producto.stock,
      descuento: this.calcularDescuento(),
      nuevo: producto.es_nuevo,
      oferta: producto.precio_anterior > producto.precio
    };
  }

  /**
   * Maneja errores al cargar la imagen
   * Muestra placeholder en caso de error
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/placeholder.png';
      console.warn('⚠️ Error al cargar imagen del producto:', this.producto.id);
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
