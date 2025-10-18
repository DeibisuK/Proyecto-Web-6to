import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para ngFor, ngIf en el template
import { HttpClientModule } from '@angular/common/http'; // Necesario para que el servicio funcione si no está en App.config/module
import { Cancha } from '../../../../../core/models/canchas.model';
import { CanchaService } from '../../../../../core/services/canchas.service';

@Component({
  selector: 'app-reservar-cancha',
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css',
  // Se añade CanchaService a providers si no está en providedIn: 'root' o si se necesita una instancia local
  // providers: [CanchaService] 
})
export class ReservarCancha implements OnInit { 
  minDate: string = '';
  
  // Lista para almacenar las canchas obtenidas del servicio
  canchas: Cancha[] = []; 
  
  // Mensaje de error para la UI
  errorMessage: string = ''; 

  // Inyección del CanchaService
  constructor(private canchaService: CanchaService) {}

  ngOnInit(): void {
    this.setMinDate();
    this.cargarCanchas(); // Llamamos a la función para cargar las canchas al inicio
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
   * Esto previene que el usuario seleccione una fecha pasada.
   */
  setMinDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    // getMonth() es base 0, por eso se le suma 1
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Formato YYYY-MM-DD requerido por el atributo 'min' del input[type=date]
    this.minDate = `${year}-${month}-${day}`;
  }
}