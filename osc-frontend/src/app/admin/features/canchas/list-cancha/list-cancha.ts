import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cancha } from '../../../../core/models/canchas.model';

@Component({
  selector: 'app-list-cancha',
  imports: [CommonModule],
  templateUrl: './list-cancha.html',
  styleUrl: './list-cancha.css'
})
export class ListCancha implements OnInit {
  canchas: Cancha[] = [];
  canchasFiltradas: Cancha[] = [];
  searchTerm = '';
  filtroDeporte: number | null = null;
  mostrarModalEliminar = false;
  canchaAEliminar: Cancha | null = null;

  deportes = [
    { id: 1, nombre: 'Fútbol' },
    { id: 2, nombre: 'Básquetbol' },
    { id: 3, nombre: 'Voleibol' },
    { id: 4, nombre: 'Tenis' },
    { id: 5, nombre: 'Pádel' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarCanchas();
  }

  cargarCanchas() {
    // Datos de ejemplo
    this.canchas = [
      {
        id_cancha: 1,
        nombre_cancha: 'Cancha Principal',
        id_sede: 1,
        id_deporte: 1,
        largo: 40,
        ancho: 25,
        tarifa: 30,
        tipo_superficie: 'Césped Sintético',
        estado: 'Disponible',
        imagen_url: 'https://media.elcomercio.com/wp-content/uploads/2024/12/parque-carolina-canchas-futbol-1024x683.jpg'
      },
      {
        id_cancha: 2,
        nombre_cancha: 'Cancha Norte',
        id_sede: 2,
        id_deporte: 2,
        largo: 28,
        ancho: 15,
        tarifa: 25,
        tipo_superficie: 'Parquet',
        estado: 'Disponible',
        imagen_url: 'https://img.freepik.com/fotos-premium/cancha-baloncesto-vacia-ilustracion-3d_1024307-2643.jpg'
      },
      {
        id_cancha: 3,
        nombre_cancha: 'Cancha Sur',
        id_sede: 3,
        id_deporte: 3,
        largo: 18,
        ancho: 9,
        tarifa: 20,
        tipo_superficie: 'Cemento',
        estado: 'Mantenimiento',
        imagen_url: 'https://thumbs.dreamstime.com/b/campo-de-voleibol-al-aire-libre-con-bola-en-midair-una-vibrante-cancha-brillante-superficie-azul-zonas-juego-naranjas-y-linderos-402378793.jpg'
      },
      {
        id_cancha: 4,
        nombre_cancha: 'Cancha Tenis 1',
        id_sede: 1,
        id_deporte: 4,
        largo: 23,
        ancho: 11,
        tarifa: 35,
        tipo_superficie: 'Arcilla',
        estado: 'Disponible',
        imagen_url: 'https://img.freepik.com/fotos-premium/cancha-tenis-al-aire-libre-superficie-azul-verde-equipada-reflectores-alineada-bancos_747516-527.jpg?semt=ais_hybrid&w=740&q=80'
      }
    ];

    this.canchasFiltradas = [...this.canchas];
  }

  filtrarCanchas() {
    this.canchasFiltradas = this.canchas.filter(cancha => {
      const matchSearch = cancha.nombre_cancha.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchDeporte = !this.filtroDeporte || cancha.id_deporte === this.filtroDeporte;
      return matchSearch && matchDeporte;
    });
  }

  onSearchChange(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filtrarCanchas();
  }

  onFiltroDeporteChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroDeporte = value ? parseInt(value) : null;
    this.filtrarCanchas();
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

  async eliminarCancha() {
    if (!this.canchaAEliminar) return;

    try {
      // Aquí iría la llamada al servicio
      await this.simularEliminacion();

      this.canchas = this.canchas.filter(c => c.id_cancha !== this.canchaAEliminar!.id_cancha);
      this.filtrarCanchas();

      this.mostrarNotificacion('Cancha eliminada correctamente', 'success');
      this.cerrarModalEliminar();

    } catch (error) {
      this.mostrarNotificacion('Error al eliminar la cancha', 'error');
    }
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.canchaAEliminar = null;
  }

  obtenerNombreDeporte(id: number): string {
    return this.deportes.find(d => d.id === id)?.nombre || '';
  }

  private simularEliminacion(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  private mostrarNotificacion(message: string, type: 'success' | 'error') {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }
}
