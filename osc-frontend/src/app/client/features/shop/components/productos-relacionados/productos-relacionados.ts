import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos-relacionados',
  imports: [CommonModule],
  templateUrl: './productos-relacionados.html',
  styleUrl: './productos-relacionados.css'
})
export class ProductosRelacionados implements OnInit {
  @Input() categoria!: string;
  
  productosRelacionados: Producto[] = [];
  currentIndex = 0;
  itemsPerView = 4;
  maxIndex = 0;

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductosRelacionados();
  }

  cargarProductosRelacionados() {
    this.productoService.getProductos().subscribe(productos => {
      // Filtrar productos de la misma categoría y limitar a 8 productos
      this.productosRelacionados = productos
        .filter(p => p.categoria === this.categoria)
        .slice(0, 8);
      
      this.maxIndex = Math.max(0, this.productosRelacionados.length - this.itemsPerView);
    });
  }

  siguiente() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  anterior() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  verDetalle(producto: Producto) {
    this.router.navigate(['/tienda/producto', producto.id]);
  }

  calcularDescuento(producto: Producto): number {
    if (!producto.precioAnterior) return 0;
    return Math.round(((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100);
  }

  get transformX(): string {
    const itemWidth = 100 / this.itemsPerView;
    return `translateX(-${this.currentIndex * itemWidth}%)`;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.maxIndex;
  }

  get canGoPrev(): boolean {
    return this.currentIndex > 0;
  }
}
