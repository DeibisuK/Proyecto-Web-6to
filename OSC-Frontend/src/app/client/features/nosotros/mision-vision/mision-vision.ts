import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mision-vision',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mision-vision-container">
      <h1>Misión y Visión</h1>
      <p>Aquí puedes agregar el contenido de misión y visión de tu complejo deportivo...</p>
    </div>
  `,
  styles: [`
    .mision-vision-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 {
      color: #2C3E50;
      margin-bottom: 2rem;
    }
    
    p {
      color: #7F8C8D;
      line-height: 1.6;
    }
  `]
})
export class MisionVision {}