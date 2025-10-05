import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="historia-container">
      <h1>Nuestra Historia</h1>
    </div>
  `,
  styles: [`
    .historia-container {
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
export class Historia {}