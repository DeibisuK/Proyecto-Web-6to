import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancha-futbol',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="article-page">
      <div class="hero-section">
        <img src="https://donpotrero.com/img/posts/2/medidas_lg.jpg" alt="Medidas de cancha de fútbol" class="hero-image">
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Medidas de una cancha de fútbol</h1>
            <p class="article-date">Publicado el 19 de Septiembre, 2024</p>
          </div>
        </div>
      </div>
      
      <div class="article-content">
        <div class="content-container">
          <button class="back-btn" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
            Volver
          </button>
          
          <article class="article-body">
            <h2>Dimensiones oficiales de las canchas de fútbol</h2>
            
            <p>
              Las dimensiones de una cancha de fútbol están reguladas por la FIFA (Fédération Internationale de Football Association) 
              y son fundamentales para garantizar la uniformidad del juego a nivel mundial.
            </p>
            
            <h3>Medidas principales</h3>
            <ul>
              <li><strong>Largo:</strong> Entre 90 y 120 metros</li>
              <li><strong>Ancho:</strong> Entre 45 y 90 metros</li>
              <li><strong>Para partidos internacionales:</strong> Largo entre 100-110m, Ancho entre 64-75m</li>
            </ul>
            
            <h3>Áreas importantes</h3>
            <p>
              La cancha cuenta con varias áreas delimitadas que cumplen funciones específicas durante el juego:
            </p>
            
            <ul>
              <li><strong>Área de gol:</strong> 5.5m x 18.32m</li>
              <li><strong>Área penal:</strong> 16.5m x 40.32m</li>
              <li><strong>Círculo central:</strong> Radio de 9.15m</li>
              <li><strong>Arcos de esquina:</strong> Radio de 1m</li>
            </ul>
            
            <h3>¿Por qué son importantes estas medidas?</h3>
            <p>
              Las dimensiones estandarizadas aseguran que el juego sea justo y consistente sin importar 
              dónde se juegue. Esto permite que los jugadores se adapten rápidamente a cualquier cancha 
              oficial y que las estrategias de juego sean universalmente aplicables.
            </p>
            
            <p>
              En nuestro complejo deportivo, todas nuestras canchas cumplen con estas especificaciones 
              internacionales, garantizando una experiencia de juego profesional para todos nuestros usuarios.
            </p>
          </article>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .article-page {
      min-height: 100vh;
    }
    
    .hero-section {
      height: 400px;
      position: relative;
      overflow: hidden;
    }
    
    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(46, 204, 113, 0.8) 0%, rgba(39, 174, 96, 0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .hero-content {
      text-align: center;
      color: white;
    }
    
    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .article-date {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .article-content {
      padding: 3rem 2rem;
      background: white;
    }
    
    .content-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #2ECC71;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      margin-bottom: 2rem;
      transition: background 0.3s ease;
    }
    
    .back-btn:hover {
      background: #27AE60;
    }
    
    .article-body h2 {
      color: #2C3E50;
      margin-bottom: 1.5rem;
      font-size: 2rem;
    }
    
    .article-body h3 {
      color: #2C3E50;
      margin: 2rem 0 1rem 0;
      font-size: 1.5rem;
    }
    
    .article-body p {
      color: #5D6D7E;
      line-height: 1.8;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }
    
    .article-body ul {
      color: #5D6D7E;
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }
    
    .article-body li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .article-date {
        font-size: 1rem;
      }
      
      .article-content {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class CanchaFutbolPage {
  constructor(private router: Router) {}
  
  goBack() {
    this.router.navigate(['/inicio']);
  }
}