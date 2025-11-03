import { Component } from '@angular/core';
import { CrearEquipo } from '../crear-equipo/crear-equipo';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipo-form-page',
  imports: [CommonModule, CrearEquipo],
  template: `
    <div class="page-container">
      <div class="form-wrapper">
        <app-crear-equipo
          (equipoGuardado)="onEquipoGuardado()"
          (cerrarModal)="volver()"
        ></app-crear-equipo>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-wrapper {
      width: 100%;
      max-width: 650px;
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EquipoFormPage {
  constructor(private router: Router) {}

  onEquipoGuardado() {
    // Ya se maneja la navegación en el componente CrearEquipo
  }

  volver() {
    this.router.navigate(['/mis-equipos']);
  }
}
