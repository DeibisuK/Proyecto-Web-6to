import {
  ProductoDetalle,
  Productos,
  VarianteProducto,
} from './../../../client/features/shop/models/producto';
import { FiltrosProducto } from './../../../client/features/shop/models/filtros-producto';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../client/features/shop/services/producto.service';
import { ProductosResponse } from '../../../client/features/shop/models/producto';
import { Categoria } from '../../../core/models/categoria.model';
import { Marca } from '../../../core/models/marca.model';
import { Deporte } from '../../../core/models/deporte.model';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../core/services/categoria.service';
import { forkJoin, Subject } from 'rxjs';
import { MarcaService } from '../../../core/services/marca.service';
import { DeporteService } from '../../../core/services/deportes.service';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule],
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
  marcaService = inject(MarcaService);
  deporteService = inject(DeporteService);

  private searchSubject = new Subject<string>();
  productos = signal<ProductosResponse>({
    page: 0,
    per_page: 0,
    total: 0,
    total_pages: 0,
    data: [],
  });
  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);
  deportes = signal<Deporte[]>([]);
  detalleProducto = signal<ProductoDetalle | null>(null);
  productoExpandido = signal<number | null>(null);

  abrirModalAddProducto = signal(false); // Modal para añadir productos
  abrirModalAddVariante = signal(false); // Modal para añadir variantes

  cargando = signal(true);
  cargandoVariantes = signal(false);
  error = signal<string | null>(null);

  // Formulario temporal para crear producto (template-driven)
  productForm: any = {
    nombre: '',
    descripcion: '',
    id_categoria: null,
    id_deporte: null,
    id_marca: null,
    es_nuevo: false,
  };

  // Estado para modal variantes
  currentModalProductId: number | null = null;
  varianteRows: Array<any> = [];
  // Opciones extraídas del detalle del producto para poblar selects (Color, Talla...)
  opcionesModal: any[] = [];
  // Selecciones temporales para generar combinaciones: map index -> Set(id_valor)
  opcionesSeleccionadas: Record<number, Set<number>> = {};

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
    const marcas$ = this.marcaService.getMarcas();
    const deportes$ = this.deporteService.getDeportes();

    forkJoin({
      categorias: categorias$,
      productos: productos$,
      marcas: marcas$,
      deportes: deportes$,
    }).subscribe({
      next: (resultados) => {
        this.categorias.set(resultados.categorias);
        this.productos.set(resultados.productos);
        this.marcas.set(resultados.marcas);
        this.deportes.set(resultados.deportes);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Ocurrió un error al cargar los datos.');
        this.cargando.set(false);
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

  /**
   * Modal: crear producto (usa ProductoService.createProducto)
   */
  toggleModalAgregarProducto() {
    const opening = !this.abrirModalAddProducto();
    this.abrirModalAddProducto.set(opening);
    if (opening) {
      // reset form
      this.productForm = {
        nombre: '',
        descripcion: '',
        id_categoria: null,
        id_deporte: null,
        id_marca: null,
        es_nuevo: false,
      };
    }
  }

  saveProducto() {
    // Basic validation
    if (!this.productForm.nombre || this.productForm.nombre.trim() === '') {
      this.error.set('El nombre del producto es obligatorio');
      return;
    }

    this.cargando.set(true);
    const payload = {
      ...this.productForm,
      id_categoria: this.productForm.id_categoria ? Number(this.productForm.id_categoria) : null,
      id_marca: this.productForm.id_marca ? Number(this.productForm.id_marca) : null,
      id_deporte: this.productForm.id_deporte ? Number(this.productForm.id_deporte) : null,
      es_nuevo: !!this.productForm.es_nuevo,
    };

    this.productoService.createProducto(payload).subscribe({
      next: (res) => {
        const id = res?.id_producto || res?.id || null;
        this.abrirModalAddProducto.set(false);
        // refrescar lista y abrir detalle para agregar variantes
        this.cargarTodo();
        if (id) {
          // abrir detalle y cargar variantes
          this.productoExpandido.set(id);
          this.cargandoVariantes.set(true);
          this.productoService.getProductoDetalleAdmin(id).subscribe({
            next: (detalle) => {
              this.detalleProducto.set(detalle);
              this.cargandoVariantes.set(false);
            },
            error: (err) => {
              this.cargandoVariantes.set(false);
            },
          });
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al crear el producto');
        this.cargando.set(false);
      },
    });
  }

  /**
   * Modal variantes: abrir modal para un producto específico
   */
  abrirModalVariantesPara(productoId: number) {
    this.currentModalProductId = productoId;
    // cargar opciones desde endpoint si está disponible, si no extraer del detalle
    this.fetchOpcionesIfNeeded().then((opts) => {
      this.opcionesModal = opts || [];
      this.varianteRows = [this._nuevoRowVariante(this.opcionesModal)];
      this.abrirModalAddVariante.set(true);
    });
  }

  _nuevoRowVariante(opciones: any[] = []) {
    return {
      sku: '',
      precio: 0,
      stock: 0,
      url_images_str: '', // legacy: comma-separated (kept for backward compat)
      files: [] as File[],
      previewImages: [] as string[],
      // valores: array por cada opcion disponible: { id_opcion, id_valor|null, isNew, new_valor }
      valores: (opciones || []).map((o: any) => ({ id_opcion: o.id_opcion, id_valor: null, isNew: false, new_valor: '' })),
    };
  }

  /**
   * Try to fetch global opciones from backend if ProductoService exposes getOpciones().
   * Otherwise fallback to extracting from current detalleProducto (if present).
   */
  async fetchOpcionesIfNeeded(): Promise<any[]> {
    // Prefer an explicit endpoint if implemented in ProductoService
    try {
      // optional method on service - call safely via any and convert observable to promise
      const svcAny = this.productoService as any;
      if (svcAny && typeof svcAny.getOpciones === 'function') {
        return await new Promise((resolve, reject) => {
          svcAny.getOpciones().subscribe({ next: resolve, error: reject });
        });
      }
    } catch (err) {
      console.warn('Error fetching opciones via service:', err);
    }
    // If service method missing or failed, return empty array (no fallback needed)
    return [];
  }

  /** Handle file input selection for a variante row (visual only - previews) */
  onFilesSelected(row: any, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files) return;
    const files = Array.from(input.files);
    row.files = files;
    row.previewImages = [];
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const res = ev.target?.result as string | null;
        if (res) row.previewImages.push(res);
      };
      reader.readAsDataURL(f);
    });
  }

  /** Toggle a chip selection for a given option in a row. If valor is '__other__' opens new input. */
  toggleChip(row: any, optIndex: number, valor: any) {
    const entry = row.valores[optIndex];
    if (!entry) return;

    if (valor === '__other__') {
      entry.isNew = !entry.isNew;
      if (entry.isNew) {
        entry.id_valor = null;
      } else {
        entry.new_valor = '';
      }
      return;
    }

    // valor is an object { id_valor, valor }
    const id = Number(valor.id_valor);
    if (entry.id_valor === id) {
      // deselect
      entry.id_valor = null;
    } else {
      entry.id_valor = id;
      entry.isNew = false;
      entry.new_valor = '';
    }
  }

  /** Toggle multi-selection used for generating combinations */
  toggleMultiSelect(optIndex: number, valor: any) {
    if (!this.opcionesSeleccionadas[optIndex]) {
      this.opcionesSeleccionadas[optIndex] = new Set<number>();
    }
    const set = this.opcionesSeleccionadas[optIndex];
    const id = Number(valor.id_valor);
    // ignore 'other' pseudo-option
    if (isNaN(id) || id === -1) return;
    if (set.has(id)) set.delete(id);
    else set.add(id);
  }

  /** Genera combinaciones cartesianas usando las selecciones actuales y rellena varianteRows */
  generateCombinations() {
    // Construir arrays de arrays de valores seleccionados en el orden de opcionesModal
    const lists: number[][] = [];
    const optionIndices: number[] = [];
    for (let i = 0; i < this.opcionesModal.length; i++) {
      const sel = this.opcionesSeleccionadas[i];
      if (sel && sel.size > 0) {
        lists.push(Array.from(sel));
        optionIndices.push(i);
      }
    }

    if (lists.length === 0) {
      this.error.set('Seleccione al menos una talla o color para generar combinaciones');
      return;
    }

    // Cartesian product
    const results: number[][] = [[]];
    for (const arr of lists) {
      const tmp: number[][] = [];
      for (const prefix of results) {
        for (const item of arr) {
          tmp.push([...prefix, item]);
        }
      }
      results.splice(0, results.length, ...tmp);
    }

    // Map cada combinación a una row de variante
    const newRows = results.map((combo, idx) => {
      const valores = combo.map((id_valor, j) => {
        const optIdx = optionIndices[j];
        return Number(id_valor);
      });
      return {
        sku: '',
        precio: 0,
        stock: 0,
        url_images_str: '',
        files: [] as File[],
        previewImages: [] as string[],
        valores: this.opcionesModal.map((o: any, oi: number) => {
          const pos = optionIndices.indexOf(oi);
          if (pos === -1) return { id_opcion: o.id_opcion, id_valor: null, isNew: false, new_valor: '' };
          return { id_opcion: o.id_opcion, id_valor: combo[pos], isNew: false, new_valor: '' };
        }),
      };
    });

    // Reemplazar rows actuales por las generadas
    this.varianteRows = newRows;
  }



  onValorSelectChange(row: any, optIndex: number, event: Event) {
    const entry = row.valores[optIndex];
    const target = event.target as HTMLSelectElement | null;
    const raw = target ? target.value : null;
    const v = Number(raw);
    if (v === -1) {
      entry.isNew = true;
      entry.id_valor = null;
    } else {
      entry.isNew = false;
      entry.id_valor = isNaN(v) ? null : v;
      entry.new_valor = '';
    }
  }

  addVarianteRow() {
    this.varianteRows.push(this._nuevoRowVariante(this.opcionesModal));
  }

  removeVarianteRow(index: number) {
    this.varianteRows.splice(index, 1);
  }

  cancelarModalVariantes() {
    this.abrirModalAddVariante.set(false);
    this.currentModalProductId = null;
    this.varianteRows = [];
  }

  submitVariantes() {
    if (!this.currentModalProductId) {
      this.error.set('Producto no seleccionado para añadir variantes');
      return;
    }

    const payload = this.varianteRows.map((r) => {
      const url_images = r.url_images_str
        ? r.url_images_str
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      const valores = (r.valores || []).map((entry: any) => {
        if (entry.isNew) {
          return { id_opcion: entry.id_opcion, valor: entry.new_valor };
        }
        return Number(entry.id_valor);
      });

      return {
        sku: r.sku,
        precio: Number(r.precio) || 0,
        stock: Number(r.stock) || 0,
        url_images,
        valores,
      };
    });

    this.cargandoVariantes.set(true);
    this.productoService.createVariantes(this.currentModalProductId, payload).subscribe({
      next: (res) => {
        // cerrar modal y recargar detalle
        this.abrirModalAddVariante.set(false);
        this.currentModalProductId = null;
        this.varianteRows = [];
        // recargar detalle
        const prodId = res?.id_producto || (res && this.productoExpandido()) || null;
        const idToLoad = prodId || this.productoExpandido();
        if (idToLoad) {
          this.productoService.getProductoDetalleAdmin(idToLoad).subscribe({
            next: (detalle) => this.detalleProducto.set(detalle),
            error: (err) => console.error('Error recargando detalle tras crear variantes:', err),
          });
        }
        // refresh list
        this.cargarTodo();
        this.cargandoVariantes.set(false);
      },
      error: (err) => {
        this.error.set('Error al crear variantes');
        this.cargandoVariantes.set(false);
      },
    });
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

    // Lógica para editar el producto (a implementar)
  }

  /** Open admin page to manage opciones (best-effort). */
  openOpcionesAdmin() {
    try {
      // Try to open the admin options page in a new tab if route exists
      window.open('/admin/opciones', '_blank');
      this.error.set('Abriendo panel de opciones en una nueva pestaña (si existe).');
    } catch (err) {
      this.error.set('No se pudo abrir el panel de opciones automáticamente.');
    }
  }

  // toggleModalAgregarProducto() {
  //   this.abrirModalAddProducto.set(!this.abrirModalAddProducto());
  //   console.log('Abrir modal para agregar nuevo producto' + this.abrirModalAddProducto());
  //   // Lógica para abrir el modal (a implementar)
  // }
}
