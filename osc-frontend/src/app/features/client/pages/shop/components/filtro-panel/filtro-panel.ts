import {
  Component,
  input,
  output,
  OnInit,
  inject,
  signal,
  effect,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto, OpcionesProducto } from '@shared/models/index';
import { CategoriaService, DeporteService } from '@shared/services/index';
import { MarcaService } from '@shared/services/index';
import { ProductoService } from '@shared/services/index';
import { Marca, Deporte } from '@shared/models/index';
import { Categoria } from '@shared/models/index';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-filtro-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-panel.html',
  styleUrls: ['./filtro-panel.css'],
})
export class FiltroPanelComponent implements OnInit {
  // ====================
  // INPUTS/OUTPUTS modernos
  // ====================
  filtrosActivos = input<FiltrosProducto>({
    deportes: [],
    marcas: [],
    categorias: [],
    colores: [],
    tallas: [],
    q: '',
    sort: 'price_asc',
    is_new: undefined,
    precioMin: undefined,
    precioMax: undefined,
    page: 1,
    per_page: 24,
  });

  filtrosChange = output<FiltrosProducto>();

  // ====================
  // SIGNALS
  // ====================
  filtros = signal<FiltrosProducto>({
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

  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);
  deportes = signal<Deporte[]>([]);
  isLoadingDeportes = signal<boolean>(true);
  opciones = signal<OpcionesProducto[]>([]);
  opcionesPorCategoria = signal<OpcionesProducto[]>([]);

  // Computed signal para obtener solo los colores
  coloresDisponibles = computed(() => {
    const opciones = this.opciones();
    const opcionColor = opciones.find(op => op.nombre_opcion.toLowerCase() === 'color');
    return opcionColor?.valores || [];
  });

  // Computed signal para obtener las tallas disponibles según las categorías seleccionadas
  tallasDisponibles = computed(() => {
    const opciones = this.opcionesPorCategoria();

    // Filtrar solo las opciones relacionadas con tallas
    // Buscamos opciones con nombres como "Talla Ropa", "Talla Calzado", etc.
    const opcionesTalla = opciones.filter(op =>
      op.nombre_opcion.toLowerCase().includes('talla')
    );

    // Combinar todos los valores de talla en un solo array
    const valores: { id_valor: number; valor: string; nombre_opcion: string }[] = [];
    opcionesTalla.forEach(opcion => {
      opcion.valores?.forEach(valor => {
        valores.push({
          id_valor: valor.id_valor,
          valor: valor.valor,
          nombre_opcion: opcion.nombre_opcion
        });
      });
    });

    return valores;
  });

  // Signals para el filtro de precio
  precioMinimo = signal<number>(0);
  precioMaximo = signal<number>(10000);
  precioMinActual = signal<number>(0);
  precioMaxActual = signal<number>(10000);

  seccionesDesplegadas = signal({
    categoria: true,
    deporte: true,
    marca: true,
    precio: true,
    color: true,
    talla: true,
  });

  // ====================
  // SERVICES
  // ====================
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);
  private productoService = inject(ProductoService);
  private deporteService = inject(DeporteService);

  // ====================
  // EFFECT para sincronizar filtrosActivos (input) con filtros (signal interno)
  // ====================
  constructor() {
    effect(() => {
      // Sincronizar filtros internos con los que vienen del padre
      const filtrosExternos = this.filtrosActivos();
      this.filtros.set({ ...filtrosExternos });

      // Sincronizar rangos de precio si vienen definidos
      if (filtrosExternos.precioMin !== undefined) {
        this.precioMinActual.set(filtrosExternos.precioMin);
      }
      if (filtrosExternos.precioMax !== undefined) {
        this.precioMaxActual.set(filtrosExternos.precioMax);
      }
    });

    // Effect para cargar opciones dinámicamente según las categorías seleccionadas
    effect(() => {
      const categorias = this.filtros().categorias;

      if (categorias && categorias.length > 0) {
        // Cargar opciones específicas para las categorías seleccionadas
        this.productoService.getOpcionesPorCategoriasCliente(categorias).subscribe({
          next: (opciones: OpcionesProducto[]) => {
            this.opcionesPorCategoria.set(opciones);
          },
          error: (error) => {
            console.error('Error al cargar opciones por categoría:', error);
            this.opcionesPorCategoria.set([]);
          }
        });
      } else {
        // Si no hay categorías, limpiar las opciones
        this.opcionesPorCategoria.set([]);
      }
    });
  }

  ngOnInit(): void {
    // Cargar categorias desde el servicio
    this.categoriaService.getCategorias().subscribe((categorias: Categoria[]) => {
      this.categorias.set(categorias);
    });

    // Cargar marcas desde el servicio
    this.marcaService.getMarcas().subscribe((marcas: Marca[]) => {
      this.marcas.set(marcas);
    });

    // Cargar deportes desde el servicio
    this.deporteService.getDeportes().subscribe({
      next: (deportes: Deporte[]) => {
        this.deportes.set(deportes);
        this.isLoadingDeportes.set(false);
      },
      error: (error) => {
        console.error('Error al cargar deportes:', error);
        this.isLoadingDeportes.set(false);
      }
    });

    // Cargar opciones de productos (colores, tallas, etc.)
    this.productoService.getOpcionesCliente().subscribe((opciones: OpcionesProducto[]) => {
      this.opciones.set(opciones);
    });
  }

  // ====================
  // MÉTODOS
  // ====================

  toggleFiltro(filtro: 'categoria' | 'deporte' | 'marca' | 'precio' | 'color' | 'talla') {
    this.seccionesDesplegadas.update(secciones => ({
      ...secciones,
      [filtro]: !secciones[filtro]
    }));
  }

