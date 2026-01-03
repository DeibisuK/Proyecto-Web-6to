import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Cancha } from '@shared/models/index';
import { Deporte } from '@shared/models/index';
import { DeporteService } from '@shared/services/index';
import { CanchaService } from '@shared/services/index';
import { RatingService } from '@shared/services/rating.service';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservar-cancha',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css',
})
export class ReservarCancha implements OnInit {
  minDate: string = '';
  deportes: Deporte[] | null = [];
  errorMessage: string = '';

  // Signals
  canchas = signal<Cancha[]>([]);
  searchTerm = signal('');
  selectedDeporte = signal('');
  selectedFecha = signal('');
  isLoading = signal(false);
  dropdownDeporteAbierto = signal(false);
  dropdownFechaAbierto = signal(false);
  deporteSeleccionado = signal('Todos los deportes');
  fechaSeleccionada = signal('Cualquier fecha');

  // Computed para canchas filtradas
  canchasFiltradas = computed(() => {
    let resultado = this.canchas();

    // Filtrar por búsqueda
    if (this.searchTerm().trim()) {
      const busqueda = this.searchTerm().toLowerCase();
      resultado = resultado.filter(c =>
        c.nombre_cancha.toLowerCase().includes(busqueda) ||
        c.tipo_superficie.toLowerCase().includes(busqueda)
      );
    }

    // Filtrar por deporte
    if (this.selectedDeporte()) {
      resultado = resultado.filter(c => c.id_deporte?.toString() === this.selectedDeporte());
    }

    return resultado;
  });

  constructor(
    private canchaService: CanchaService,
    private deporteService: DeporteService,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    this.setMinDate();
    this.cargarCanchas();
    this.cargarDeportes();
  }

  cargarCanchas(): void {
    this.isLoading.set(true);
    this.canchaService.getCanchas().subscribe({
      next: (data) => {
        // Filtrar solo canchas que tienen horarios disponibles
        const canchasConHorarios: Cancha[] = [];

        data.forEach(async cancha => {
          if (cancha.id_cancha) {
            // Verificar si tiene horarios disponibles
            this.canchaService.getHorariosDisponibles(cancha.id_cancha).subscribe({
              next: (horarios) => {
                if (horarios && horarios.length > 0) {
                  canchasConHorarios.push(cancha);
                  this.canchas.set([...canchasConHorarios]);

                  // Cargar ratings
                  this.cargarRatingsCancha(cancha.id_cancha!);
                }
              },
              error: () => {
                // Cancha sin horarios, no la mostramos
              }
            });
          }
        });

        this.errorMessage = '';
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las canchas:', err);
        this.errorMessage = 'No se pudieron cargar las canchas. Intenta más tarde.';
        this.canchas.set([]);
        this.isLoading.set(false);
      },
    });
  }

  cargarRatingsCancha(idCancha: number): void {
    this.ratingService.getEstadisticasCancha(idCancha).subscribe({
      next: (stats) => {
        // Actualizar la cancha con los datos de rating
        const canchasActuales = this.canchas();
        const canchaIndex = canchasActuales.findIndex(c => c.id_cancha === idCancha);
        if (canchaIndex !== -1) {
          canchasActuales[canchaIndex] = {
            ...canchasActuales[canchaIndex],
            promedio_estrellas: stats.promedio_estrellas,
            total_ratings: stats.total_ratings
          };
          this.canchas.set([...canchasActuales]);
        }
      },
      error: (err) => {
        // Si no hay ratings, simplemente no mostramos nada
        console.log(`No hay ratings para cancha ${idCancha}`);
      }
    });
  }

  cargarDeportes(): void {
    this.deporteService.getDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
      },
      error: (err) => {
        console.error('Error al cargar los deportes:', err);
        this.deportes = [];
      },
    });
  }

  toggleDropdownDeporte(): void {
    this.dropdownDeporteAbierto.update(val => !val);
    this.dropdownFechaAbierto.set(false);
  }

  toggleDropdownFecha(): void {
    this.dropdownFechaAbierto.update(val => !val);
    this.dropdownDeporteAbierto.set(false);
  }

  seleccionarDeporte(deporteId: string): void {
    this.selectedDeporte.set(deporteId);
    if (deporteId === '') {
      this.deporteSeleccionado.set('Todos los deportes');
    } else {
      const deporte = this.deportes?.find(d => d.id_deporte?.toString() === deporteId);
      this.deporteSeleccionado.set(deporte?.nombre_deporte || 'Todos los deportes');
    }
    this.dropdownDeporteAbierto.set(false);
  }

  seleccionarFecha(): void {
    const fechaValue = this.selectedFecha();
    if (fechaValue) {
      const fecha = new Date(fechaValue);
      this.fechaSeleccionada.set(fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
    } else {
      this.fechaSeleccionada.set('Cualquier fecha');
    }
    this.dropdownFechaAbierto.set(false);
  }

  aplicarFiltros(): void {
    // El computed se actualiza automáticamente
  }

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.selectedDeporte.set('');
    this.selectedFecha.set('');
    this.deporteSeleccionado.set('Todos los deportes');
    this.fechaSeleccionada.set('Cualquier fecha');
    this.dropdownDeporteAbierto.set(false);
    this.dropdownFechaAbierto.set(false);
  }
  /**
   * Establece la fecha mínima permitida para la selección (la fecha de hoy).
   */
  setMinDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  /**
   * Convierte URL de imagen a formato WebP
   */
  toWebP(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  /**
   * Convierte URL de imagen a formato AVIF
   */
  toAVIF(url: string): string {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  }
}
