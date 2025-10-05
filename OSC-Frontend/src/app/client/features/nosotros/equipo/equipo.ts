import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="equipo-container">
      <h1>Nuestro Equipo</h1>
    </div>
  `,
  styles: [`
    .equipo-container {
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
export class Equipo {}