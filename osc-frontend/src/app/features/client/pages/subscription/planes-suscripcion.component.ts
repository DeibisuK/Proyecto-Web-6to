import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService, PlanSuscripcion } from '@core/services/subscription.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-planes-suscripcion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planes-container">
      <!-- Header -->
      <div class="header-section">
        <h1 class="title">Planes Premium</h1>
        <p class="subtitle">
          Desbloquea todas las funcionalidades de Oro Sport Club
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando()" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando planes...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-state">
        <p>{{ error() }}</p>
        <button (click)="cargarPlanes()" class="btn-retry">Reintentar</button>
      </div>

      <!-- Planes Grid -->
      <div *ngIf="!cargando() && !error()" class="planes-grid">
        <div
          *ngFor="let plan of planes()"
          class="plan-card"
          [class.popular]="plan.tipo === 'mensual'"
        >
          <!-- Badge para plan popular -->
          <div *ngIf="plan.tipo === 'mensual'" class="badge-popular">
            Más Popular
          </div>

          <div class="plan-header">
            <h2 class="plan-nombre">{{ plan.nombre }}</h2>
            <div class="plan-precio">
              <span class="precio-monto">\${{ plan.precio_simulado }}</span>
              <span class="precio-periodo">/ {{ plan.tipo === 'mensual' ? 'mes' : 'año' }}</span>
            </div>
            <p class="plan-descripcion">{{ plan.descripcion }}</p>
          </div>

          <div class="plan-features">
            <h3>Características incluidas:</h3>
            <ul>
              <li>
                <span class="icon">✓</span>
                Creación ilimitada de torneos
              </li>
              <li>
                <span class="icon">✓</span>
                Gestión completa de equipos
              </li>
              <li>
                <span class="icon">✓</span>
                Estadísticas avanzadas
              </li>
              <li>
                <span class="icon">✓</span>
                Clasificaciones en tiempo real
              </li>
              <li>
                <span class="icon">✓</span>
                Soporte prioritario
              </li>
              <li *ngIf="plan.tipo === 'anual'">
                <span class="icon">✓</span>
                Ahorra {{ calcularAhorro(plan) }}% vs mensual
              </li>
            </ul>
          </div>

          <div class="plan-footer">
            <button
              *ngIf="!estaAutenticado()"
              (click)="irALogin()"
              class="btn-suscribir"
            >
              Iniciar sesión para suscribirse
            </button>

            <button
              *ngIf="estaAutenticado() && !tieneSuscripcion()"
              (click)="suscribirse(plan)"
              class="btn-suscribir"
              [disabled]="procesando()"
            >
              {{ procesando() ? 'Procesando...' : 'Suscribirse Ahora' }}
            </button>

            <button
              *ngIf="estaAutenticado() && tieneSuscripcion()"
              class="btn-activo"
              disabled
            >
              Plan Actual
            </button>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="info-adicional">
        <h3>¿Por qué suscribirte?</h3>
        <div class="beneficios-grid">
          <div class="beneficio">
            <div class="beneficio-icon">🏆</div>
            <h4>Gestión Profesional</h4>
            <p>Administra torneos y equipos como un profesional</p>
          </div>
          <div class="beneficio">
            <div class="beneficio-icon">📊</div>
            <h4>Análisis Detallado</h4>
            <p>Accede a estadísticas y métricas avanzadas</p>
          </div>
          <div class="beneficio">
            <div class="beneficio-icon">⚡</div>
            <h4>Sin Limitaciones</h4>
            <p>Usa todas las funciones sin restricciones</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .planes-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #666;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-retry {
      padding: 0.5rem 1.5rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-retry:hover {
      background-color: #2980b9;
    }

    .planes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .plan-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 2rem;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .plan-card.popular {
      border-color: #3498db;
      box-shadow: 0 5px 20px rgba(52, 152, 219, 0.2);
    }

    .badge-popular {
      position: absolute;
      top: -12px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: bold;
    }

    .plan-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .plan-nombre {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }

    .plan-precio {
      margin-bottom: 1rem;
    }

    .precio-monto {
      font-size: 3rem;
      font-weight: bold;
      color: #3498db;
    }

    .precio-periodo {
      font-size: 1rem;
      color: #666;
    }

    .plan-descripcion {
      color: #666;
      line-height: 1.6;
    }

    .plan-features h3 {
      font-size: 1rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }

    .plan-features ul {
      list-style: none;
      padding: 0;
      margin-bottom: 2rem;
    }

    .plan-features li {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      color: #333;
    }

    .plan-features .icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-color: #e8f5e9;
      color: #4caf50;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-right: 0.75rem;
      font-weight: bold;
    }

    .plan-footer {
      margin-top: auto;
    }

    .btn-suscribir, .btn-activo {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-suscribir {
      background-color: #3498db;
      color: white;
    }

    .btn-suscribir:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-suscribir:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-activo {
      background-color: #4caf50;
      color: white;
      cursor: default;
    }

    .info-adicional {
      margin-top: 4rem;
      text-align: center;
    }

    .info-adicional h3 {
      font-size: 1.75rem;
      margin-bottom: 2rem;
      color: #1a1a1a;
    }

    .beneficios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .beneficio {
      text-align: center;
    }

    .beneficio-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .beneficio h4 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .beneficio p {
      color: #666;
    }
  `]
})
export class PlanesSuscripcionComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  planes = signal<PlanSuscripcion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  procesando = signal(false);
  estaAutenticado = signal(false);
  tieneSuscripcion = signal(false);

  ngOnInit() {
    this.cargarPlanes();
    this.verificarEstadoUsuario();
  }

  cargarPlanes() {
    this.cargando.set(true);
    this.error.set(null);

    this.subscriptionService.obtenerPlanes().subscribe({
      next: (response) => {
        this.planes.set(response.planes);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los planes. Por favor, intenta nuevamente.');
        this.cargando.set(false);
        console.error('Error al cargar planes:', err);
      }
    });
  }

  verificarEstadoUsuario() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.estaAutenticado.set(isAuth);
    });

    this.subscriptionService.tieneSuscripcionActiva$.subscribe(hasSub => {
      this.tieneSuscripcion.set(hasSub);
    });
  }

  suscribirse(plan: PlanSuscripcion) {
    if (this.procesando()) return;

    this.procesando.set(true);

    this.subscriptionService.simularPago(plan.id_plan).subscribe({
      next: async (response) => {
        this.procesando.set(false);
        this.notificationService.success(
          `¡Suscripción activada! Tu plan ${plan.nombre} ha sido activado exitosamente.`
        );

        // Esperar un momento para asegurar que los claims se hayan actualizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navegar al dashboard
        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        this.procesando.set(false);
        this.notificationService.error(
          err.error?.mensaje || 'Ocurrió un error al procesar tu suscripción. Por favor, intenta nuevamente.'
        );
        console.error('Error al suscribirse:', err);
      }
    });
  }

  irALogin() {
    this.router.navigate(['/inicio'], { queryParams: { openLogin: 'true' } });
  }

  calcularAhorro(plan: PlanSuscripcion): number {
    if (plan.tipo !== 'anual') return 0;

    const planMensual = this.planes().find(p => p.tipo === 'mensual');
    if (!planMensual) return 0;

    const costoAnualMensual = planMensual.precio_simulado * 12;
    const ahorro = ((costoAnualMensual - plan.precio_simulado) / costoAnualMensual) * 100;

    return Math.round(ahorro);
  }
}
