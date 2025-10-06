import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoCard } from '../producto-card/producto-card';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css']
})
export class DetalleProducto implements OnInit {
  @Input() producto!: Producto;
  tallaSeleccionada: string = '';
  cantidad: number = 1;
  imagenPrincipal: string = '';
  colorSeleccionado: string = '';

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    if (this.producto) {
      this.imagenPrincipal = this.producto.imagen;
      this.colorSeleccionado = this.producto.color;
    }
  }

  seleccionarTalla(talla: string) {
    this.tallaSeleccionada = this.tallaSeleccionada === talla ? '' : talla;
  }

  cambiarCantidad(incremento: number) {
    const nuevaCantidad = this.cantidad + incremento;
    if (nuevaCantidad >= 1 && nuevaCantidad <= this.producto.stock) {
      this.cantidad = nuevaCantidad;
    }
  }

  agregarAlCarrito() {
    if (!this.tallaSeleccionada) {
      // Aquí podrías mostrar un mensaje de error
      return;
    }
    this.carritoService.agregarProducto(this.producto, this.cantidad);
  }
}
