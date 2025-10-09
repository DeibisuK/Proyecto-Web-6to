import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instalaciones-padel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="article-page">
      <div class="hero-section">
        <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Instalaciones de pádel" class="hero-image">
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Nuevas instalaciones de pádel</h1>
            <p class="article-date">Publicado el 1 de Octubre, 2024</p>
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
            <h2>Modernización de nuestras pistas de pádel</h2>
            
            <p>
              Nos complace anunciar la inauguración de nuestras nuevas instalaciones de pádel, 
              diseñadas con la última tecnología para ofrecer la mejor experiencia de juego 
              tanto para principiantes como para jugadores profesionales.
            </p>
            
            <h3>Características destacadas</h3>
            <ul>
              <li><strong>Iluminación LED:</strong> Sistema de última generación para juego nocturno</li>
              <li><strong>Superficie profesional:</strong> Césped artificial de alta calidad</li>
              <li><strong>Vidrio templado:</strong> Paredes de seguridad de 12mm de espesor</li>
              <li><strong>Sistema de drenaje:</strong> Evacuación rápida del agua de lluvia</li>
            </ul>
            
            <h3>Tecnología integrada</h3>
            <p>
              Cada pista cuenta con sistemas de monitoreo que permiten analizar el juego, 
              registrar estadísticas y mejorar el rendimiento de los jugadores. Además, 
              ofrecemos reservas online y un sistema de pago digital integrado.
            </p>
            
            <h3>Servicios adicionales</h3>
            <ul>
              <li>Alquiler de equipamiento profesional</li>
              <li>Clases con instructores certificados</li>
              <li>Torneos y competencias regulares</li>
              <li>Vestuarios con lockers individuales</li>
              <li>Zona de descanso y cafetería</li>
            </ul>
            
            <h3>Horarios y reservas</h3>
            <p>
              Nuestras pistas están disponibles todos los días de 6:00 AM a 11:00 PM. 
              Puedes realizar tu reserva a través de nuestra plataforma online o 
              directamente en recepción. ¡Te esperamos para que vivas la mejor 
              experiencia de pádel!
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
export class InstalacionesPadelPage {
  constructor(private router: Router) {}
  
  goBack() {
    this.router.navigate(['/inicio']);
  }
}