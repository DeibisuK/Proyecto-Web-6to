import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Producto, Productoa } from '../../models/producto';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css'],
})
export class ProductoCard {
  @Input() producto!: Productoa;

  constructor(private carritoService: CarritoService, private router: Router) {}

  verDetalle() {
    this.router.navigate(['/tienda/producto', String(this.producto.id_producto)]);
  }

  agregarAlCarrito(event: Event) {
    // La plantilla ya detiene la propagación del evento
    // Mapear Productoa a Producto mínimo para el carrito
    const productoParaCarrito: Producto = {
      id: String(this.producto.id_producto),
      nombre: this.producto.nombre,
      descripcion: this.producto.descripcion || '',
      caracteristicas: [],
      precio: this.producto.precio,
      imagen: this.producto.images && this.producto.images.length ? this.producto.images[0] : '',
      categoria: this.producto.nombre_categoria || '',
      deporte: this.producto.nombre_deporte || '',
      marca: this.producto.nombre_marca || '',
      color: '',
      tallas: [],
      stock: this.producto.stock || 0,
    };

    this.carritoService.agregarProducto(productoParaCarrito);
    console.log('Producto agregado al carrito:', productoParaCarrito.id);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = '/assets/placeholder.png';
  }

  calcularDescuento(): number {
    if (!this.producto.precio_anterior) return 0;
    return Math.round(
      ((this.producto.precio_anterior - this.producto.precio) / this.producto.precio_anterior) * 100
    );
  }

  // getCaracteristicasTruncadas(): string {
  //   const caracteristicas = this.producto.caracteristicas.join(', ');
  //   const maxLength = 80; // Ajustar según necesidad
  //   if (caracteristicas.length <= maxLength) {
  //     return caracteristicas;
  //   }
  //   return caracteristicas.substring(0, maxLength) + '...';
  // }
}
