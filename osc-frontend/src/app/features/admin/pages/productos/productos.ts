import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject } from 'rxjs';
import {
  ProductoService,
  CategoriaService,
  MarcaService,
  DeporteService,
  CloudinaryService,
} from '@shared/services/index';
import {
  ProductoDetalle,
  Productos,
  VarianteProducto,
  ProductosResponse,
  FiltrosProducto,
  Marca,
  Deporte,
  Categoria,
} from '@shared/models/index';
import { NotificationService } from '@core/services/notification.service';

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

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }

      .animate-slideUp {
        animation: slideUp 0.3s ease-out;
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
  cloudinaryService = inject(CloudinaryService);
  notificationService = inject(NotificationService);

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
  modoEdicion = signal(false); // Indica si estamos editando o creando producto
  productoEditandoId = signal<number | null>(null); // ID del producto siendo editado
  modoEdicionVariante = signal(false); // Indica si estamos editando o creando variante
  varianteEditandoId = signal<number | null>(null); // ID de la variante siendo editada

  cargando = signal(true);
  cargandoVariantes = signal(false);
  subiendoImagenes = signal(false); // Estado para la carga de imágenes

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
  currentCategoriaId: number | null = null; // Guardar la categoría del producto actual
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
          this.notificationService.error('Error al buscar producto');
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
        this.notificationService.error('Ocurrió un error al cargar los datos.');
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
   * Maneja el cambio de categoría en el formulario de producto
   * Carga las opciones específicas para la categoría seleccionada
   */
  onCategoriaChange(categoriaId: number): void {
    if (!categoriaId) {
      this.opcionesModal = [];
      return;
    }

    this.currentCategoriaId = categoriaId;
    // Cargar opciones específicas de la categoría
    this.productoService.getOpcionesPorCategoria(categoriaId).subscribe({
      next: (opciones) => {
        this.opcionesModal = opciones;
        console.log('Opciones cargadas para categoría', categoriaId, ':', opciones);
      },
      error: (err) => {
        console.error('Error al cargar opciones de categoría:', err);
        this.notificationService.error('Error al cargar las opciones de la categoría');
      },
    });
  }

  /**
   * Modal: crear producto (usa ProductoService.createProducto)
   */
  toggleModalAgregarProducto() {
    const opening = !this.abrirModalAddProducto();
    this.abrirModalAddProducto.set(opening);
    if (opening) {
      // reset form
      this.modoEdicion.set(false);
      this.productoEditandoId.set(null);
      this.resetProductForm();
    }
  }

  /**
   * Abre el modal en modo edición con los datos del producto
   * Reutiliza el mismo modal de crear pero precarga los datos existentes
   * @param producto - El producto a editar
   */
  editarProducto(producto: Productos) {
    this.modoEdicion.set(true);
    this.productoEditandoId.set(producto.id);

    // Poblar el formulario con los datos del producto
    this.productForm = {
      nombre: producto.nombre,
      descripcion: producto.caracteristicas || '',
      id_categoria: producto.id_categoria,
      id_deporte: producto.id_deporte,
      id_marca: producto.id_marca,
      es_nuevo: producto.es_nuevo,
    };

    // Cargar opciones de la categoría
    if (producto.id_categoria) {
      this.onCategoriaChange(producto.id_categoria);
    }

    // Abrir el modal
    this.abrirModalAddProducto.set(true);
  }

  private resetProductForm(): void {
    this.productForm = {
      nombre: '',
      descripcion: '',
      id_categoria: null,
      id_deporte: null,
      id_marca: null,
      es_nuevo: false,
    };
  }

  private validateProductForm(): string | null {
    if (!this.productForm.nombre || this.productForm.nombre.trim() === '') {
      return 'El nombre del producto es obligatorio';
    }
    if (this.productForm.nombre.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (!this.productForm.id_categoria) {
      return 'Debes seleccionar una categoría';
    }
    if (!this.productForm.id_marca) {
      return 'Debes seleccionar una marca';
    }
    if (!this.productForm.id_deporte) {
      return 'Debes seleccionar un deporte';
    }
    return null;
  }

  /**
   * Guarda el producto (crear o actualizar según el modo)
   * Este método maneja tanto la creación como la actualización de productos
   * utilizando el mismo formulario y lógica de validación
   */
  saveProducto() {
    // Validación del formulario
    const validationError = this.validateProductForm();
    if (validationError) {
      this.notificationService.error(validationError);
      return;
    }

    this.cargando.set(true);
    const payload = {
      nombre: this.productForm.nombre.trim(),
      descripcion: this.productForm.descripcion?.trim() || '',
      id_categoria: Number(this.productForm.id_categoria),
      id_marca: Number(this.productForm.id_marca),
      id_deporte: Number(this.productForm.id_deporte),
      es_nuevo: Boolean(this.productForm.es_nuevo),
    };

    // Verificar si estamos en modo edición o creación
    if (this.modoEdicion() && this.productoEditandoId()) {
      // MODO EDICIÓN
      this.productoService.updateProducto(this.productoEditandoId()!, payload).subscribe({
        next: (res) => {
          this.abrirModalAddProducto.set(false);
          this.modoEdicion.set(false);
          this.productoEditandoId.set(null);
          this.resetProductForm();

          this.notificationService.success('Producto actualizado exitosamente');

          // Refrescar lista
          this.cargarTodo();
          this.cargando.set(false);
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Error al actualizar el producto';
          this.notificationService.error(errorMsg);
          this.cargando.set(false);
        },
      });
    } else {
      // MODO CREACIÓN
      this.productoService.createProducto(payload).subscribe({
        next: (res) => {
          const id = res?.id_producto || res?.id || null;
          this.abrirModalAddProducto.set(false);
          this.resetProductForm();

          this.notificationService.success('Producto creado exitosamente');

          // Refrescar lista
          this.cargarTodo();

          // Si se obtuvo ID, abrir detalle para agregar variantes
          if (id) {
            this.productoExpandido.set(id);
            this.cargandoVariantes.set(true);
            this.productoService.getProductoDetalleAdmin(id).subscribe({
              next: (detalle) => {
                this.detalleProducto.set(detalle);
                this.cargandoVariantes.set(false);
              },
              error: (err) => {
                // Si es un 404, significa que el producto no tiene variantes aún (caso normal para productos nuevos)
                if (err?.status === 404) {
                  // Crear un objeto detalle vacío para permitir agregar variantes
                  this.detalleProducto.set({
                    id_producto: id,
                    nombre: payload.nombre,
                    descripcion: payload.descripcion,
                    id_categoria: payload.id_categoria,
                    nombre_categoria:
                      this.categorias().find((c) => c.id_categoria === payload.id_categoria)
                        ?.nombre_categoria || '',
                    id_deporte: payload.id_deporte,
                    nombre_deporte:
                      this.deportes().find((d) => d.id_deporte === payload.id_deporte)
                        ?.nombre_deporte || '',
                    id_marca: payload.id_marca,
                    nombre_marca:
                      this.marcas().find((m) => m.id_marca === payload.id_marca)?.nombre_marca || '',
                    es_nuevo: payload.es_nuevo,
                    variantes: [], // Sin variantes inicialmente
                  });
                  this.cargandoVariantes.set(false);
                } else {
                  // Otros errores sí son problemáticos
                  this.notificationService.error('Error al cargar el detalle del producto');
                  this.cargandoVariantes.set(false);
                  this.productoExpandido.set(null);
                }
              },
            });
          }
          this.cargando.set(false);
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Error al crear el producto';
          this.notificationService.error(errorMsg);
          this.cargando.set(false);
        },
      });
    }
  }

  /**
   * Modal variantes: abrir modal para un producto específico en modo creación
   */
  abrirModalVariantesPara(productoId: number) {
    this.currentModalProductId = productoId;
    this.modoEdicionVariante.set(false); // Modo creación
    this.varianteEditandoId.set(null);

    // Obtener la categoría del producto desde detalleProducto o currentCategoriaId
    const categoriaId = this.detalleProducto()?.id_categoria || this.currentCategoriaId;

    if (!categoriaId) {
      this.notificationService.error('No se pudo determinar la categoría del producto');
      return;
    }

    // Cargar opciones específicas de la categoría
    this.productoService.getOpcionesPorCategoria(categoriaId).subscribe({
      next: (opciones) => {
        this.opcionesModal = opciones;
        this.varianteRows = [this._nuevoRowVariante(this.opcionesModal)];
        this.abrirModalAddVariante.set(true);
      },
      error: (err) => {
        console.error('Error al cargar opciones:', err);
        this.notificationService.error('Error al cargar las opciones de variantes');
      },
    });
  }

  _nuevoRowVariante(opciones: any[] = []) {
    const row = {
      sku: '',
      precio: 0,
      stock: 0,
      url_images_str: '', // legacy: comma-separated (kept for backward compat)
      files: [] as File[],
      previewImages: [] as string[],
      existingImages: [] as string[], // URLs de imágenes existentes (para edición)
      // valores: array por cada opcion disponible: { id_opcion, id_valor|null, isNew, new_valor }
      valores: (opciones || []).map((o: any) => ({
        id_opcion: o.id_opcion,
        id_valor: null,
        isNew: false,
        new_valor: '',
      })),
    };

    // Generar SKU inicial
    row.sku = this.generateSKU(row);

    return row;
  }

  /**
   * Actualiza el SKU cuando se modifica un valor personalizado
   */
  onCustomValueChange(row: any): void {
    row.sku = this.generateSKU(row);
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

  /**
   * Genera un SKU automático basado en las opciones seleccionadas
   * Formato: PRODUCTO-OPCION1-OPCION2-...
   * Ejemplo: NIKE-ROJO-M, ADIDAS-AZUL-XL
   */
  private generateSKU(row: any): string {
    if (!this.detalleProducto()) return '';

    // Obtener el nombre base del producto (primeras 3-4 letras en mayúsculas)
    const productoNombre = this.detalleProducto()?.nombre || 'PROD';
    const productoBase = productoNombre
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const partes: string[] = [productoBase];

    // Agregar valores seleccionados de cada opción
    row.valores.forEach((entry: any, index: number) => {
      if (!entry) return;

      // Si es un valor nuevo (custom)
      if (entry.isNew && entry.new_valor) {
        const valorLimpio = entry.new_valor
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '');
        if (valorLimpio) partes.push(valorLimpio);
      }
      // Si es un valor existente seleccionado
      else if (entry.id_valor && this.opcionesModal[index]) {
        const opcion = this.opcionesModal[index];
        const valorObj = opcion.valores.find((v: any) => v.id_valor === entry.id_valor);
        if (valorObj) {
          const valorLimpio = valorObj.valor
            .substring(0, 3)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
          if (valorLimpio) partes.push(valorLimpio);
        }
      }
    });

    // Si solo hay el nombre del producto, agregar un número aleatorio
    if (partes.length === 1) {
      partes.push(
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')
      );
    }

    return partes.join('-');
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
      // Regenerar SKU después del cambio
      row.sku = this.generateSKU(row);
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

    // Regenerar SKU después del cambio
    row.sku = this.generateSKU(row);
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
      this.notificationService.error('Seleccione al menos una opción para generar combinaciones');
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
      const row = {
        sku: '',
        precio: 0,
        stock: 0,
        url_images_str: '',
        files: [] as File[],
        previewImages: [] as string[],
        valores: this.opcionesModal.map((o: any, oi: number) => {
          const pos = optionIndices.indexOf(oi);
          if (pos === -1)
            return { id_opcion: o.id_opcion, id_valor: null, isNew: false, new_valor: '' };
          return { id_opcion: o.id_opcion, id_valor: combo[pos], isNew: false, new_valor: '' };
        }),
      };

      // Generar SKU automáticamente para esta combinación
      row.sku = this.generateSKU(row);

      return row;
    });

    // Reemplazar rows actuales por las generadas
    this.varianteRows = newRows;

    this.notificationService.success(
      `${newRows.length} variante(s) generada(s) con SKU automático`
    );
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
    this.subiendoImagenes.set(false);
    this.modoEdicionVariante.set(false);
    this.varianteEditandoId.set(null);
  }

  /**
   * Envía las variantes al backend (crear o actualizar según el modo)
   * Proceso:
   * 1. Valida que haya un producto seleccionado
   * 2. Para cada variante con archivos nuevos, sube las imágenes a Cloudinary
   * 3. Construye el payload con las URLs de las imágenes
   * 4. Crea o actualiza las variantes en el backend
   */
  async submitVariantes() {
    if (!this.currentModalProductId) {
      this.notificationService.error('Producto no seleccionado para añadir variantes');
      return;
    }

    // Modo edición: solo debe haber una variante
    if (this.modoEdicionVariante() && this.varianteEditandoId()) {
      await this.updateVarianteExistente();
      return;
    }

    // Modo creación: crear múltiples variantes
    await this.crearVariantesNuevas();
  }

  /**
   * Actualiza una variante existente
   */
  private async updateVarianteExistente() {
    if (!this.currentModalProductId || !this.varianteEditandoId()) {
      this.notificationService.error('Datos de variante incompletos');
      return;
    }

    try {
      this.subiendoImagenes.set(true);
      this.cargandoVariantes.set(true);

      const row = this.varianteRows[0]; // Solo hay una en modo edición
      let url_images: string[] = [...(row.existingImages || [])]; // Mantener imágenes existentes

      // Si hay archivos nuevos, subirlos a Cloudinary
      if (row.files && row.files.length > 0) {
        try {
          console.log(`Subiendo ${row.files.length} imagen(es) nueva(s)...`);

          const uploadPromises = row.files.map((file: File) =>
            this.cloudinaryService.uploadProductImage(file).toPromise()
          );

          const uploadResults = await Promise.all(uploadPromises);

          // Agregar las nuevas URLs
          const nuevasUrls = uploadResults
            .filter(result => result && result.success)
            .map(result => result!.url);

          url_images = [...url_images, ...nuevasUrls];

          if (nuevasUrls.length !== row.files.length) {
            console.warn(`Solo se subieron ${nuevasUrls.length} de ${row.files.length} imágenes`);
          }
        } catch (uploadError) {
          console.error('Error al subir imágenes:', uploadError);
          this.notificationService.error('Error al subir algunas imágenes');
        }
      }

      this.subiendoImagenes.set(false);

      // Construir payload de actualización
      const updatePayload: any = {
        sku: row.sku,
        precio: Number(row.precio) || 0,
        stock: Number(row.stock) || 0,
        url_images,
      };

      // Actualizar la variante
      this.productoService.updateVariante(
        this.currentModalProductId,
        this.varianteEditandoId()!,
        updatePayload
      ).subscribe({
        next: () => {
          this.notificationService.success('Variante actualizada exitosamente');

          // Cerrar modal y resetear estado
          this.abrirModalAddVariante.set(false);
          this.currentModalProductId = null;
          this.varianteRows = [];
          this.modoEdicionVariante.set(false);
          this.varianteEditandoId.set(null);

          // Recargar detalle del producto
          const prodId = this.detalleProducto()?.id_producto;
          if (prodId) {
            this.productoService.getProductoDetalleAdmin(prodId).subscribe({
              next: (detalle) => {
                this.detalleProducto.set(detalle);
                this.cargandoVariantes.set(false);
              },
              error: () => {
                this.cargandoVariantes.set(false);
              },
            });
          } else {
            this.cargandoVariantes.set(false);
          }

          // Refrescar lista de productos
          this.cargarTodo();
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Error al actualizar la variante';
          this.notificationService.error(errorMsg);
          this.cargandoVariantes.set(false);
        },
      });
    } catch (error) {
      console.error('Error en updateVarianteExistente:', error);
      this.notificationService.error('Error al procesar la actualización');
      this.subiendoImagenes.set(false);
      this.cargandoVariantes.set(false);
    }
  }

  /**
   * Crea nuevas variantes
   */
  private async crearVariantesNuevas() {
    if (!this.currentModalProductId) {
      this.notificationService.error('Producto no seleccionado para añadir variantes');
      return;
    }

    try {
      this.subiendoImagenes.set(true);
      this.cargandoVariantes.set(true);

      // Procesar cada variante y subir sus imágenes
      const variantesConImagenes = [];

      for (const row of this.varianteRows) {
        let url_images: string[] = [];

        // Si hay archivos seleccionados, subirlos a Cloudinary
        if (row.files && row.files.length > 0) {
          try {
            console.log(`Subiendo ${row.files.length} imagen(es) para ${row.sku}...`);

            // Subir todas las imágenes de esta variante
            const uploadPromises = row.files.map((file: File) =>
              this.cloudinaryService.uploadProductImage(file).toPromise()
            );

            const uploadResults = await Promise.all(uploadPromises);

            // Extraer las URLs de las respuestas
            url_images = uploadResults
              .filter(result => result && result.success)
              .map(result => result!.url);

            if (url_images.length !== row.files.length) {
              console.warn(`Solo se subieron ${url_images.length} de ${row.files.length} imágenes para ${row.sku}`);
            }
          } catch (uploadError) {
            console.error('Error al subir imágenes:', uploadError);
            this.notificationService.error(`Error al subir imágenes para ${row.sku}`);
            // Continuar con las demás variantes
          }
        }
        // Si no hay archivos pero hay URLs en string (legacy), usarlas
        else if (row.url_images_str) {
          url_images = row.url_images_str
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }

        // Construir valores de la variante
        const valores = (row.valores || []).map((entry: any) => {
          if (entry.isNew) {
            return { id_opcion: entry.id_opcion, valor: entry.new_valor };
          }
          return Number(entry.id_valor);
        });

        variantesConImagenes.push({
          sku: row.sku,
          precio: Number(row.precio) || 0,
          stock: Number(row.stock) || 0,
          url_images,
          valores,
        });
      }

      this.subiendoImagenes.set(false);

      // Crear las variantes en el backend
      this.productoService.createVariantes(this.currentModalProductId, variantesConImagenes).subscribe({
        next: (res) => {
          this.notificationService.success('Variantes creadas exitosamente con sus imágenes');

          // Cerrar modal y resetear estado
          this.abrirModalAddVariante.set(false);
          this.currentModalProductId = null;
          this.varianteRows = [];

          // Recargar detalle del producto
          const prodId = res?.id_producto || this.productoExpandido();
          if (prodId) {
            this.productoService.getProductoDetalleAdmin(prodId).subscribe({
              next: (detalle) => {
                this.detalleProducto.set(detalle);
                this.cargandoVariantes.set(false);
              },
              error: (err) => {
                if (err?.status === 404) {
                  console.warn('No se pudieron cargar las variantes después de crearlas');
                } else {
                  console.error('Error recargando detalle tras crear variantes:', err);
                }
                this.cargandoVariantes.set(false);
              },
            });
          } else {
            this.cargandoVariantes.set(false);
          }

          // Refrescar lista de productos
          this.cargarTodo();
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Error al crear variantes';
          this.notificationService.error(errorMsg);
          this.cargandoVariantes.set(false);
        },
      });
    } catch (error) {
      console.error('Error en submitVariantes:', error);
      this.notificationService.error('Error al procesar las variantes');
      this.subiendoImagenes.set(false);
      this.cargandoVariantes.set(false);
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
        // Si es un 404, significa que el producto no tiene variantes aún (caso válido)
        if (error?.status === 404) {
          // Crear un objeto detalle con la información disponible del producto
          this.detalleProducto.set({
            id_producto: producto.id,
            nombre: producto.nombre,
            descripcion: producto.caracteristicas || '',
            id_categoria: producto.id_categoria,
            nombre_categoria: producto.nombre_categoria,
            id_deporte: producto.id_deporte,
            nombre_deporte: producto.deporte,
            id_marca: producto.id_marca,
            nombre_marca: producto.marca,
            es_nuevo: producto.es_nuevo,
            variantes: [], // Sin variantes
          });
          this.cargandoVariantes.set(false);
        } else {
          // Otros errores son problemáticos
          this.notificationService.error('Error al cargar las variantes del producto');
          this.cargandoVariantes.set(false);
          this.productoExpandido.set(null);
        }
      },
    });
  }

  /**
   * Abre el modal de edición de variante con los datos precargados
   * @param variante - La variante a editar
   */
  editarVariante(variante: VarianteProducto) {
    const productoId = this.detalleProducto()?.id_producto;
    const categoriaId = this.detalleProducto()?.id_categoria;

    if (!productoId || !categoriaId) {
      this.notificationService.error('No se pudo determinar el producto o categoría');
      return;
    }

    // Activar modo edición
    this.modoEdicionVariante.set(true);
    this.varianteEditandoId.set(variante.id_variante);
    this.currentModalProductId = productoId;

    // Cargar opciones específicas de la categoría
    this.productoService.getOpcionesPorCategoria(categoriaId).subscribe({
      next: (opciones) => {
        this.opcionesModal = opciones;

        // Construir el row de variante con los datos existentes
        const varianteRow = {
          sku: variante.sku,
          precio: variante.precio,
          stock: variante.stock,
          url_images_str: '', // No se usa en edición
          files: [] as File[], // Nuevos archivos a subir (opcional)
          previewImages: [...variante.imagenes], // Imágenes existentes como preview
          existingImages: [...variante.imagenes], // URLs existentes que se mantienen
          valores: opciones.map((opcion: any) => {
            // Buscar si esta variante tiene un valor para esta opción
            const valorExistente = variante.valores.find(
              (v: any) => v.id_opcion === opcion.id_opcion
            );

            if (valorExistente) {
              return {
                id_opcion: opcion.id_opcion,
                id_valor: valorExistente.id_valor,
                isNew: false,
                new_valor: '',
              };
            }

            // Si no tiene valor para esta opción, dejar en null
            return {
              id_opcion: opcion.id_opcion,
              id_valor: null,
              isNew: false,
              new_valor: '',
            };
          }),
        };

        // Establecer esta variante como la única en el modal
        this.varianteRows = [varianteRow];

        // Abrir el modal
        this.abrirModalAddVariante.set(true);
      },
      error: (err) => {
        console.error('Error al cargar opciones:', err);
        this.notificationService.error('Error al cargar las opciones de variantes');
      },
    });
  }

  async eliminarVariante(variante: VarianteProducto) {
    if (!variante || !variante.id_variante) {
      this.notificationService.error('Variante inválida');
      return;
    }

    const productoId = this.detalleProducto()?.id_producto;
    if (!productoId) {
      this.notificationService.error('No se pudo determinar el producto');
      return;
    }

    // Confirmar antes de eliminar
    if (!confirm(`¿Estás seguro de eliminar la variante ${variante.sku}?`)) {
      return;
    }

    this.cargandoVariantes.set(true);

    try {
      // 1. Primero eliminar las imágenes de Cloudinary (si existen)
      if (variante.imagenes && variante.imagenes.length > 0) {
        // El usuario verá el indicador de carga (cargandoVariantes)

        // Extraer los public_ids de las URLs de Cloudinary
        const deletePromises = variante.imagenes.map((url: string) => {
          // Extraer el public_id de la URL de Cloudinary
          // Formato típico: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{extension}
          const match = url.match(/\/v\d+\/(.+)\.\w+$/);
          if (match && match[1]) {
            const publicId = match[1];
            return this.cloudinaryService.deleteImage(publicId).toPromise();
          }
          return Promise.resolve(null);
        });

        // Esperar a que todas las imágenes se eliminen
        const results = await Promise.all(deletePromises);
        console.log('Resultados de eliminación de imágenes:', results);
      }

      // 2. Si las imágenes se eliminaron correctamente (o no había imágenes), proceder a eliminar la variante
      this.productoService.deleteVariante(productoId, variante.id_variante).subscribe({
        next: () => {
          // Mensaje personalizado según si había imágenes o no
          const mensaje = variante.imagenes && variante.imagenes.length > 0
            ? 'Variante e imágenes eliminadas exitosamente'
            : 'Variante eliminada exitosamente';
          this.notificationService.success(mensaje);

          // Recargar el detalle del producto para actualizar la lista de variantes
          this.productoService.getProductoDetalleAdmin(productoId).subscribe({
            next: (detalle) => {
              this.detalleProducto.set(detalle);
              this.cargandoVariantes.set(false);
            },
            error: (err) => {
              // Si es 404, significa que se eliminó la última variante
              if (err?.status === 404) {
                // Mantener el producto pero sin variantes
                const currentDetail = this.detalleProducto();
                if (currentDetail) {
                  this.detalleProducto.set({
                    ...currentDetail,
                    variantes: []
                  });
                }
              }
              this.cargandoVariantes.set(false);
            }
          });

          // Recargar lista de productos
          this.cargarTodo();
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Error al eliminar la variante';
          this.notificationService.error(errorMsg);
          this.cargandoVariantes.set(false);
          console.error('Error al eliminar variante:', err);
        }
      });

    } catch (error) {
      // Si hubo error al eliminar las imágenes, NO eliminar la variante
      console.error('Error al eliminar imágenes de Cloudinary:', error);
      this.notificationService.error('Error al eliminar las imágenes. La variante no se eliminó para mantener la consistencia.');
      this.cargandoVariantes.set(false);
    }
  }

  eliminarProducto(producto: Productos) {
    console.log('Eliminar producto con ID:', producto.id);
    this.cargando.set(true);
    this.productoService.deleteProducto(producto.id).subscribe({
      next: () => {
        this.notificationService.success('Producto eliminado exitosamente');
        // this.cargando.set(false);
        this.cargarTodo();
      },
      error: (err) => {
        this.notificationService.error('Error al eliminar producto');
        console.error(err);
      },
    });
  }

  /** Open admin page to manage opciones (best-effort). */
  openOpcionesAdmin() {
    try {
      // Try to open the admin options page in a new tab if route exists
      window.open('/admin/opciones', '_blank');
      this.notificationService.success('Abriendo panel de opciones en una nueva pestaña');
    } catch (err) {
      this.notificationService.error('No se pudo abrir el panel de opciones automáticamente');
    }
  }

  // toggleModalAgregarProducto() {
  //   this.abrirModalAddProducto.set(!this.abrirModalAddProducto());
  //   console.log('Abrir modal para agregar nuevo producto' + this.abrirModalAddProducto());
  //   // Lógica para abrir el modal (a implementar)
  // }
}
