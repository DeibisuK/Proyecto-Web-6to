import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { Categoria } from '../../../../../core/models/categoria.model';
import { FiltrosProducto } from '../../models/filtros-producto';
import { Producto, Productoa } from '../../models/producto';
import { DeporteSelector } from '../../components/deporte-selector/deporte-selector';
import { FiltroPanelComponent } from '../../components/filtro-panel/filtro-panel';
import { ProductoCard } from '../../components/producto-card/producto-card';

@Component({
  selector: 'app-tienda-page',
  templateUrl: './tienda-page.html',
  styleUrl: './tienda-page.css',
  imports: [CommonModule, DeporteSelector, FiltroPanelComponent, ProductoCard],
})
export class TiendaPage implements OnInit {
  categorias: Categoria[] = [];
  productos: Productoa[] = [];
  deporteSeleccionado: string = 'todos';
  isLoading: boolean = false;
  skeletonItems = Array(12).fill(0);

  filtrosActivos: FiltrosProducto = {
    deporte: 'todos',
    precioMin: 0,
    precioMax: 1000,
    tallas: [],
    color: [],
    marca: [],
    categoria: [],
    ordenamiento: 'relevancia',
    pagina: 1,
    porPagina: 12,
  };

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
            // validar que exista la categoria por id_categoria
            const found = this.categorias.find((c) => c.id_categoria === qcat);
            if (found) {
              this.filtrosActivos.categoria = [qcat];
            }
          }
          this.cargarProductos();
        });
      },
      (err: any) => {
        console.error('Error cargando categorias en TiendaPage', err);
        // aunque fallen las categorias, seguimos cargando productos sin filtrar por categoria
        this.route.queryParams.subscribe((params) => {
          if (params['categoria']) {
            this.filtrosActivos.categoria = [params['categoria']];
          }
          this.cargarProductos();
        });
      }
    );
  }

  onDeporteChange(deporte: string) {
    console.log('\n🎾 === CAMBIO DE DEPORTE ===');
    console.log('Deporte recibido:', deporte, '(tipo:', typeof deporte + ')');

    this.deporteSeleccionado = deporte;
    this.filtrosActivos.deporte = deporte;

    console.log('Filtros activos actualizados:', this.filtrosActivos);
    console.log('===========================\n');

    this.cargarProductos();
  }

  onFiltrosChange(filtros: FiltrosProducto) {
    console.log('\n🔧 === CAMBIO DE FILTROS ===');
    console.log('Filtros recibidos:', filtros);
    console.log('Filtros anteriores:', this.filtrosActivos);

    this.filtrosActivos = { ...this.filtrosActivos, ...filtros };

    console.log('Filtros activos actualizados:', this.filtrosActivos);
    console.log('============================\n');

    this.cargarProductos();
  }

  private cargarProductos() {
    this.isLoading = true;
    this.productoService.getProductosA().subscribe(
      (productos: Productoa[]) => {
        console.log('🔵 === INICIO FILTRADO ===');
        console.log('📦 Total productos recibidos:', productos.length);
        console.log('🎯 Filtros activos:', this.filtrosActivos);

        let productosFiltrados = productos;

        // Filtrar por categoría
        if (this.filtrosActivos.categoria && this.filtrosActivos.categoria.length > 0) {
          console.log('\n📁 FILTRO CATEGORÍA:');
          console.log('  Categorías buscadas:', this.filtrosActivos.categoria);

          const antesCategoria = productosFiltrados.length;
          productosFiltrados = productosFiltrados.filter((p) => {
            if (p.id_categoria == null) {
              console.log(`  ❌ Producto "${p.nombre}" sin categoría`);
              return false;
            }

            // Comparar convirtiendo ambos a string para evitar problemas de tipo
            const idCategoriaStr = p.id_categoria.toString();
            const coincide = this.filtrosActivos.categoria!.some(cat =>
              String(cat) === idCategoriaStr
            );

            console.log(`  ${coincide ? '✅' : '⚠️'} "${p.nombre}" - ID: ${p.id_categoria} (tipo: ${typeof p.id_categoria}), Buscando: ${JSON.stringify(this.filtrosActivos.categoria)} - ${coincide ? 'PASA' : 'NO PASA'}`);
            return coincide;
          });
          console.log(`  📊 Productos después del filtro: ${productosFiltrados.length} (eliminados: ${antesCategoria - productosFiltrados.length})`);
        }

        // Filtrar por deporte
        if (this.filtrosActivos.deporte && this.filtrosActivos.deporte !== 'todos') {
          console.log('\n⚽ FILTRO DEPORTE:');
          console.log('  Deporte buscado:', this.filtrosActivos.deporte, '(tipo:', typeof this.filtrosActivos.deporte + ')');

          const antesDeporte = productosFiltrados.length;
          productosFiltrados = productosFiltrados.filter((p) => {
            if (p.id_deporte == null) {
              console.log(`  ❌ Producto "${p.nombre}" sin deporte`);
              return false;
            }

            // Comparar convirtiendo ambos a string
            const idDeporteStr = p.id_deporte.toString();
            const deporteFiltroStr = String(this.filtrosActivos.deporte);
            const nombreDeporte = p.nombre_deporte?.toLowerCase() ?? '';
            const deporteFiltroLower = deporteFiltroStr.toLowerCase();

            const coincidePorId = idDeporteStr === deporteFiltroStr;
            const coincidePorNombre = nombreDeporte === deporteFiltroLower;
            const coincide = coincidePorId || coincidePorNombre;

            console.log(`  ${coincide ? '✅' : '⚠️'} "${p.nombre}" - ID: ${p.id_deporte}, ID String: "${idDeporteStr}", Nombre: "${nombreDeporte}", Filtro: "${deporteFiltroStr}" - ${coincide ? 'PASA' : 'NO PASA'}`);
            return coincide;
          });
          console.log(`  📊 Productos después del filtro: ${productosFiltrados.length} (eliminados: ${antesDeporte - productosFiltrados.length})`);
        }

        // Filtrar por marca
        if (this.filtrosActivos.marca && this.filtrosActivos.marca.length > 0) {
          console.log('\n🏷️ FILTRO MARCA:');
          console.log('  Marcas buscadas:', this.filtrosActivos.marca);

          const antesMarca = productosFiltrados.length;
          productosFiltrados = productosFiltrados.filter((p) => {
            if (p.id_marca == null) {
              console.log(`  ❌ Producto "${p.nombre}" sin marca`);
              return false;
            }

            // Comparar convirtiendo ambos a string para evitar problemas de tipo
            const idMarcaStr = p.id_marca.toString();
            const coincide = this.filtrosActivos.marca!.some(marca =>
              String(marca) === idMarcaStr
            );

            console.log(`  ${coincide ? '✅' : '⚠️'} "${p.nombre}" - ID: ${p.id_marca} (tipo: ${typeof p.id_marca}), Nombre: "${p.nombre_marca}", Buscando: ${JSON.stringify(this.filtrosActivos.marca)} - ${coincide ? 'PASA' : 'NO PASA'}`);
            return coincide;
          });
          console.log(`  📊 Productos después del filtro: ${productosFiltrados.length} (eliminados: ${antesMarca - productosFiltrados.length})`);
        }

        // Filtrar por rango de precio
        if (this.filtrosActivos.precioMin || this.filtrosActivos.precioMax) {
          console.log('\n💰 FILTRO PRECIO:');
          console.log(`  Rango: $${this.filtrosActivos.precioMin} - $${this.filtrosActivos.precioMax}`);

          const antesPrecio = productosFiltrados.length;
          productosFiltrados = productosFiltrados.filter((p) => {
            const precio = p.precio ?? 0;
            const coincide = precio >= (this.filtrosActivos.precioMin ?? 0) &&
                            precio <= (this.filtrosActivos.precioMax ?? Infinity);

            console.log(`  ${coincide ? '✅' : '⚠️'} "${p.nombre}" - Precio: $${precio} - ${coincide ? 'PASA' : 'NO PASA'}`);
            return coincide;
          });
          console.log(`  📊 Productos después del filtro: ${productosFiltrados.length} (eliminados: ${antesPrecio - productosFiltrados.length})`);
        }

        // Aplicar ordenamiento
        if (this.filtrosActivos.ordenamiento) {
          console.log('\n🔄 ORDENAMIENTO:', this.filtrosActivos.ordenamiento);
          productosFiltrados = this.ordenarProductos(productosFiltrados);
        }

        console.log('\n✅ === FIN FILTRADO ===');
        console.log('📦 Total productos finales:', productosFiltrados.length);
        console.log('Productos:', productosFiltrados.map(p => ({
          id: p.id_producto,
          nombre: p.nombre,
          id_cat: p.id_categoria,
          id_dep: p.id_deporte,
          id_marca: p.id_marca
        })));
        console.log('======================\n');

        this.productos = productosFiltrados;
        this.isLoading = false;
      },
      (err) => {
        console.error('Error cargando productos', err);
        this.isLoading = false;
      }
    );
  }

  private ordenarProductos(productos: Productoa[]): Productoa[] {
    switch (this.filtrosActivos.ordenamiento) {
      case 'precio-asc':
        return [...productos].sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
      case 'precio-desc':
        return [...productos].sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
      case 'nombre':
        return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
      default:
        return productos;
    }
  }

    // this.isLoading = true;

    // // Simular delay para mostrar skeleton
    // setTimeout(() => {
    //   this.productos = this.productoService.getProductosFiltrados(this.filtrosActivos);
    //   this.isLoading = false;
    // }, 500);

}
