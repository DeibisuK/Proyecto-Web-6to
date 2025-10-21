import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto } from '../../models/filtros-producto';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { MarcaService } from '../../../../../core/services/marca.service';
import { Marca } from '../../../../../core/models/marca.model';
import { Categoria } from '../../../../../core/models/categoria.model';

@Component({
  selector: 'app-filtro-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-panel.html',
  styleUrls: ['./filtro-panel.css'],
})
export class FiltroPanelComponent implements OnInit {
  @Input() filtrosActivos: FiltrosProducto = {
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
  @Output() filtrosChange = new EventEmitter<FiltrosProducto>();

  filtros: FiltrosProducto = {
    deporte: 'todos',
    categoria: [],
    precioMin: 0,
    precioMax: 200,
    marca: [],
    tallas: [],
    color: [],
    ordenamiento: 'relevancia',
    pagina: 1,
    porPagina: 12,
  };

  categoriaService = inject(CategoriaService);
  marcaService = inject(MarcaService);

  categorias: Categoria[] = [];
  marcas: Marca[] = [];

  ngOnInit(): void {
    // Cargar categorias desde el servicio (tipadas)
    this.categoriaService.getCategorias().subscribe((categorias: Categoria[]) => {
      this.categorias = categorias;
      console.log('📁 Categorías cargadas en FiltroPanelComponent:', categorias);
      console.log('   Tipos de ID:', categorias.map(c => ({ id: c.id_categoria, tipo: typeof c.id_categoria })));
    });

    // Cargar marcas desde el servicio (tipadas)
    this.marcaService.getMarcas().subscribe((marcas: Marca[]) => {
      this.marcas = marcas;
      console.log('🏷️ Marcas cargadas en FiltroPanelComponent:', marcas);
      console.log('   Tipos de ID:', marcas.map(m => ({ id: m.id_marca, tipo: typeof m.id_marca })));
    });
  }

  // tallas = [
  //   'XS', 'S', 'M', 'L', 'XL', 'XXL'
  // ];

  seccionesDesplegadas = {
    categoria: true,
    precio: true,
    marca: true,
    talla: true,
  };

  toggleFiltro(filtro: keyof typeof this.seccionesDesplegadas) {
    this.seccionesDesplegadas[filtro] = !this.seccionesDesplegadas[filtro];
  }

  toggleCategoria(categoriaId: string) {
    console.log('📁 Toggle Categoría - ID recibido:', categoriaId, '(tipo:', typeof categoriaId + ')');

    const index = this.filtros.categoria?.indexOf(categoriaId) ?? -1;
    if (index === -1) {
      this.filtros.categoria?.push(categoriaId);
      console.log('  ✅ Categoría agregada');
    } else {
      this.filtros.categoria?.splice(index, 1);
      console.log('  ❌ Categoría removida');
    }

    console.log('  Categorías actuales:', this.filtros.categoria);
    this.aplicarFiltros();
  }

  toggleMarca(marcaId: string) {
    console.log('🏷️ Toggle Marca - ID recibido:', marcaId, '(tipo:', typeof marcaId + ')');

    const index = this.filtros.marca?.indexOf(marcaId) ?? -1;
    if (index === -1) {
      this.filtros.marca?.push(marcaId);
      console.log('  ✅ Marca agregada');
    } else {
      this.filtros.marca?.splice(index, 1);
      console.log('  ❌ Marca removida');
    }

    console.log('  Marcas actuales:', this.filtros.marca);
    this.aplicarFiltros();
  }

  isCategoriaSeleccionada(categoriaId: string): boolean {
    return this.filtros.categoria?.includes(categoriaId) ?? false;
  }

  isMarcaSeleccionada(marcaId: string): boolean {
    return this.filtros.marca?.includes(marcaId) ?? false;
  }

  toggleTalla(talla: string) {
    const index = this.filtros.tallas?.indexOf(talla) ?? -1;
    if (index === -1) {
      this.filtros.tallas?.push(talla);
    } else {
      this.filtros.tallas?.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  actualizarPrecio() {
    if (this.filtros.precioMin! > this.filtros.precioMax!) {
      this.filtros.precioMax = this.filtros.precioMin;
    }
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtros = {
      categoria: [],
      precioMin: 0,
      precioMax: 200,
      marca: [],
      tallas: [],
    };
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    console.log('📤 FiltroPanelComponent - Emitiendo filtros:', this.filtros);
    this.filtrosChange.emit(this.filtros);
  }
}
