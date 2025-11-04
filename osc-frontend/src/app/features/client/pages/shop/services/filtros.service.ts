import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FiltrosProducto } from '@shared/models/index';
import { TipoOrdenamiento, STORAGE_KEY_ORDENAMIENTO } from '../shared/constants/ordenamiento.constants';

/**
 * Servicio centralizado para gestionar el estado de filtros de productos.
 *
 * Características:
 * - Estado global con signals
 * - Sincronización automática con URL query params
 * - Métodos helpers para actualizar filtros específicos
 * - Computed para saber si hay filtros activos
 */
@Injectable({
  providedIn: 'root'
})
export class FiltrosService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ====================
  // PRIVATE PROPERTIES
  // ====================

  /**
   * Timeout para debounce de búsqueda
   */
  private searchDebounceTimeout?: ReturnType<typeof setTimeout>;

  // ====================
  // SIGNALS - Estado global de filtros
  // ====================

  /**
   * Signal principal con todos los filtros activos
   * Inicia sin filtros para mostrar todos los productos
   */
  filtros = signal<FiltrosProducto>({
    categorias: [],
    marcas: [],
    deportes: [],
    colores: [],
    tallas: [],
    is_new: undefined,
    q: '',
    sort: this.cargarOrdenamientoDesdeStorage(),
    precioMin: undefined,
    precioMax: undefined,
    page: 1,
    per_page: 24,
  });

  /**
   * Computed que indica si hay algún filtro activo (excepto sort y paginación)
   */
  tieneFiltrosActivos = computed(() => {
    const filtros = this.filtros();
    return (
      (filtros.categorias?.length ?? 0) > 0 ||
      (filtros.marcas?.length ?? 0) > 0 ||
      (filtros.deportes?.length ?? 0) > 0 ||
      (filtros.colores?.length ?? 0) > 0 ||
      (filtros.tallas?.length ?? 0) > 0 ||
      filtros.is_new !== undefined ||
      (filtros.q?.length ?? 0) > 0 ||
      filtros.precioMin !== undefined ||
      filtros.precioMax !== undefined
    );
  });

  /**
   * Computed para contar cuántos filtros están activos
   */
  contadorFiltrosActivos = computed(() => {
    const filtros = this.filtros();
    let contador = 0;

    if ((filtros.categorias?.length ?? 0) > 0) contador++;
    if ((filtros.marcas?.length ?? 0) > 0) contador++;
    if ((filtros.deportes?.length ?? 0) > 0) contador++;
    if ((filtros.colores?.length ?? 0) > 0) contador++;
    if ((filtros.tallas?.length ?? 0) > 0) contador++;
    if (filtros.is_new !== undefined) contador++;
    if ((filtros.q?.length ?? 0) > 0) contador++;
    if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) contador++;

    return contador;
  });

  constructor() {
    // Effect para sincronizar filtros con URL query params
    effect(() => {
      const filtros = this.filtros();
      this.sincronizarConURL(filtros);
    }, { allowSignalWrites: false });

    // Inicializar filtros desde URL al arrancar
    this.inicializarDesdURL();
  }

  // ====================
  // MÉTODOS PÚBLICOS - Actualización de filtros
  // ====================

  /**
   * Actualiza los filtros completos
   */
  actualizarFiltros(nuevosFiltros: Partial<FiltrosProducto>) {
    this.filtros.update(filtrosActuales => ({
      ...filtrosActuales,
      ...nuevosFiltros,
      // Resetear página al cambiar filtros (excepto si se está cambiando la página)
      page: nuevosFiltros.page !== undefined ? nuevosFiltros.page : 1,
    }));
  }

  /**
   * Toggle para agregar/quitar una categoría
   */
  toggleCategoria(idCategoria: number) {
    this.filtros.update(filtros => {
      const categorias = [...(filtros.categorias || [])];
      const index = categorias.indexOf(idCategoria);

      if (index === -1) {
        categorias.push(idCategoria);
      } else {
        categorias.splice(index, 1);
      }

      return { ...filtros, categorias, page: 1 };
    });
  }

  /**
   * Toggle para agregar/quitar una marca
   */
  toggleMarca(idMarca: number) {
    this.filtros.update(filtros => {
      const marcas = [...(filtros.marcas || [])];
      const index = marcas.indexOf(idMarca);

      if (index === -1) {
        marcas.push(idMarca);
      } else {
        marcas.splice(index, 1);
      }

      return { ...filtros, marcas, page: 1 };
    });
  }

  /**
   * Toggle para agregar/quitar un deporte
   */
  toggleDeporte(idDeporte: number) {
    this.filtros.update(filtros => {
      const deportes = [...(filtros.deportes || [])];
      const index = deportes.indexOf(idDeporte);

      if (index === -1) {
        deportes.push(idDeporte);
      } else {
        deportes.splice(index, 1);
      }

      return { ...filtros, deportes, page: 1 };
    });
  }

  /**
   * Toggle para agregar/quitar un color
   */
  toggleColor(idValor: number) {
    this.filtros.update(filtros => {
      const colores = [...(filtros.colores || [])];
      const index = colores.indexOf(idValor);

      if (index === -1) {
        colores.push(idValor);
      } else {
        colores.splice(index, 1);
      }

      return { ...filtros, colores, page: 1 };
    });
  }

  /**
   * Toggle para agregar/quitar una talla
   */
  toggleTalla(idValor: number) {
    this.filtros.update(filtros => {
      const tallas = [...(filtros.tallas || [])];
      const index = tallas.indexOf(idValor);

      if (index === -1) {
        tallas.push(idValor);
      } else {
        tallas.splice(index, 1);
      }

      return { ...filtros, tallas, page: 1 };
    });
  }

  /**
   * Actualizar rango de precio
   */
  actualizarPrecio(precioMin?: number, precioMax?: number) {
    this.filtros.update(filtros => ({
      ...filtros,
      precioMin,
      precioMax,
      page: 1
    }));
  }

  /**
   * Actualizar término de búsqueda con debounce de 500ms
   * @param q - Término de búsqueda
   * @param immediate - Si es true, actualiza inmediatamente sin debounce
   */
  actualizarBusqueda(q: string, immediate: boolean = false) {
    // Limpiar timeout anterior si existe
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }

    if (immediate) {
      // Actualizar inmediatamente sin debounce
      this.filtros.update(filtros => ({
        ...filtros,
        q,
        page: 1
      }));
    } else {
      // Aplicar debounce de 500ms
      this.searchDebounceTimeout = setTimeout(() => {
        this.filtros.update(filtros => ({
          ...filtros,
          q,
          page: 1
        }));
      }, 500);
    }
  }

  /**
   * Actualizar ordenamiento y persistir en localStorage
   */
  actualizarOrdenamiento(sort: TipoOrdenamiento) {
    this.filtros.update(filtros => ({
      ...filtros,
      sort,
      page: 1 // Reset a página 1 cuando cambia el ordenamiento
    }));

    // Guardar en localStorage
    this.guardarOrdenamientoEnStorage(sort);
  }

  /**
   * Actualizar filtro de novedades
   */
  actualizarNovedades(is_new?: boolean) {
    this.filtros.update(filtros => ({
      ...filtros,
      is_new,
      page: 1
    }));
  }

  /**
   * Cambiar página
   */
  cambiarPagina(page: number) {
    this.filtros.update(filtros => ({
      ...filtros,
      page
    }));
  }

  /**
   * Limpiar todos los filtros (mantiene solo sort y per_page)
   */
  limpiarFiltros() {
    this.filtros.set({
      categorias: [],
      marcas: [],
      deportes: [],
      colores: [],
      tallas: [],
      is_new: undefined,
      q: '',
      sort: this.filtros().sort,
      precioMin: undefined,
      precioMax: undefined,
      page: 1,
      per_page: this.filtros().per_page,
    });
  }

  /**
   * Resetear completamente (incluye sort y per_page)
   */
  resetearCompleto() {
    this.filtros.set({
      categorias: [],
      marcas: [],
      deportes: [],
      colores: [],
      tallas: [],
      is_new: undefined,
      q: '',
      sort: 'price_asc',
      precioMin: undefined,
      precioMax: undefined,
      page: 1,
      per_page: 24,
    });
  }

  // ====================
  // MÉTODOS PRIVADOS - Sincronización con URL
  // ====================

  /**
   * Inicializa los filtros desde los query params de la URL
   */
  private inicializarDesdURL() {
    const queryParams = this.route.snapshot.queryParams;

    const filtrosDesdeURL: FiltrosProducto = {
      categorias: this.parsearArrayNumerico(queryParams['categorias']),
      marcas: this.parsearArrayNumerico(queryParams['marcas']),
      deportes: this.parsearArrayNumerico(queryParams['deportes']),
      colores: this.parsearArrayNumerico(queryParams['colores']),
      tallas: this.parsearArrayNumerico(queryParams['tallas']),
      is_new: queryParams['is_new'] === 'true' ? true :
              queryParams['is_new'] === 'false' ? false : undefined,
      q: queryParams['q'] || '',
      sort: queryParams['sort'] || 'price_asc',
      precioMin: queryParams['precioMin'] ? parseFloat(queryParams['precioMin']) : undefined,
      precioMax: queryParams['precioMax'] ? parseFloat(queryParams['precioMax']) : undefined,
      page: queryParams['page'] ? parseInt(queryParams['page'], 10) : 1,
      per_page: queryParams['per_page'] ? parseInt(queryParams['per_page'], 10) : 24,
    };

    // Solo actualizar si hay parámetros en la URL
    if (Object.keys(queryParams).length > 0) {
      this.filtros.set(filtrosDesdeURL);
    }
  }

  /**
   * Sincroniza el estado actual de filtros con la URL
   */
  private sincronizarConURL(filtros: FiltrosProducto) {
    const queryParams: any = {};

    // Solo agregar parámetros que tengan valores
    if (filtros.categorias && filtros.categorias.length > 0) {
      queryParams['categorias'] = filtros.categorias.join(',');
    }
    if (filtros.marcas && filtros.marcas.length > 0) {
      queryParams['marcas'] = filtros.marcas.join(',');
    }
    if (filtros.deportes && filtros.deportes.length > 0) {
      queryParams['deportes'] = filtros.deportes.join(',');
    }
    if (filtros.colores && filtros.colores.length > 0) {
      queryParams['colores'] = filtros.colores.join(',');
    }
    if (filtros.tallas && filtros.tallas.length > 0) {
      queryParams['tallas'] = filtros.tallas.join(',');
    }
    if (filtros.is_new !== undefined) {
      queryParams['is_new'] = filtros.is_new.toString();
    }
    if (filtros.q && filtros.q.length > 0) {
      queryParams['q'] = filtros.q;
    }
    if (filtros.sort && filtros.sort !== 'price_asc') {
      queryParams['sort'] = filtros.sort;
    }
    if (filtros.precioMin !== undefined) {
      queryParams['precioMin'] = filtros.precioMin.toString();
    }
    if (filtros.precioMax !== undefined) {
      queryParams['precioMax'] = filtros.precioMax.toString();
    }
    if (filtros.page && filtros.page > 1) {
      queryParams['page'] = filtros.page.toString();
    }
    if (filtros.per_page && filtros.per_page !== 24) {
      queryParams['per_page'] = filtros.per_page.toString();
    }

    // Actualizar URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Helper para parsear arrays numéricos desde string CSV
   */
  private parsearArrayNumerico(valor: string | undefined): number[] {
    if (!valor) return [];
    return valor.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
  }

  // ====================
  // MÉTODOS DE CONSULTA
  // ====================

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategoriaSeleccionada(idCategoria: number): boolean {
    return this.filtros().categorias?.includes(idCategoria) ?? false;
  }

  /**
   * Verifica si una marca está seleccionada
   */
  isMarcaSeleccionada(idMarca: number): boolean {
    return this.filtros().marcas?.includes(idMarca) ?? false;
  }

  /**
   * Verifica si un deporte está seleccionado
   */
  isDeporteSeleccionado(idDeporte: number): boolean {
    return this.filtros().deportes?.includes(idDeporte) ?? false;
  }

  /**
   * Verifica si un color está seleccionado
   */
  isColorSeleccionado(idValor: number): boolean {
    return this.filtros().colores?.includes(idValor) ?? false;
  }

  /**
   * Verifica si una talla está seleccionada
   */
  isTallaSeleccionada(idValor: number): boolean {
    return this.filtros().tallas?.includes(idValor) ?? false;
  }

  // ====================
  // MÉTODOS PRIVADOS - LocalStorage
  // ====================

  /**
   * Carga el ordenamiento guardado en localStorage
   */
  private cargarOrdenamientoDesdeStorage(): TipoOrdenamiento {
    if (typeof window === 'undefined') return 'relevance'; // SSR safety

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDENAMIENTO);
      if (stored) {
        const parsed = JSON.parse(stored) as TipoOrdenamiento;
        // Validar que sea un valor válido
        const valoresValidos: TipoOrdenamiento[] = ['relevance', 'price_asc', 'price_desc', 'newest', 'name_asc', 'name_desc'];
        if (valoresValidos.includes(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error al cargar ordenamiento desde localStorage:', error);
    }

    return 'relevance'; // Default
  }

  /**
   * Guarda el ordenamiento en localStorage
   */
  private guardarOrdenamientoEnStorage(sort: TipoOrdenamiento): void {
    if (typeof window === 'undefined') return; // SSR safety

    try {
      localStorage.setItem(STORAGE_KEY_ORDENAMIENTO, JSON.stringify(sort));
    } catch (error) {
      console.warn('Error al guardar ordenamiento en localStorage:', error);
    }
  }
}
