import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { FiltrosProducto } from '../../models/filtros-producto.model';
import { Producto } from '../../models/producto';
import { DeporteSelector } from '../../components/deporte-selector/deporte-selector';
import { FiltroPanelComponent } from '../../components/filtro-panel/filtro-panel';
import { ProductoCard } from '../../components/producto-card/producto-card';

@Component({
  selector: 'app-tienda-page',
  templateUrl: './tienda-page.html',
  styleUrl: './tienda-page.css',
  imports: [
    CommonModule,
    DeporteSelector,
    FiltroPanelComponent,
    ProductoCard
  ]
})
export class TiendaPage implements OnInit {
  productos: Producto[] = [];
  deporteSeleccionado: string = 'todos';
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
    porPagina: 12
  };

  constructor(private productoService: ProductoService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.filtrosActivos.categoria = [params['categoria']];
      }
      this.cargarProductos();
    });
  }

  onDeporteChange(deporte: string) {
    this.deporteSeleccionado = deporte;
    this.filtrosActivos.deporte = deporte;
    this.cargarProductos();
  }

  onFiltrosChange(filtros: FiltrosProducto) {
    this.filtrosActivos = { ...this.filtrosActivos, ...filtros };
    this.cargarProductos();
  }

  private cargarProductos() {
    this.productos = this.productoService.getProductosFiltrados(this.filtrosActivos);
  }
}
