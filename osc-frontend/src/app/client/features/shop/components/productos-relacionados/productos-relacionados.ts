import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Productos, ProductosResponse } from '../../models/producto';

@Component({
  selector: 'app-productos-relacionados',
  imports: [CommonModule],
  templateUrl: './productos-relacionados.html',
  styleUrls: ['./productos-relacionados.css']
})
export class ProductosRelacionados implements OnInit {
  /**
   * Recibimos la categoría (puede ser nombre o id). En el detalle se pasa
   * `producto.nombre_categoria`, por eso permitimos string o number.
   */
  @Input() categoria!: string | number;
  // Id del producto actual para excluirlo de los relacionados (puede ser string o number)
  @Input() excludeId?: string | number;

  productosRelacionados: Productos[] = [];
  currentIndex = 0;
  itemsPerView = 4;
  maxIndex = 0;
  private notificationService = inject(NotificationService);
  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductosRelacionados();
  }

  cargarProductosRelacionados() {
    if (!this.categoria && this.categoria !== 0) {
      this.productosRelacionados = [];
      this.maxIndex = 0;
      return;
    }

    // Preparar filtros: preferimos usar `categorias` cuando recibimos un id,
    // si recibimos un nombre usamos `q` (búsqueda libre) para no forzar cambios
    // en el consumo desde los componentes padres.
    const filtros: any = { page: 1, per_page: 8 };

    if (typeof this.categoria === 'number' || (typeof this.categoria === 'string' && /^\d+$/.test(this.categoria))) {
      filtros.categorias = [Number(this.categoria)];
    } else if (typeof this.categoria === 'string') {
      filtros.q = this.categoria;
    }

    this.productoService.searchProductos(filtros).subscribe({
      next: (res: ProductosResponse) => {
        const productosApi: Productos[] = Array.isArray(res?.data) ? res.data : [];
        // Excluir el producto actual si se pasó excludeId
        const productosFiltrados = productosApi.filter(p => {
          if (!this.excludeId && this.excludeId !== 0) return true;
          return String(p.id) !== String(this.excludeId);
        });

        // Usar directamente el modelo de la API (ya no necesitamos mapear)
        this.productosRelacionados = productosFiltrados.slice(0, 8);
        this.maxIndex = Math.max(0, this.productosRelacionados.length - this.itemsPerView);
      },
      error: (err) => {
        this.notificationService.error('Error cargando productos relacionados');
        // Caer en empty list para no romper la UI
        this.productosRelacionados = [];
        this.maxIndex = 0;
      }
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

  verDetalle(producto: Productos) {
    this.router.navigate(['/tienda/producto', producto.id]);
  }

  calcularDescuento(producto: Productos): number {
    if (!producto.precio_anterior) return 0;
    return Math.round(((producto.precio_anterior - producto.precio) / producto.precio_anterior) * 100);
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
