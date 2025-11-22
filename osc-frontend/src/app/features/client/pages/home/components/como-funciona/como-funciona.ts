import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-como-funciona',
  imports: [CommonModule],
  templateUrl: './como-funciona.html',
  styleUrls: ['./como-funciona.css']
})
export class ComoFuncionaComponent {
  steps = [
    {
      number: 1,
      title: 'Elige tu deporte',
      description: 'Selecciona entre fútbol, basketball, pádel o tenis según tu preferencia.'
    },
    {
      number: 2,
      title: 'Selecciona fecha y hora',
      description: 'Encuentra el horario perfecto con disponibilidad en tiempo real.'
    },
    {
      number: 3,
      title: 'Confirma y juega',
      description: 'Paga de forma segura y recibe tu confirmación al instante.'
    }
  ];
}
