import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '@shared/services/index';
import { Productos, ProductosResponse } from '@shared/models/index';
import { NotificationService } from '@core/services/notification.service';

/**
 * Componente de productos relacionados con carousel.
 *
 * Modernizado con Angular 20:
 * - input() signals para categoria y excludeId
 * - signal() para estado reactivo
 * - computed() para valores derivados
 * - effect() para cargar productos cuando cambia categoria
 * - inject() pattern
 */
@Component({
  selector: 'app-productos-relacionados',
  imports: [CommonModule],
  templateUrl: './productos-relacionados.html',
  styleUrls: ['./productos-relacionados.css']
})
export class ProductosRelacionados {
  // ===== Services (inject pattern) =====
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // ===== Inputs (signals) =====
  /**
   * Categoría para buscar productos relacionados (nombre o id)
   */
  categoria = input.required<string | number>();

  /**
   * ID del producto actual para excluirlo de los relacionados
   */
  excludeId = input<string | number>();

  // ===== Signals =====
  productosRelacionados = signal<Productos[]>([]);
  currentIndex = signal<number>(0);
  itemsPerView = 4; // Constante

  // ===== Computed values =====
  maxIndex = computed(() => {
    return Math.max(0, this.productosRelacionados().length - this.itemsPerView);
  });

  transformX = computed(() => {
    const itemWidth = 100 / this.itemsPerView;
    return `translateX(-${this.currentIndex() * itemWidth}%)`;
  });

  canGoNext = computed(() => {
    return this.currentIndex() < this.maxIndex();
  });

  canGoPrev = computed(() => {
    return this.currentIndex() > 0;
  });

  // ===== Constructor con effect =====
  constructor() {
    // Effect para cargar productos cuando cambia la categoría
    effect(() => {
      const cat = this.categoria();
      if (cat || cat === 0) {
        this.cargarProductosRelacionados();
      }
    });
  }

  // ===== Métodos =====
  private cargarProductosRelacionados() {
    const cat = this.categoria();

    if (!cat && cat !== 0) {
      this.productosRelacionados.set([]);
      return;
    }

    // Preparar filtros
    const filtros: any = { page: 1, per_page: 8 };

    if (typeof cat === 'number' || (typeof cat === 'string' && /^\d+$/.test(cat))) {
      filtros.categorias = [Number(cat)];
    } else if (typeof cat === 'string') {
      filtros.q = cat;
    }

    this.productoService.searchProductos(filtros).subscribe({
      next: (res: ProductosResponse) => {
        const productosApi: Productos[] = Array.isArray(res?.data) ? res.data : [];

        // Excluir el producto actual si se pasó excludeId
        const excludeIdValue = this.excludeId();
        const productosFiltrados = productosApi.filter(p => {
          if (!excludeIdValue && excludeIdValue !== 0) return true;
          return String(p.id) !== String(excludeIdValue);
        });

        this.productosRelacionados.set(productosFiltrados.slice(0, 8));
        this.currentIndex.set(0); // Reset carousel al cargar nuevos productos
      },
      error: (err) => {
        this.notificationService.error('Error cargando productos relacionados');
        this.productosRelacionados.set([]);
      }
    });
  }

  siguiente() {
    if (this.canGoNext()) {
      this.currentIndex.update(i => i + 1);
    }
  }

  anterior() {
    if (this.canGoPrev()) {
      this.currentIndex.update(i => i - 1);
    }
  }

  verDetalle(producto: Productos) {
    this.router.navigate(['/tienda/producto', producto.id]);
  }

  calcularDescuento(producto: Productos): number {
    if (!producto.precio_anterior || producto.precio_anterior <= producto.precio) {
      return 0;
    }
    return Math.round(((producto.precio_anterior - producto.precio) / producto.precio_anterior) * 100);
  }
}