  toggleCategoria(categoriaId: number) {
    this.filtros.update(filtrosActuales => {
      const categorias = [...(filtrosActuales.categorias || [])];
      const index = categorias.indexOf(categoriaId);

      if (index === -1) {
        categorias.push(categoriaId);
      } else {
        categorias.splice(index, 1);
      }

      return { ...filtrosActuales, categorias };
    });
    this.aplicarFiltros();
  }

  toggleMarca(marcaId: number) {
    this.filtros.update(filtrosActuales => {
      const marcas = [...(filtrosActuales.marcas || [])];
      const index = marcas.indexOf(marcaId);

      if (index === -1) {
        marcas.push(marcaId);
      } else {
        marcas.splice(index, 1);
      }

      return { ...filtrosActuales, marcas };
    });
    this.aplicarFiltros();
  }

  isCategoriaSeleccionada(categoriaId: number): boolean {
    return this.filtros().categorias?.includes(categoriaId) ?? false;
  }

  isMarcaSeleccionada(marcaId: number): boolean {
    return this.filtros().marcas?.includes(marcaId) ?? false;
  }

  // ====================
  // MÉTODOS PARA FILTRO DE DEPORTES
  // ====================

  toggleDeporte(deporteId: number) {
    this.filtros.update(filtrosActuales => {
      const deportes = [...(filtrosActuales.deportes || [])];
      const index = deportes.indexOf(deporteId);

      if (index === -1) {
        deportes.push(deporteId);
      } else {
        deportes.splice(index, 1);
      }

      return { ...filtrosActuales, deportes };
    });
    this.aplicarFiltros();
  }

  isDeporteSeleccionado(deporteId: number): boolean {
    return this.filtros().deportes?.includes(deporteId) ?? false;
  }

  // ====================
  // MÉTODOS PARA FILTRO DE COLORES
  // ====================

  toggleColor(idValor: number) {
    this.filtros.update(filtrosActuales => {
      const colores = [...(filtrosActuales.colores || [])];
      const index = colores.indexOf(idValor);

      if (index === -1) {
        colores.push(idValor);
      } else {
        colores.splice(index, 1);
      }

      return { ...filtrosActuales, colores };
    });
    this.aplicarFiltros();
  }

  isColorSeleccionado(idValor: number): boolean {
    return this.filtros().colores?.includes(idValor) ?? false;
  }

  getColorHex(nombreColor: string): string {
    // Mapeo básico de nombres de colores a códigos hexadecimales
    const coloresMap: { [key: string]: string } = {
      'rojo': '#E74C3C',
      'azul': '#3498DB',
      'verde': '#2ECC71',
      'amarillo': '#F39C12',
      'negro': '#2C3E50',
      'blanco': '#ECF0F1',
      'gris': '#95A5A6',
      'naranja': '#E67E22',
      'morado': '#9B59B6',
      'rosa': '#E91E63',
      'celeste': '#00BCD4',
      'violeta': '#673AB7',
      'turquesa': '#1ABC9C',
      'café': '#795548',
      'beige': '#D7CCC8',
      'plateado': '#BDC3C7',
      'dorado': '#FFD700',
    };

    const colorNormalizado = nombreColor.toLowerCase().trim();
    return coloresMap[colorNormalizado] || '#95A5A6'; // Gris por defecto
  }

  // ====================
  // MÉTODOS PARA FILTRO DE TALLAS
  // ====================

  toggleTalla(idValor: number) {
    this.filtros.update(filtrosActuales => {
      const tallas = [...(filtrosActuales.tallas || [])];
      const index = tallas.indexOf(idValor);

      if (index === -1) {
        tallas.push(idValor);
      } else {
        tallas.splice(index, 1);
      }

      return { ...filtrosActuales, tallas };
    });
    this.aplicarFiltros();
  }

  isTallaSeleccionada(idValor: number): boolean {
    return this.filtros().tallas?.includes(idValor) ?? false;
  }

  // ====================
  // MÉTODOS PARA FILTRO DE PRECIO
  // ====================

  onPrecioMinChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseFloat(input.value);

    // Asegurar que el mínimo no sea mayor que el máximo
    if (valor <= this.precioMaxActual()) {
      this.precioMinActual.set(valor);
      this.actualizarFiltroPrecio();
    } else {
      input.value = this.precioMinActual().toString();
    }
  }

  onPrecioMaxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseFloat(input.value);

    // Asegurar que el máximo no sea menor que el mínimo
    if (valor >= this.precioMinActual()) {
      this.precioMaxActual.set(valor);
      this.actualizarFiltroPrecio();
    } else {
      input.value = this.precioMaxActual().toString();
    }
  }

  private actualizarFiltroPrecio() {
    this.filtros.update(filtrosActuales => ({
      ...filtrosActuales,
      precioMin: this.precioMinActual() === this.precioMinimo() ? undefined : this.precioMinActual(),
      precioMax: this.precioMaxActual() === this.precioMaximo() ? undefined : this.precioMaxActual(),
    }));
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    // Resetear rangos de precio
    this.precioMinActual.set(this.precioMinimo());
    this.precioMaxActual.set(this.precioMaximo());

    this.filtros.set({
      categorias: [],
      deportes: [],
      is_new: undefined,
      q: '',
      marcas: [],
      colores: [],
      tallas: [],
      sort: 'price_asc',
      precioMin: undefined,
      precioMax: undefined,
      page: 1,
      per_page: 24,
    });
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    this.filtrosChange.emit(this.filtros());
  }
}
