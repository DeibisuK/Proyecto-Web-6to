import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Sede } from '../../../../core/models/sede.model';
import { SedeService } from '../../../../core/services/sede.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MiniMapComponent } from '../../../../shared/mini-map/mini-map';

@Component({
  selector: 'app-list-sede',
  imports: [CommonModule, RouterLink, MiniMapComponent],
  templateUrl: './list-sede.html',
  styleUrl: './list-sede.css'
})
export class ListSede implements OnInit {
  sedes: Sede[] = [];
  sedesFiltradas: Sede[] = [];
  searchTerm: string = '';
  estadoFiltro: string = '';

  constructor(
    private sedeService: SedeService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

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
        console.error('Error cargando sedes', err);
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
    this.filtrarSedes();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.filtrarSedes();
  }

  editarSede(sede: Sede): void {
    if (sede.id_sede !== undefined) {
      this.router.navigate(['/admin/editar-sede', sede.id_sede]);
    }
  }

  eliminarSede(id: number | undefined): void {
    if (id === undefined) return;
    
    const sede = this.sedes.find(s => s.id_sede === id);
    if (!sede) return;

    const confirmDelete = confirm(`¿Estás seguro de eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
      this.notificationService.notify({
        message: 'Eliminando sede...',
        type: 'loading'
      });

      this.sedeService.deleteSede(id).subscribe({
        next: () => {
          this.sedes = this.sedes.filter(s => s.id_sede !== id);
          this.filtrarSedes();
          this.notificationService.notify({
            message: 'La sede ha sido eliminada correctamente',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Error eliminando sede', err);
          this.notificationService.notify({
            message: `No se pudo eliminar la sede: ${err.error?.message || 'Error desconocido'}`,
            type: 'error'
          });
        }
      });
    }
  }
}
