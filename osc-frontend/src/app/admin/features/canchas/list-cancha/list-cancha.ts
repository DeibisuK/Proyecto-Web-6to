import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cancha } from '../../../../core/models/canchas.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CanchaService } from '../../../../core/services/canchas.service';

@Component({
  selector: 'app-list-cancha',
  imports: [CommonModule],
  templateUrl: './list-cancha.html',
  styleUrl: './list-cancha.css'
})
export class ListCancha implements OnInit {
  canchas: Cancha[] = [];
  isLoading = true;
  searchTerm = '';
  filtroDeporte = '';
  mostrarModalEliminar = false;
  canchaAEliminar: Cancha | null = null;

  deportes = [
    { id: 1, nombre: 'Fútbol' },
    { id: 2, nombre: 'Básquetbol' },
    { id: 3, nombre: 'Voleibol' },
    { id: 4, nombre: 'Tenis' },
    { id: 5, nombre: 'Pádel' }
  ];

  constructor(
    private canchaService: CanchaService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarCanchas();
  }

  cargarCanchas() {
    this.isLoading = true;
    this.canchaService.getCanchas().subscribe({
      next: (data) => {
        this.canchas = data;
        this.isLoading = false;
        console.log('Canchas cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar canchas:', error);
        this.notificationService.error('Error al cargar las canchas');
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onFiltroDeporteChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroDeporte = select.value;
  }

  crearCancha() {
    this.router.navigate(['/admin/crear-cancha']);
  }

  editarCancha(cancha: Cancha) {
    this.router.navigate(['/admin/editar-cancha', cancha.id_cancha]);
  }

  confirmarEliminar(cancha: Cancha) {
    this.canchaAEliminar = cancha;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.canchaAEliminar = null;
  }

  eliminarCancha() {
    if (!this.canchaAEliminar || !this.canchaAEliminar.id_cancha) return;

    this.canchaService.deleteCancha(this.canchaAEliminar.id_cancha).subscribe({
      next: () => {
        this.notificationService.success(`Cancha "${this.canchaAEliminar!.nombre_cancha}" eliminada correctamente`);
        this.cerrarModalEliminar();
        this.cargarCanchas();
      },
      error: (error) => {
        console.error('Error al eliminar cancha:', error);
        this.notificationService.error('Error al eliminar la cancha');
        this.cerrarModalEliminar();
      }
    });
  }

  obtenerNombreDeporte(id: number): string {
    return this.deportes.find(d => d.id === id)?.nombre || 'Desconocido';
  }

  get canchasFiltradas(): Cancha[] {
    let resultado = this.canchas;

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      resultado = resultado.filter(cancha => 
        cancha.nombre_cancha.toLowerCase().includes(term) ||
        cancha.tipo_superficie.toLowerCase().includes(term) ||
        cancha.estado.toLowerCase().includes(term)
      );
    }

    // Filtrar por deporte
    if (this.filtroDeporte) {
      const deporteId = parseInt(this.filtroDeporte);
      resultado = resultado.filter(cancha => cancha.id_deporte === deporteId);
    }

    return resultado;
  }
}
