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
            <div class="beneficio-icon">
              <span class="material-icons">emoji_events</span>
            </div>
            <h4>Gestión Profesional</h4>
            <p>Administra torneos y equipos como un profesional</p>
          </div>
          <div class="beneficio">
            <div class="beneficio-icon">
              <span class="material-icons">bar_chart</span>
            </div>
            <h4>Análisis Detallado</h4>
            <p>Accede a estadísticas y métricas avanzadas</p>
          </div>
          <div class="beneficio">
            <div class="beneficio-icon">
              <span class="material-icons">all_inclusive</span>
            </div>
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
      padding: 6rem 1rem 2rem;
      background-color: #F9FAFB;
      min-height: 100vh;
    }

    .header-section {
      text-align: center;
      margin-bottom: 4rem;
    }

    .title {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 1rem;
      color: #1F2937;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 20px;
      color: #6B7280;
      font-weight: 500;
      line-height: 1.6;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #E5E7EB;
      border-top: 4px solid #25D366;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-retry {
      padding: 12px 32px;
      background: linear-gradient(135deg, #25D366 0%, #1FAD53 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    .btn-retry:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
    }

    .planes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .plan-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      padding: 2.5rem;
      position: relative;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    .plan-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(37, 211, 102, 0.15);
      border-color: #25D366;
    }

    .plan-card.popular {
      border-color: #25D366;
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.2);
    }

    .badge-popular {
      position: absolute;
      top: -12px;
      right: 20px;
      background: linear-gradient(135deg, #25D366 0%, #1FAD53 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    .plan-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .plan-nombre {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 1rem;
      color: #1F2937;
    }

    .plan-precio {
      margin-bottom: 1rem;
    }

    .precio-monto {
      font-size: 56px;
      font-weight: 800;
      color: #25D366;
      letter-spacing: -0.02em;
    }

    .precio-periodo {
      font-size: 18px;
      color: #6B7280;
      font-weight: 500;
    }

    .plan-descripcion {
      color: #6B7280;
      line-height: 1.6;
      font-size: 16px;
    }

    .plan-features h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1F2937;
    }

    .plan-features {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .plan-features ul {
      list-style: none;
      padding: 0;
      margin-bottom: 2rem;
      flex: 1;
    }

    .plan-features li {
      padding: 0.75rem 0;
      display: flex;
      align-items: center;
      color: #1F2937;
      font-size: 15px;
    }

    .plan-features .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: #ECFDF5;
      color: #25D366;
      border-radius: 50%;
      margin-right: 0.75rem;
      font-weight: 700;
      font-size: 14px;
    }

    .plan-footer {
      margin-top: auto;
    }

    .btn-suscribir, .btn-activo {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-suscribir {
      background: linear-gradient(135deg, #25D366 0%, #1FAD53 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    .btn-suscribir:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
    }

    .btn-suscribir:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-activo {
      background: linear-gradient(135deg, #168F45 0%, #25D366 100%);
      color: white;
      cursor: default;
      box-shadow: 0 4px 12px rgba(22, 143, 69, 0.3);
    }

    .info-adicional {
      margin-top: 5rem;
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .info-adicional h3 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 3rem;
      color: #1F2937;
      letter-spacing: -0.02em;
    }

    .beneficios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
    }

    .beneficio {
      text-align: center;
      padding: 1.5rem;
    }

    .beneficio-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .beneficio-icon .material-icons {
      font-size: 36px;
      color: #25D366;
    }

    .beneficio h4 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #1F2937;
    }

    .beneficio p {
      color: #6B7280;
      line-height: 1.6;
      font-size: 16px;
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
