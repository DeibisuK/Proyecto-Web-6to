import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Cancha } from '../../../../../core/models/canchas.model';
import { Deporte } from '../../../../../core/models/deporte.model';
import { DeporteService } from '../../../../../core/services/deportes.service';
import { CanchaService } from '../../../../../core/services/canchas.service';

@Component({
  selector: 'app-reservar-cancha',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css',
})
export class ReservarCancha implements OnInit {
  minDate: string = '';
  canchas: Cancha[] = [];
  deportes: Deporte[] = [];
  errorMessage: string = '';

  // Inyección de servicios
  constructor(
    private canchaService: CanchaService,
    private deporteService: DeporteService
  ) { }

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
      }
    });
  }

  /**
   * Obtiene la lista de deportes utilizando el servicio.
   */
  cargarDeportes(): void {
    this.deporteService.getDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
        console.log('Deportes cargados:', this.deportes);
      },
      error: (err) => {
        console.error('Error al cargar los deportes:', err);
        // Se usa el mismo mensaje de error para simplificar, pero se podría crear uno específico.
        // this.errorMessage = 'No se pudieron cargar los deportes.'; 
      }
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
