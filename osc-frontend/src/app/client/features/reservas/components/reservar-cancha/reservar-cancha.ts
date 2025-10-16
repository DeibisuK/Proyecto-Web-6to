import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reservar-cancha',
  imports: [RouterLink],
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css'
})
export class ReservarCancha implements OnInit { 
  minDate: string = '';

  ngOnInit(): void {
    this.setMinDate();
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