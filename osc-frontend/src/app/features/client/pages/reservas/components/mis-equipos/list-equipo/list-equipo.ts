import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrearEquipo } from '../crear-equipo/crear-equipo';
import { Equipo } from '@shared/models/index';
import { EquipoService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-list-equipo',
  imports: [CommonModule, FormsModule, CrearEquipo],
  templateUrl: './list-equipo.html',
  styleUrl: './list-equipo.css'
})
export class ListEquipo implements OnInit {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  searchTerm = '';
  isLoading = true;
  mostrarModal = false;
  mostrarModalEliminar = false;
  equipoSeleccionado?: Equipo;
  equipoAEliminar?: Equipo;

  deportes: { [key: number]: string } = {
    1: 'Fútbol',
    2: 'Básquetbol',
    3: 'Voleibol',
    4: 'Tenis',
    5: 'Pádel'
  };

  constructor(
    private equipoService: EquipoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.isLoading = true;
    this.equipoService.getMisEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
        this.equiposFiltrados = [...equipos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.notificationService.error('Error al cargar los equipos');
        this.isLoading = false;
      }
    });
  }

  obtenerNombreDeporte(id?: number): string {
    if (!id) return 'Sin especificar';
    return this.deportes[id] || 'Sin especificar';
  }

  filtrarEquipos() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.equiposFiltrados = [...this.equipos];
      return;
    }

    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre_equipo.toLowerCase().includes(term) ||
      equipo.descripcion.toLowerCase().includes(term)
    );
  }

  abrirModalCrear() {
    this.equipoSeleccionado = undefined;
    this.mostrarModal = true;
    document.body.classList.add('modal-open');
  }

  editarEquipo(equipo: Equipo) {
    // Navegar a la ruta de edición
    this.router.navigate(['/editar-equipo', equipo.id_equipo]);
  }

  eliminarEquipo(equipo: Equipo) {
    this.equipoAEliminar = equipo;
    this.mostrarModalEliminar = true;
    document.body.classList.add('modal-open');
  }

  confirmarEliminacion() {
    if (this.equipoAEliminar && this.equipoAEliminar.id_equipo) {
      this.equipoService.deleteEquipoClient(this.equipoAEliminar.id_equipo).subscribe({
        next: () => {
          this.notificationService.success(`Equipo "${this.equipoAEliminar!.nombre_equipo}" eliminado correctamente`);
          this.cargarEquipos();
          this.cerrarModalEliminar();
        },
        error: (error) => {
          console.error('Error al eliminar equipo:', error);
          this.notificationService.error('Error al eliminar el equipo');
          this.cerrarModalEliminar();
        }
      });
    }
  }

  onEquipoGuardado(equipo: Equipo) {
    this.cargarEquipos();
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.equipoSeleccionado = undefined;
    document.body.classList.remove('modal-open');
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.equipoAEliminar = undefined;
    document.body.classList.remove('modal-open');
  }
}
