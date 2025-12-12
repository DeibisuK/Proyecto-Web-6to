import { Component, OnInit, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Sedes } from '@shared/models/index';
import { SedeService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { MiniMapComponent } from '@shared/mini-map/mini-map';

@Component({
  selector: 'app-list-sede',
  imports: [CommonModule, RouterLink, MiniMapComponent],
  templateUrl: './list-sede.html',
  styleUrl: './list-sede.css'
})
export class ListSede implements OnInit {
  sedes: Sedes[] = [];
  sedesFiltradas: Sedes[] = [];
  searchTerm: string = '';
  estadoFiltro: string = '';

  // Signals para dropdown personalizado
  dropdownEstadoAbierto = signal<boolean>(false);
  estadoSeleccionado = signal<string>('Filtrar por estado');

  constructor(
    private sedeService: SedeService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    afterNextRender(() => {
      this.configurarCierreDropdown();
    });
  }

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (data) => {
        this.sedes = data;
        this.sedesFiltradas = [...this.sedes];
      },
      error: (err) => {
        this.notificationService.notify({
          message: 'No se pudieron cargar las sedes',
          type: 'error'
        });
      }
    });
  }

  filtrarSedes(): void {
    this.sedesFiltradas = this.sedes.filter(sede => {
      const matchSearch = !this.searchTerm ||
        sede.nombre_sede.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.direccion?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sede.ciudad?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchEstado = !this.estadoFiltro || sede.estado === this.estadoFiltro;

      return matchSearch && matchEstado;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.filtrarSedes();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.filtrarSedes();
  }

  editarSede(sede: Sedes): void {
    if (sede.id_sede !== undefined) {
      this.router.navigate(['/admin/editar-sede', sede.id_sede]);
    }
  }

  eliminarSede(id: number | undefined): void {
    if (id === undefined) return;

    const sede = this.sedes.find(s => s.id_sede === id);
    if (!sede) return;

    const confirmDelete = confirm(`¿Estás seguro de eliminar la sede "${sede.nombre_sede}"? Esta acción no se puede deshacer.`);

    if (confirmDelete) {
      this.notificationService.notify({
        message: 'Eliminando sede...',
        type: 'loading'
      });

      this.sedeService.deleteSede(id).subscribe({
        next: () => {
          this.notificationService.notify({
            message: 'La sede ha sido eliminada correctamente',
            type: 'success'
          });
          // Recargar sedes para actualización en tiempo real
          this.cargarSedes();
        },
        error: (err) => {
          this.notificationService.notify({
            message: `No se pudo eliminar la sede: ${err.error?.message || 'Error desconocido'}`,
            type: 'error'
          });
        }
      });
    }
  }

  // ===== Métodos para dropdown personalizado =====

  toggleDropdownEstado() {
    this.dropdownEstadoAbierto.update(estado => !estado);
  }

  seleccionarEstado(estado: string | null) {
    if (estado === null) {
      this.estadoFiltro = '';
      this.estadoSeleccionado.set('Todos los estados');
    } else {
      this.estadoFiltro = estado;
      this.estadoSeleccionado.set(estado);
    }
    this.dropdownEstadoAbierto.set(false);
    this.filtrarSedes();
  }

  private configurarCierreDropdown() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownEstado = target.closest('.filtro-estado');

      if (!dropdownEstado && this.dropdownEstadoAbierto()) {
        this.dropdownEstadoAbierto.set(false);
      }
    });
  }
}
