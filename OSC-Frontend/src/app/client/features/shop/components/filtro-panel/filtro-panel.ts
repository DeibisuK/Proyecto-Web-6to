import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto } from '../../models/filtros-producto.model';

@Component({
  selector: 'app-filtro-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-panel.html',
  styleUrls: ['./filtro-panel.css']
})
export class FiltroPanelComponent {
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
    porPagina: 12
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
    porPagina: 12
  };

  categorias = [
    { id: 'ropa', nombre: 'Ropa' },
    { id: 'calzado', nombre: 'Calzado' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'equipamiento', nombre: 'Equipamiento' }
  ];

  marcas = [
    'Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance'
  ];

  tallas = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL'
  ];

  seccionesDesplegadas = {
    categoria: true,
    precio: true,
    marca: true,
    talla: true
  };

  toggleFiltro(filtro: keyof typeof this.seccionesDesplegadas) {
    this.seccionesDesplegadas[filtro] = !this.seccionesDesplegadas[filtro];
  }

  toggleCategoria(categoria: string) {
    const index = this.filtros.categoria?.indexOf(categoria) ?? -1;
    if (index === -1) {
      this.filtros.categoria?.push(categoria);
    } else {
      this.filtros.categoria?.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  toggleMarca(marca: string) {
    const index = this.filtros.marca?.indexOf(marca) ?? -1;
    if (index === -1) {
      this.filtros.marca?.push(marca);
    } else {
      this.filtros.marca?.splice(index, 1);
    }
    this.aplicarFiltros();
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
      tallas: []
    };
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    this.filtrosChange.emit(this.filtros);
  }
}
