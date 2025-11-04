import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService, Suscripcion } from '@core/services/subscription.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-mi-suscripcion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="suscripcion-container">
      <div class="header">
        <h1>Mi Suscripción</h1>
        <button (click)="verPlanes()" class="btn-ver-planes">
          Ver Planes Disponibles
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando()" class="loading">
        <div class="spinner"></div>
        <p>Cargando información...</p>
      </div>

      <!-- Sin Suscripción -->
      <div *ngIf="!cargando() && !suscripcionActiva()" class="sin-suscripcion">
        <div class="icono">🔒</div>
        <h2>No tienes una suscripción activa</h2>
        <p>Suscríbete para acceder a todas las funcionalidades premium</p>
        <button (click)="verPlanes()" class="btn-suscribirse">
          Ver Planes Premium
        </button>
      </div>

      <!-- Con Suscripción Activa -->
      <div *ngIf="!cargando() && suscripcionActiva()" class="con-suscripcion">
        <div class="suscripcion-card">
          <div class="card-header">
            <div class="badge-activo">✓ Activa</div>
            <h2>{{ suscripcionActiva()?.nombre_plan }}</h2>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Tipo:</span>
              <span class="value">{{ suscripcionActiva()?.tipo_plan === 'mensual' ? 'Mensual' : 'Anual' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Precio:</span>
              <span class="value">\${{ suscripcionActiva()?.precio_simulado }}</span>
            </div>

            <div class="info-row">
              <span class="label">Fecha de inicio:</span>
              <span class="value">{{ formatearFecha(suscripcionActiva()?.fecha_inicio) }}</span>
            </div>

            <div class="info-row">
              <span class="label">Fecha de expiración:</span>
              <span class="value expira">{{ formatearFecha(suscripcionActiva()?.fecha_fin) }}</span>
            </div>

            <div class="info-row">
              <span class="label">Días restantes:</span>
              <span class="value dias-restantes">{{ calcularDiasRestantes() }} días</span>
            </div>
          </div>

          <div class="card-footer">
            <button
              (click)="cancelarSuscripcion()"
              class="btn-cancelar"
              [disabled]="procesandoCancelacion()"
            >
              {{ procesandoCancelacion() ? 'Cancelando...' : 'Cancelar Suscripción' }}
            </button>
          </div>
        </div>

        <!-- Beneficios Incluidos -->
        <div class="beneficios-card">
          <h3>Beneficios Incluidos</h3>
          <ul class="beneficios-lista">
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
          </ul>
        </div>
      </div>

      <!-- Historial -->
      <div *ngIf="!cargando()" class="historial-section">
        <h2>Historial de Suscripciones</h2>

        <div *ngIf="historial().length === 0" class="sin-historial">
          <p>No hay registros en tu historial</p>
        </div>

        <div *ngIf="historial().length > 0" class="historial-lista">
          <div
            *ngFor="let item of historial()"
            class="historial-item"
            [class.activa]="item.estado === 'activa'"
          >
            <div class="historial-info">
              <h4>{{ item.nombre_plan }}</h4>
              <p class="fecha">
                {{ formatearFecha(item.fecha_inicio) }} - {{ formatearFecha(item.fecha_fin) }}
              </p>
            </div>
            <div class="historial-estado">
              <span
                class="badge"
                [class.badge-activa]="item.estado === 'activa'"
                [class.badge-caducada]="item.estado === 'caducada'"
                [class.badge-cancelada]="item.estado === 'cancelada'"
              >
                {{ item.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .suscripcion-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #1a1a1a;
    }

    .btn-ver-planes {
      padding: 0.75rem 1.5rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-ver-planes:hover {
      background-color: #2980b9;
    }

    .loading {
      text-align: center;
      padding: 3rem;
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

    .sin-suscripcion {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .sin-suscripcion .icono {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .sin-suscripcion h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .sin-suscripcion p {
      color: #666;
      margin-bottom: 2rem;
    }

    .btn-suscribirse {
      padding: 1rem 2rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-suscribirse:hover {
      background-color: #2980b9;
    }

    .con-suscripcion {
      display: grid;
      gap: 2rem;
    }

    .suscripcion-card, .beneficios-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .badge-activo {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #4caf50;
      color: white;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .card-header h2 {
      font-size: 1.75rem;
      color: #1a1a1a;
    }

    .card-body {
      margin-bottom: 2rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #1a1a1a;
      font-weight: 500;
    }

    .value.expira {
      color: #3498db;
    }

    .value.dias-restantes {
      color: #4caf50;
      font-weight: bold;
    }

    .card-footer {
      text-align: center;
    }

    .btn-cancelar {
      padding: 0.75rem 2rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-cancelar:hover:not(:disabled) {
      background-color: #c0392b;
    }

    .btn-cancelar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .beneficios-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: #1a1a1a;
    }

    .beneficios-lista {
      list-style: none;
      padding: 0;
    }

    .beneficios-lista li {
      padding: 0.75rem 0;
      display: flex;
      align-items: center;
      color: #333;
    }

    .beneficios-lista .icon {
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

    .historial-section {
      margin-top: 3rem;
    }

    .historial-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: #1a1a1a;
    }

    .sin-historial {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      color: #666;
    }

    .historial-lista {
      display: grid;
      gap: 1rem;
    }

    .historial-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .historial-item.activa {
      border-left: 4px solid #4caf50;
    }

    .historial-info h4 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
      color: #1a1a1a;
    }

    .historial-info .fecha {
      font-size: 0.875rem;
      color: #666;
    }

    .badge {
      padding: 0.4rem 0.8rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge-activa {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .badge-caducada {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .badge-cancelada {
      background-color: #ffebee;
      color: #f44336;
    }
  `]
})
export class MiSuscripcionComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  cargando = signal(true);
  suscripcionActiva = signal<Suscripcion | null>(null);
  historial = signal<Suscripcion[]>([]);
  procesandoCancelacion = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);

    // Cargar estado de suscripción
    this.subscriptionService.verificarEstado().subscribe({
      next: (estado) => {
        this.suscripcionActiva.set(estado.suscripcion);
      },
      error: (err) => {
        console.error('Error al cargar suscripción:', err);
        this.notificationService.error('Error al cargar la información de la suscripción');
      }
    });

    // Cargar historial
    this.subscriptionService.obtenerHistorial().subscribe({
      next: (response) => {
        this.historial.set(response.historial);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.cargando.set(false);
      }
    });
  }

  cancelarSuscripcion() {
    const suscripcion = this.suscripcionActiva();
    if (!suscripcion || this.procesandoCancelacion()) return;

    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
      return;
    }

    this.procesandoCancelacion.set(true);

    this.subscriptionService.cancelarSuscripcion(suscripcion.id_suscripcion).subscribe({
      next: (response) => {
        this.procesandoCancelacion.set(false);
        this.notificationService.success('Suscripción cancelada exitosamente');
        this.cargarDatos();
      },
      error: (err) => {
        this.procesandoCancelacion.set(false);
        this.notificationService.error(
          err.error?.mensaje || 'Error al cancelar la suscripción'
        );
        console.error('Error al cancelar:', err);
      }
    });
  }

  verPlanes() {
    this.router.navigate(['/planes']);
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calcularDiasRestantes(): number {
    const suscripcion = this.suscripcionActiva();
    if (!suscripcion) return 0;

    const fechaFin = new Date(suscripcion.fecha_fin);
    const hoy = new Date();
    const diferencia = fechaFin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return dias > 0 ? dias : 0;
  }
}
