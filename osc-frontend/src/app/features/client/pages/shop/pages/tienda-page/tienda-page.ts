import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '@shared/services/index';
import { CategoriaService } from '@shared/services/index';
import { Categoria } from '@shared/models/index';
import { FiltrosProducto } from '@shared/models/index';
import { Productos } from '@shared/models/index';
import { DeporteSelector } from '../../components/deporte-selector/deporte-selector';
import { FiltroPanelComponent } from '../../components/filtro-panel/filtro-panel';
import { ProductoCard } from '../../components/producto-card/producto-card';
import { FiltrosService } from '../../services/filtros.service';
import { OPCIONES_ORDENAMIENTO, OpcionOrdenamiento } from '../../shared/constants/ordenamiento.constants';
import { ProductosCacheService } from '../../services/productos-cache.service';

@Component({
  selector: 'app-tienda-page',
  templateUrl: './tienda-page.html',
  styleUrls: ['./tienda-page.css'],
  imports: [CommonModule, DeporteSelector, FiltroPanelComponent, ProductoCard],
})
export class TiendaPage implements OnInit, OnDestroy {
  // ===== Services (inject pattern) =====
  private productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);
  private categoriaService = inject(CategoriaService);
  private cacheService = inject(ProductosCacheService); // 🆕 Servicio de caché

  // 🆕 Servicio centralizado de filtros
  filtrosService = inject(FiltrosService);

  // ===== ViewChild para el sentinel (elemento observado) =====
  sentinelElement = viewChild<ElementRef>('scrollSentinel');

  // ===== Signals =====
  categorias = signal<Categoria[]>([]);
  productos = signal<Productos[]>([]);
  deporteSeleccionado = signal<number>(0); // 0 = Todos los deportes
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false); // 🆕 Loading para scroll infinito

  // Información de paginación
  totalProductos = signal<number>(0);

  // 🆕 Control de scroll infinito
  modoScrollInfinito = signal<boolean>(true); // Activar/desactivar scroll infinito
  private intersectionObserver?: IntersectionObserver;

  // 🆕 Ordenamiento
  opcionesOrdenamiento: OpcionOrdenamiento[] = OPCIONES_ORDENAMIENTO;
  dropdownOrdenamientoAbierto = signal<boolean>(false);

  // ===== Computed values =====
  totalPaginas = computed(() => {
    const total = this.totalProductos();
    const perPage = this.filtrosService.filtros().per_page || 24;
    return Math.ceil(total / perPage);
  });

  // 🆕 Computed para saber si hay más páginas para cargar
  hayMasPaginas = computed(() => {
    const paginaActual = this.filtrosService.filtros().page || 1;
    return paginaActual < this.totalPaginas();
  });

  // 🆕 Computed para obtener la opción de ordenamiento actual
  ordenamientoActual = computed(() => {
    const sortActual = this.filtrosService.filtros().sort || 'relevance';
    return this.opcionesOrdenamiento.find(op => op.valor === sortActual) || this.opcionesOrdenamiento[0];
  });

  // Mostrar skeleton inicialmente hasta que la primera petición termine
  skeletonItems = Array(12).fill(0);

  // ===== Constructor con effect =====
  constructor() {
    // Effect para detectar cambios en deporteSeleccionado y actualizar filtros
    effect(() => {
      const deporte = this.deporteSeleccionado();

      // Si deporte es 0 (Todos), limpiar filtro de deportes
      // Si es > 0, aplicar filtro de deporte específico
      if (deporte === 0) {
        this.filtrosService.actualizarFiltros({
          deportes: []
        });
      } else if (deporte > 0) {
        this.filtrosService.actualizarFiltros({
          deportes: [deporte]
        });
      }
    });

    // 🆕 Effect para recargar productos cuando cambian los filtros
    effect(() => {
      // Leer los filtros del servicio (esto hace que el effect se suscriba a cambios)
      const filtros = this.filtrosService.filtros();

      // Solo cargar si ya se inicializó (evitar doble carga en ngOnInit)
      if (this.categorias().length > 0) {
        // Cuando cambian los filtros (no la página), resetear productos
        if (filtros.page === 1) {
          this.cargarProductos();
        } else {
          // Si es cambio de página en modo scroll infinito, cargar más
          if (this.modoScrollInfinito()) {
            this.cargarMasProductos();
          } else {
            this.cargarProductos();
          }
        }
      }
    });

    // 🆕 Configurar IntersectionObserver después del render
    afterNextRender(() => {
      this.configurarScrollInfinito();
      this.configurarCierreDropdown();
    });
  }

  ngOnInit() {
    // Cargar categorias para validar query params
    this.categoriaService.getCategorias().subscribe(
      (cats: Categoria[]) => {
        this.categorias.set(cats);

        this.route.queryParams.subscribe((params) => {
          const qcat = params['categoria'];
          if (qcat) {
            // Convertir a número si viene como string
            const categoriaId = Number(qcat);

            // Validar que exista la categoria por id_categoria
            const found = this.categorias().find((c) => c.id_categoria === categoriaId);
            if (found) {
              this.filtrosService.actualizarFiltros({
                categorias: [categoriaId]
              });
            }
          }
          this.cargarProductos();
        });
      },
      (err: any) => {
        // aunque fallen las categorias, seguimos cargando productos sin filtrar por categoria
        this.route.queryParams.subscribe((params) => {
          const qcat = params['categoria'];
          if (qcat) {
            const categoriaId = Number(qcat);
            this.filtrosService.actualizarFiltros({
              categorias: [categoriaId]
            });
          }
          this.cargarProductos();
        });
      }
    );
  }

  /**
   * Maneja cambios en los filtros del panel lateral
   * Cuando cambian los filtros, se resetea a la página 1 y se recargan productos
   */
  onFiltrosChange(filtros: FiltrosProducto) {
    // Actualizar filtros en el servicio centralizado
    this.filtrosService.actualizarFiltros(filtros);
  }

  /**
   * Carga productos desde el backend usando el nuevo endpoint de búsqueda.
   *
   * El filtrado ahora se hace en el BACKEND, no en el frontend.
   * Solo enviamos los filtros activos y el backend nos devuelve los productos ya filtrados.
   *
   * Ventajas:
   * - Más eficiente (menos datos transferidos)
   * - Filtrado más rápido (se hace en la base de datos)
   * - Paginación real (no cargar todos los productos)
   * - Código más simple y mantenible
   * - 🆕 Caché de resultados para mejorar rendimiento
   */
  private cargarProductos() {
    this.isLoading.set(true);

    // Obtener filtros del servicio centralizado
    const filtros = this.filtrosService.filtros();

    // 🆕 Intentar obtener del caché primero
    const cachedData = this.cacheService.get(filtros);
    if (cachedData) {
      // Datos encontrados en caché, usarlos directamente
      this.productos.set(cachedData.data);
      this.totalProductos.set(cachedData.total);
      this.isLoading.set(false);
      return;
    }

    // Si no hay caché, llamar al backend
    this.productoService.searchProductos(filtros).subscribe({
      next: (response) => {
        // 🆕 Guardar en caché para futuras consultas
        this.cacheService.set(filtros, response);

        // Asignar productos ya filtrados por el backend (reemplaza los existentes)
        this.productos.set(response.data);
        this.totalProductos.set(response.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.productos.set([]);
        this.totalProductos.set(0);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * 🆕 Carga más productos para scroll infinito (acumula productos)
   */
  private cargarMasProductos() {
    // Evitar múltiples cargas simultáneas
    if (this.isLoadingMore()) return;

    this.isLoadingMore.set(true);

    // Obtener filtros del servicio centralizado
    const filtros = this.filtrosService.filtros();

    // Llamar al nuevo endpoint que hace el filtrado en el backend
    this.productoService.searchProductos(filtros).subscribe({
      next: (response) => {
        // 🆕 Acumular productos (no reemplazar)
        this.productos.update(productosActuales => [
          ...productosActuales,
          ...response.data
        ]);
        this.totalProductos.set(response.total);
        this.isLoadingMore.set(false);
      },
      error: (error) => {
        this.isLoadingMore.set(false);
        console.error('Error al cargar más productos:', error);
      }
    });
  }

  /**
   * 🆕 Configura el IntersectionObserver para scroll infinito
   */
  private configurarScrollInfinito() {
    // Limpiar observer anterior si existe
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Crear nuevo observer
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Cuando el sentinel es visible y hay más páginas
          if (entry.isIntersecting && this.hayMasPaginas() && !this.isLoadingMore() && this.modoScrollInfinito()) {
            // Cargar siguiente página
            const paginaActual = this.filtrosService.filtros().page || 1;
            this.filtrosService.cambiarPagina(paginaActual + 1);
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '200px', // Empezar a cargar 200px antes de llegar al final
        threshold: 0.1
      }
    );

    // Observar el elemento sentinel
    const sentinel = this.sentinelElement()?.nativeElement;
    if (sentinel) {
      this.intersectionObserver.observe(sentinel);
    }
  }

  /**
   * 🆕 Toggle dropdown de ordenamiento
   */
  toggleDropdownOrdenamiento() {
    this.dropdownOrdenamientoAbierto.update(estado => !estado);
  }

  /**
   * 🆕 Cerrar dropdown de ordenamiento
   */
  cerrarDropdownOrdenamiento() {
    this.dropdownOrdenamientoAbierto.set(false);
  }

  /**
   * 🆕 Cambiar ordenamiento
   */
  cambiarOrdenamiento(opcion: OpcionOrdenamiento) {
    this.filtrosService.actualizarOrdenamiento(opcion.valor);
    this.cerrarDropdownOrdenamiento();
  }

  /**
   * 🆕 Toggle entre scroll infinito y paginación clásica
   */
  toggleModoScrollInfinito() {
    this.modoScrollInfinito.update(modo => !modo);

    if (this.modoScrollInfinito()) {
      // Reconfigurar observer
      this.configurarScrollInfinito();
    } else {
      // Desconectar observer
      this.intersectionObserver?.disconnect();
      // Volver a página 1 en modo paginación clásica
      this.filtrosService.cambiarPagina(1);
    }
  }

  /**
   * 🆕 Configura el listener para cerrar dropdown al hacer click fuera
   */
  private configurarCierreDropdown() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = target.closest('.dropdown-ordenamiento');

      // Si el click NO fue dentro del dropdown, cerrarlo
      if (!dropdown && this.dropdownOrdenamientoAbierto()) {
        this.cerrarDropdownOrdenamiento();
      }
    });
  }

  /**
   * Cambia a una página específica
   * @param pagina - Número de página a cargar
   */
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return; // Validar límites
    }
    this.filtrosService.cambiarPagina(pagina);
  }

  /**
   * Limpia todos los filtros y recarga productos sin filtrar
   */
  limpiarFiltros() {
    this.deporteSeleccionado.set(1); // Resetear al primer deporte (default)
    this.filtrosService.limpiarFiltros();
    this.cacheService.invalidar(); // 🆕 Invalidar caché al limpiar filtros
  }

  /**
   * 🆕 Cleanup al destruir el componente
   */
  ngOnDestroy() {
    // Desconectar IntersectionObserver para evitar memory leaks
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  /**
   * Obtiene las páginas cercanas a la actual para mostrar en la paginación
   * Ejemplo: Si estás en página 5, muestra [3, 4, 5, 6, 7]
   */
  getPaginasCercanas(): number[] {
    const paginaActual = this.filtrosService.filtros().page || 1;
    const paginas: number[] = [];
    const rango = 2; // Mostrar 2 páginas antes y después de la actual

    const inicio = Math.max(1, paginaActual - rango);
    const fin = Math.min(this.totalPaginas(), paginaActual + rango);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }
}
