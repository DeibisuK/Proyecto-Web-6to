import { Component, OnInit } from '@angular/core';
import { SedeService } from '../../../../core/services/sede.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Sede } from '../../../../core/models/sede.model';
import { CommonModule } from '@angular/common';
import { MiniMapComponent } from '../../../../shared/mini-map/mini-map';
@Component({
  selector: 'app-list-sedes',
  imports: [CommonModule, MiniMapComponent],
  templateUrl: './list-sedes.html',
  styleUrl: './list-sedes.css'
})
export class ListSedes implements OnInit {
  sedes: Sede[] = [];
  sedesAgrupadas: { nombre: string, sedes: Sede[] }[] = [];
  isLoading = true;
  searchTerm: string = '';
  estadoFiltro: string = '';

  constructor(
    private sedeService: SedeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    console.log('listar sedes de cliente');
    this.isLoading = true;
    this.sedeService.getSedes().subscribe({
      next: (data) => {
        this.sedes = data;
        this.agruparSedesPorCiudad();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando sedes', err);
        this.notificationService.notify({
          message: 'No se pudieron cargar las sedes',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  agruparSedesPorCiudad(): void {
    const sedesFiltradas = this.filtrarSedesPorBusqueda();
    const ciudadesMap: { [ciudad: string]: { nombre: string, sedes: Sede[] } } = {};

    for (const sede of sedesFiltradas) {
      const ciudadNombre = sede.ciudad?.trim() || 'Sin ciudad';

      if (!ciudadesMap[ciudadNombre]) {
        ciudadesMap[ciudadNombre] = { nombre: ciudadNombre, sedes: [] };
      }

      ciudadesMap[ciudadNombre].sedes.push(sede);
    }

    this.sedesAgrupadas = Object.values(ciudadesMap).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  filtrarSedesPorBusqueda(): Sede[] {
    return this.sedes.filter(sede => {
      const matchSearch = !this.searchTerm ||
        sede.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.direccion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.ciudad?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchEstado = !this.estadoFiltro || sede.estado === this.estadoFiltro;

      return matchSearch && matchEstado;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.agruparSedesPorCiudad();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.agruparSedesPorCiudad();
  }
}
