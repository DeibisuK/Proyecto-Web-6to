import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Cancha } from '@shared/models/index';
import { Deporte } from '@shared/models/index';
import { DeporteService } from '@shared/services/index';
import { CanchaService } from '@shared/services/index';
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
  canchas: Cancha[] = [];
  deportes: Deporte[] | null = [];
  selectedDeporte: string = '';
  errorMessage: string = '';

  // Inyección de servicios
  constructor(private canchaService: CanchaService, private deporteService: DeporteService) {}

  ngOnInit(): void {
    this.setMinDate();
    this.cargarCanchas();
    this.cargarDeportes();
  }

  /**
   * Obtiene la lista de canchas utilizando el servicio.
   */
  cargarCanchas(): void {
    this.canchaService.getCanchas().subscribe({
      next: (data) => {
        // Asignamos los datos recibidos a la propiedad canchas
        this.canchas = data;
        console.log('Canchas cargadas:', this.canchas);
        this.errorMessage = ''; // Limpiar cualquier error anterior
      },
      error: (err) => {
        // Manejo de errores
        console.error('Error al cargar las canchas:', err);
        this.errorMessage = 'No se pudieron cargar las canchas. Intenta más tarde.';
        this.canchas = []; // Asegurar que la lista esté vacía en caso de error
      },
    });
  }

  /**
   * Obtiene la lista de deportes utilizando el servicio.
   */
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

  buscarPorDeporte(): void {
    if (!this.selectedDeporte) {
      this.cargarCanchas(); // si no se selecciona deporte, mostrar todas
      return;
    }

    this.canchaService.getCanchasByDeporte(this.selectedDeporte).subscribe({
      next: (data) => {
        this.canchas = data;
        this.errorMessage = data.length === 0 ? 'No se encontraron canchas para este deporte.' : '';
      },
      error: (err) => {
        console.error('Error al buscar por deporte:', err);
        this.errorMessage = 'Error al buscar las canchas.';
      },
    });
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
}
