import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reservar-cancha',
  imports: [],
  templateUrl: './reservar-cancha.html',
  styleUrl: './reservar-cancha.css'
})
export class ReservarCancha implements OnInit { // Implementamos OnInit para inicializar la fecha mínima

  /**
   * Propiedad para almacenar la fecha actual formateada como 'YYYY-MM-DD'.
   * Se usará en el atributo 'min' del input de fecha en el HTML.
   */
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

    // Opcional: Si el valor inicial en el HTML es una fecha pasada (como "2025-10-30" en el ejemplo original),
    // es buena práctica asegurarse de que el input no tenga una fecha pasada.
    // Esto es manejado por el HTML al usar [min] y [value], pero esta lógica lo forzaría:
    // const inputFecha = document.getElementById('fecha') as HTMLInputElement;
    // if (inputFecha && inputFecha.value < this.minDate) {
    //   inputFecha.value = this.minDate;
    // }
  }
}