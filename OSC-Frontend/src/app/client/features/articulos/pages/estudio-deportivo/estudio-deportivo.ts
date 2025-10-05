import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-estudio-deportivo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="article-page">
      <div class="hero-section">
        <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Estudio deportivo" class="hero-image">
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Estudio sobre tendencias deportivas</h1>
            <p class="article-date">Publicado el 21 de Septiembre, 2024</p>
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
            <h2>Tendencias deportivas en la comunidad moderna</h2>
            
            <p>
              El deporte ha evolucionado significativamente en los últimos años, adaptándose a las nuevas 
              necesidades sociales y tecnológicas. Este estudio analiza las principales tendencias que 
              están transformando la forma en que practicamos deportes.
            </p>
            
            <h3>Principales hallazgos</h3>
            <ul>
              <li><strong>Deportes virtuales:</strong> Incremento del 300% en participación</li>
              <li><strong>Actividades al aire libre:</strong> Preferencia del 85% post-pandemia</li>
              <li><strong>Deportes inclusivos:</strong> Mayor diversidad en participantes</li>
              <li><strong>Tecnología deportiva:</strong> Uso de wearables en el 65% de atletas</li>
            </ul>
            
            <h3>Impacto en la comunidad</h3>
            <p>
              Los resultados muestran una clara preferencia hacia actividades que promuevan la 
              salud mental y física de manera integral. Los centros deportivos modernos deben 
              adaptarse a estas nuevas demandas.
            </p>
            
            <h3>Recomendaciones</h3>
            <ul>
              <li>Implementar tecnologías de seguimiento y análisis</li>
              <li>Crear espacios adaptados para diferentes habilidades</li>
              <li>Promover deportes que fomenten la interacción social</li>
              <li>Integrar actividades virtuales con las presenciales</li>
            </ul>
            
            <p>
              En nuestro complejo deportivo, aplicamos estos hallazgos para ofrecer una experiencia 
              deportiva integral que satisfaga las necesidades de toda la comunidad.
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
export class EstudioDeportivoPage {
  constructor(private router: Router) {}
  
  goBack() {
    this.router.navigate(['/inicio']);
  }
}