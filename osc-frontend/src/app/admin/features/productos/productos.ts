import {
  ProductoDetalle,
  Productos,
  VarianteProducto,
} from './../../../client/features/shop/models/producto';
import { FiltrosProducto } from './../../../client/features/shop/models/filtros-producto';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductoService } from '../../../client/features/shop/services/producto.service';
import { ProductosResponse } from '../../../client/features/shop/models/producto';
import { Categoria } from '../../../core/models/categoria.model';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../core/services/categoria.service';
import { forkJoin, Subject } from 'rxjs';

@Component({
  selector: 'app-productos',
  imports: [CommonModule],
  templateUrl: './productos.html',
  styles: [
    `
      :host {
        display: block;
        background-color: #f9fafb;
        min-height: 100vh;
      }
    `,
  ],
})
export class ProductosComponent implements OnInit {
  public Math = Math;
  productoService = inject(ProductoService);
  categoriaService = inject(CategoriaService);

  private searchSubject = new Subject<string>();
  productos = signal<ProductosResponse>({
    page: 0,
    per_page: 0,
    total: 0,
    total_pages: 0,
    data: [],
  });
  categorias = signal<Categoria[]>([]);
  detalleProducto = signal<ProductoDetalle | null>(null);
  productoExpandido = signal<number | null>(null);

  cargando = signal(true);
  cargandoVariantes = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.cargarTodo();
    this.setupSearch();
  }
  ngOnDestroy() {
    this.searchSubject.complete();
  }
  setupSearch() {
    this.searchSubject
      .pipe(
        debounceTime(1000), // Espera 1000ms después del último keystroke
        distinctUntilChanged(), // Solo busca si el término cambió
        switchMap((termino) => {
          this.cargando.set(true);

          // Si el término está vacío, carga todos los productos
          if (!termino || termino.trim() === '') {
            return this.productoService.getAllProductos(1, 10);
          }

          // Si hay término, busca
          const filtro: FiltrosProducto = { q: termino.toLowerCase() };
          return this.productoService.searchProductos(filtro);
        })
      )
      .subscribe({
        next: (response) => {
          this.productos.set(response);
          this.cargando.set(false);
        },
        error: (error) => {
          console.error('Error al buscar producto:', error);
          this.error.set('Error al buscar producto');
          this.cargando.set(false);
        },
      });
  }
  buscarProducto(termino: string) {
    this.searchSubject.next(termino);
  }
  cargarTodo() {
    const categorias$ = this.categoriaService.getCategorias();
    const productos$ = this.productoService.getAllProductos(1, 10);

    forkJoin({
      categorias: categorias$,
      productos: productos$,
    }).subscribe({
      next: (resultados) => {
        this.categorias.set(resultados.categorias);
        this.productos.set(resultados.productos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Ocurrió un error al cargar los datos.');
        this.cargando.set(false);
        console.error('Error cargando datos:', err);
      },
    });
  }
  toggleProducto(producto: Productos) {
    if (this.productoExpandido() === producto.id) {
      this.productoExpandido.set(null);
      this.detalleProducto.set(null);
    } else {
      this.verVariantes(producto);
    }
  }

  verVariantes(producto: Productos) {
    // Si ya está expandido, colapsar
    if (this.productoExpandido() === producto.id) {
      this.productoExpandido.set(null);
      this.detalleProducto.set(null);
      return;
    }

    // Expandir y cargar variantes
    this.productoExpandido.set(producto.id);
    this.cargandoVariantes.set(true);

    this.productoService.getProductoDetalleAdmin(producto.id).subscribe({
      next: (detalle) => {
        this.detalleProducto.set(detalle);
        this.cargandoVariantes.set(false);
      },
      error: (error) => {
        console.error('Error al cargar variantes:', error);
        this.error.set('Error al cargar las variantes del producto');
        this.cargandoVariantes.set(false);
        this.productoExpandido.set(null);
      },
    });
  }

  editarVariante(variante: VarianteProducto) {
    console.log('Editar variante:', variante);
    // Implementar lógica de edición
  }

  eliminarVariante(variante: VarianteProducto) {
    console.log('Eliminar variante:', variante);
    // Implementar lógica de eliminación
  }

  eliminarProducto(producto: Productos) {
    console.log('Eliminar producto con ID:', producto.id);
    this.cargando.set(true);
    // Lógica para eliminar el producto (a implementar)
    setTimeout(() => {
      console.log('Producto eliminado (simulado) con ID:', producto.id);
      this.cargarTodo(); // Recargar la lista después de eliminar
    }, 1000);
  }
  editarProducto(producto: Productos) {
    console.log('Editar producto con ID:', producto.id);
    // Lógica para editar el producto (a implementar)
  }
}
