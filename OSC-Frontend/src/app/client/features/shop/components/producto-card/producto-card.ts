import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css']
})
export class ProductoCard {
  @Input() producto!: Producto;
  
  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  verDetalle() {
    this.router.navigate(['/tienda/producto', this.producto.id]);
  }

  agregarAlCarrito(event: Event) {
    event.stopPropagation(); // Evita que se active el verDetalle
    this.carritoService.agregarProducto(this.producto);
  }

  calcularDescuento(): number {
    if (!this.producto.precioAnterior) return 0;
    return Math.round(((this.producto.precioAnterior - this.producto.precio) / this.producto.precioAnterior) * 100);
  }
}
