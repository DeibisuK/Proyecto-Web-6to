import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoCard } from '../producto-card/producto-card';
import { CarritoService } from '../../services/carrito.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css']
})
export class DetalleProducto implements OnInit {
  producto!: Producto;
  tallaSeleccionada: string = '';
  cantidad: number = 1;
  imagenPrincipal: string = '';
  colorSeleccionado: string = '';
  esFavorito: boolean = false;

  private coloresHex: { [key: string]: string } = {
    'blanco': '#FFFFFF',
    'negro': '#000000',
    'azul': '#0066CC',
    'rojo': '#CC0000',
    'verde': '#00CC00',
    'amarillo': '#FFFF00',
    'naranja': '#FF6600',
    'gris': '#808080',
    'rosa': '#FF69B4',
    'morado': '#800080'
  };

  constructor(
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const productoEncontrado = this.productoService.getProductoPorId(id);
        if (productoEncontrado) {
          this.producto = productoEncontrado;
          this.imagenPrincipal = this.producto.imagen;
          this.colorSeleccionado = this.producto.color;
          
          // Auto-seleccionar talla si es standard
          if (this.esTallaStandard()) {
            this.tallaSeleccionada = this.producto.tallas[0];
          }
        } else {
          // Producto no encontrado, redirigir a tienda
          this.router.navigate(['/tienda']);
        }
      }
    });
  }

  calcularDescuento(): number {
    if (!this.producto.precioAnterior) return 0;
    return Math.round(((this.producto.precioAnterior - this.producto.precio) / this.producto.precioAnterior) * 100);
  }

  getCategoriaDisplay(): string {
    const categorias: { [key: string]: string } = {
      'ropa': 'Ropa Deportiva',
      'calzado': 'Calzado',
      'accesorios': 'Accesorios',
      'equipamiento': 'Equipamiento'
    };
    return categorias[this.producto.categoria] || this.producto.categoria;
  }

  getColorHex(): string {
    return this.coloresHex[this.producto.color.toLowerCase()] || '#CCCCCC';
  }

  esTallaStandard(): boolean {
    return this.producto.tallas.length === 1 && 
           (this.producto.tallas[0] === 'standard' || this.producto.tallas[0] === '5');
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

  puedeAgregar(): boolean {
    return this.producto.stock > 0 && 
           (this.esTallaStandard() || this.tallaSeleccionada !== '') &&
           this.cantidad > 0;
  }

  agregarAlCarrito() {
    if (!this.puedeAgregar()) {
      return;
    }
    
    // Si hay talla seleccionada o es standard, proceder
    this.carritoService.agregarProducto(this.producto, this.cantidad);
    
    // Opcional: Mostrar mensaje de éxito o redirigir
    // this.router.navigate(['/carrito']);
  }

  toggleFavorito() {
    this.esFavorito = !this.esFavorito;
    // Aquí podrías implementar la lógica para guardar favoritos
  }
}
