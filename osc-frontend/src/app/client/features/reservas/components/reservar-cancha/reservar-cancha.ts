import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para ngFor, ngIf en el template
import { HttpClientModule } from '@angular/common/http'; // Necesario para que el servicio funcione si no está en App.config/module
import { Cancha } from '../../../../../core/models/canchas.model';
import { CanchasService } from '../../../../../core/services/canchas.service';

@Component({
  selector: 'app-reservar-cancha',
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css',
  })
export class ReservarCancha implements OnInit { 
  minDate: string = '';
  canchas: Cancha[] = []; 
  errorMessage: string = ''; 

  // Inyección del CanchaService
  constructor(private canchaService: CanchasService) {}

  ngOnInit(): void {
    this.setMinDate();
    this.cargarCanchas(); 
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