import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-tienda-page',
  templateUrl: './tienda-page.html',
  styleUrls: ['./tienda-page.css'],
  imports: [CommonModule, DeporteSelector, FiltroPanelComponent, ProductoCard],
})
export class TiendaPage implements OnInit {
  categorias: Categoria[] = [];
  productos: Productos[] = [];
  deporteSeleccionado: number = 1;
  // Mostrar skeleton inicialmente hasta que la primera petición termine
  isLoading: boolean = true;
  skeletonItems = Array(12).fill(0);

  // Filtros activos que se envían al backend
  filtrosActivos: FiltrosProducto = {
    categorias: [],
    marcas: [],
    deportes: [],
    is_new: undefined,
    q: '',
    sort: 'price_asc',
    page: 1,
    per_page: 24,
  };

  // Información de paginación
  totalProductos: number = 0;
  totalPaginas: number = 0;

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    // Cargar categorias para validar query params
    this.categoriaService.getCategorias().subscribe(
      (cats: Categoria[]) => {
        this.categorias = cats;

        this.route.queryParams.subscribe((params) => {
          const qcat = params['categoria'];
          if (qcat) {
            // Convertir a número si viene como string
            const categoriaId = Number(qcat);

            // Validar que exista la categoria por id_categoria
            const found = this.categorias.find((c) => c.id_categoria === categoriaId);
            if (found) {
              this.filtrosActivos.categorias = [categoriaId];
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
            this.filtrosActivos.categorias = [categoriaId];
          }
          this.cargarProductos();
        });
      }
    );
  }

  /**
   * Maneja cambios en el deporte seleccionado
   * Cuando cambia el deporte, se resetea a la página 1 y se recargan productos
   */
  onDeporteChange(deporte: number) {

    this.deporteSeleccionado = deporte;
    this.filtrosActivos.deportes = [deporte];
    this.filtrosActivos.page = 1; // Resetear a página 1 al cambiar filtro
    this.cargarProductos();
  }

  /**
   * Maneja cambios en los filtros del panel lateral
   * Cuando cambian los filtros, se resetea a la página 1 y se recargan productos
   */
  onFiltrosChange(filtros: FiltrosProducto) {
    // Mergear filtros nuevos con los actuales
    this.filtrosActivos = {
      ...this.filtrosActivos,
      ...filtros,
      page: 1 // Resetear a página 1 cuando cambian filtros
    };

    this.cargarProductos();
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
   */
  private cargarProductos() {
    this.isLoading = true;

    // Llamar al nuevo endpoint que hace el filtrado en el backend
    this.productoService.searchProductos(this.filtrosActivos).subscribe({
      next: (response) => {
        // Asignar productos ya filtrados por el backend
        this.productos = response.data;
        this.totalProductos = response.total;
        this.totalPaginas = response.total_pages;
        this.isLoading = false;
      },
      error: (error) => {
        this.productos = [];
        this.totalProductos = 0;
        this.totalPaginas = 0;
        this.isLoading = false;
      }
    });
  }

  /**
   * Cambia a una página específica
   * @param pagina - Número de página a cargar
   */
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return; // Validar límites
    }
    this.filtrosActivos.page = pagina;
    this.cargarProductos();
  }

  /**
   * Limpia todos los filtros y recarga productos sin filtrar
   */
  limpiarFiltros() {
    this.deporteSeleccionado = 1; // Resetear al primer deporte (default)
    this.filtrosActivos = {
      categorias: [],
      marcas: [],
      deportes: [],
      is_new: undefined,
      q: '',
      sort: 'price_asc',
      page: 1,
      per_page: 24,
    };
    this.cargarProductos();
  }

  /**
   * Obtiene las páginas cercanas a la actual para mostrar en la paginación
   * Ejemplo: Si estás en página 5, muestra [3, 4, 5, 6, 7]
   */
  getPaginasCercanas(): number[] {
    const paginaActual = this.filtrosActivos.page || 1;
    const paginas: number[] = [];
    const rango = 2; // Mostrar 2 páginas antes y después de la actual

    const inicio = Math.max(1, paginaActual - rango);
    const fin = Math.min(this.totalPaginas, paginaActual + rango);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }
}
