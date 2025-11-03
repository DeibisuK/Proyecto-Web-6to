import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto } from '@shared/models/index';
import { CategoriaService } from '@shared/services/index';
import { MarcaService } from '@shared/services/index';
import { Marca } from '@shared/models/index';
import { Categoria } from '@shared/models/index';

@Component({
  selector: 'app-filtro-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-panel.html',
  styleUrls: ['./filtro-panel.css'],
})
export class FiltroPanelComponent implements OnInit {
  @Input() filtrosActivos: FiltrosProducto = {
    deportes: [],
    marcas: [],
    categorias: [],
    q: '',
    sort: 'price_asc',
    is_new: undefined,
    page: 1,
    per_page: 24,
  };
  @Output() filtrosChange = new EventEmitter<FiltrosProducto>();

  filtros: FiltrosProducto = {
    categorias: [],
    marcas: [],
    deportes: [],
    is_new: undefined,
    q: '',
    sort: 'price_asc',
    page: 1,
    per_page: 24,
  };

  categoriaService = inject(CategoriaService);
  marcaService = inject(MarcaService);

  categorias: Categoria[] = [];
  marcas: Marca[] = [];

  ngOnInit(): void {
    // Cargar categorias desde el servicio (tipadas)
    this.categoriaService.getCategorias().subscribe((categorias: Categoria[]) => {
      this.categorias = categorias;
    });

    // Cargar marcas desde el servicio (tipadas)
    this.marcaService.getMarcas().subscribe((marcas: Marca[]) => {
      this.marcas = marcas;
    });
  }

  // tallas = [
  //   'XS', 'S', 'M', 'L', 'XL', 'XXL'
  // ];

  seccionesDesplegadas = {
    categoria: true,
    marca: true,
    precio: true,
    // talla: true,
  };

  toggleFiltro(filtro: keyof typeof this.seccionesDesplegadas) {
    this.seccionesDesplegadas[filtro] = !this.seccionesDesplegadas[filtro];
  }

  toggleCategoria(categoriaId: number) {

    const index = this.filtros.categorias?.indexOf(categoriaId) ?? -1;
    if (index === -1) {
      this.filtros.categorias?.push(categoriaId);
    } else {
      this.filtros.categorias?.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  toggleMarca(marcaId: number) {

    const index = this.filtros.marcas?.indexOf(marcaId) ?? -1;
    if (index === -1) {
      this.filtros.marcas?.push(marcaId);
    } else {
      this.filtros.marcas?.splice(index, 1);
    }

    this.aplicarFiltros();
  }

  isCategoriaSeleccionada(categoriaId: number): boolean {
    return this.filtros.categorias?.includes(categoriaId) ?? false;
  }

  isMarcaSeleccionada(marcaId: number): boolean {
    return this.filtros.marcas?.includes(marcaId) ?? false;
  }

  // toggleTalla(talla: string) {
  //   const index = this.filtros.tallas?.indexOf(talla) ?? -1;
  //   if (index === -1) {
  //     this.filtros.tallas?.push(talla);
  //   } else {
  //     this.filtros.tallas?.splice(index, 1);
  //   }
  //   this.aplicarFiltros();
  // }

  // actualizarPrecio() {
  //   if (this.filtros.precioMin! > this.filtros.precioMax!) {
  //     this.filtros.precioMax = this.filtros.precioMin;
  //   }
  //   this.aplicarFiltros();
  // }

  limpiarFiltros() {
    this.filtros = {
      categorias: [],
      deportes: [],
      is_new: undefined,
      q: '',
      marcas: [],
      sort: 'price_asc',
      page: 1,
      per_page: 24,
    };
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    this.filtrosChange.emit(this.filtros);
  }
}
