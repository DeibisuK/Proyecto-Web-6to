import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Producto, Productos, ProductosResponse } from '../../models/producto';

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

        // Mapear el modelo de API (snake_case) al modelo usado por la plantilla (camelCase)
        this.productosRelacionados = productosFiltrados.slice(0, 8).map(p => this.mapApiToProducto(p));
        this.maxIndex = Math.max(0, this.productosRelacionados.length - this.itemsPerView);
      },
      error: (err) => {
        console.error('Error cargando productos relacionados', err);
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

  verDetalle(producto: Producto) {
    // El id en el carrito/plantilla es string — mantenemos compatibilidad
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

  /**
   * Adapta el producto que viene de la API (modelo `Productos`) al modelo
   * usado por la plantilla (`Producto`) — evita cambiar la plantilla.
   */
  private mapApiToProducto(api: Productos): Producto {
    return {
      id: String(api.id),
      nombre: api.nombre,
      descripcion: typeof api.caracteristicas === 'string' ? api.caracteristicas : '',
      caracteristicas: api.caracteristicas ? [String(api.caracteristicas)] : [],
      precio: api.precio,
      precioAnterior: api.precio_anterior || undefined,
      imagen: api.imagen,
      categoria: api.nombre_categoria || '',
      deporte: api.deporte || '',
      marca: api.marca || '',
      color: '',
      tallas: [],
      stock: api.stock,
      descuento: api.precio_anterior && api.precio_anterior > api.precio ? Math.round(((api.precio_anterior - api.precio) / api.precio_anterior) * 100) : 0,
      nuevo: !!api.es_nuevo,
      oferta: !!(api.precio_anterior && api.precio_anterior > api.precio)
    };
  }
}
