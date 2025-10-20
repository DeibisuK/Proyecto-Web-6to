import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Producto, Productoa } from '../../models/producto';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css']
})
export class ProductoCard {
  @Input() producto!: Productoa;
  
  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {
  }

  verDetalle() {
    this.router.navigate(['/tienda/producto', this.producto.id]);
  }

  agregarAlCarrito(event: Event) {
    event.stopPropagation(); // Evita que se active el verDetalle
    //this.carritoService.agregarProducto(this.producto);
  }

  calcularDescuento(): number {
    if (!this.producto.precio_anterior) return 0;
    return Math.round(((this.producto.precio_anterior - this.producto.precio) / this.producto.precio_anterior) * 100);
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
