# 🚀 Guía Rápida - Sistema de Suscripciones

## ⚡ Inicio Rápido

### 1. Instalar dependencias del subscription-service

```bash
cd OSC-Backend/micro-servicios/subscription-service
npm install
```

### 2. Configurar variable de entorno

Agregar al archivo `.env` en la raíz de OSC-Backend:

```env
SUBSCRIPTION_SERVICE_PORT=3007
```

### 3. Iniciar el servicio

```bash
# Desde subscription-service/
npm start
```

### 4. Configurar API Gateway

En `OSC-Backend/micro-servicios/api-gateway/src/app.js`, agregar:

```javascript
import { createProxyMiddleware } from 'http-proxy-middleware';

// Agregar estas rutas ANTES de las otras rutas
app.use('/client/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));

app.use('/public/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Proteger una ruta de backend

Supongamos que tienes un endpoint para crear torneos y quieres que solo usuarios premium puedan usarlo.

```javascript
// En tu archivo de rutas, por ejemplo: torneos.routes.js
import express from 'express';
import authenticate from '../../../middleware/authenticate.js';
import requireSubscription from '../../../middleware/requireSubscription.js';
import TorneoController from '../controllers/torneo.controller.js';

const router = express.Router();

// ❌ ANTES - Cualquier usuario autenticado podía crear torneos
router.post('/crear', 
  authenticate,
  TorneoController.crear
);

// ✅ AHORA - Solo usuarios premium pueden crear torneos
router.post('/crear', 
  authenticate,           // Primero verificar que esté logueado
  requireSubscription,    // Luego verificar que tenga suscripción activa
  TorneoController.crear
);

export default router;
```

**Respuesta cuando no tiene suscripción**:
```json
{
  "success": false,
  "mensaje": "Acceso denegado. Se requiere una suscripción premium activa para acceder a esta funcionalidad.",
  "requiresSubscription": true,
  "code": "NO_ACTIVE_SUBSCRIPTION"
}
```

### Ejemplo 2: Proteger rutas en Angular

```typescript
// En app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { premiumGuard } from './core/guards/subscription.guard';

export const routes: Routes = [
  {
    path: 'planes',
    loadComponent: () => import('./features/client/pages/subscription/planes-suscripcion.component')
      .then(m => m.PlanesSuscripcionComponent)
  },
  {
    path: 'client',
    children: [
      {
        path: 'mi-suscripcion',
        loadComponent: () => import('./features/client/pages/subscription/mi-suscripcion.component')
          .then(m => m.MiSuscripcionComponent),
        canActivate: [authGuard]  // Solo requiere estar logueado
      },
      {
        path: 'crear-torneo',
        loadComponent: () => import('./features/admin/crear-torneo.component')
          .then(m => m.CrearTorneoComponent),
        canActivate: [premiumGuard]  // Requiere estar logueado Y tener suscripción
      },
      {
        path: 'gestionar-equipos',
        loadComponent: () => import('./features/admin/equipos.component')
          .then(m => m.EquiposComponent),
        canActivate: [premiumGuard]  // Requiere suscripción
      }
    ]
  }
];
```

### Ejemplo 3: Mostrar contenido solo a usuarios premium

```typescript
// En tu componente
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '@core/services/subscription.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <!-- Contenido para todos -->
      <div class="contenido-basico">
        <p>Contenido disponible para todos los usuarios</p>
      </div>

      <!-- Contenido solo para premium -->
      <div *ngIf="tienePremium$ | async; else noPremuim" class="contenido-premium">
        <h2>🌟 Funciones Premium</h2>
        <button routerLink="/client/crear-torneo">Crear Torneo</button>
        <button routerLink="/client/estadisticas-avanzadas">Ver Estadísticas</button>
      </div>

      <!-- Mensaje para usuarios sin suscripción -->
      <ng-template #noPremuim>
        <div class="llamada-accion">
          <h3>🔒 Desbloquea Funciones Premium</h3>
          <p>Suscríbete para acceder a creación de torneos y más</p>
          <button routerLink="/planes">Ver Planes</button>
        </div>
      </ng-template>

      <!-- Información de la suscripción (si la tiene) -->
      <div *ngIf="infoSuscripcion$ | async as info" class="info-suscripcion">
        <p>Plan: {{ info.nombrePlan }}</p>
        <p>Expira: {{ info.expira | date }}</p>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private subscriptionService = inject(SubscriptionService);

  // Observable que indica si tiene suscripción activa
  tienePremium$ = this.subscriptionService.tieneSuscripcionActiva$;

  // Observable con información completa de la suscripción
  infoSuscripcion$ = this.subscriptionService.obtenerInfoSuscripcionDesdeClaims();
}
```

### Ejemplo 4: Deshabilitar botones para usuarios sin suscripción

```typescript
// Component
export class TorneosComponent {
  private subscriptionService = inject(SubscriptionService);
  
  tienePremium$ = this.subscriptionService.tieneSuscripcionActiva$;
}
```

```html
<!-- Template -->
<div class="acciones">
  <button 
    (click)="crearTorneo()"
    [disabled]="!(tienePremium$ | async)"
    class="btn-crear">
    Crear Torneo
  </button>

  <p *ngIf="!(tienePremium$ | async)" class="mensaje-premium">
    <a routerLink="/planes">Suscríbete</a> para crear torneos
  </p>
</div>
```

### Ejemplo 5: Verificar suscripción programáticamente

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SubscriptionService } from '@core/services/subscription.service';
import { Router } from '@angular/router';

@Component({...})
export class AlgunComponente implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  ngOnInit() {
    // Verificar si tiene suscripción al cargar
    this.subscriptionService.verificarEstado().subscribe(estado => {
      if (!estado.tieneSuscripcion) {
        console.log('Usuario sin suscripción');
        // Redirigir a planes o mostrar mensaje
        this.router.navigate(['/planes'], {
          queryParams: { message: 'Se requiere suscripción premium' }
        });
      } else {
        console.log('Usuario premium:', estado.suscripcion);
      }
    });
  }

  async verificarAcceso() {
    // Alternativa usando el observable
    const tienePremium = await firstValueFrom(
      this.subscriptionService.tieneSuscripcionActiva$
    );

    if (tienePremium) {
      console.log('Tiene acceso premium');
      this.realizarAccionPremium();
    } else {
      console.log('No tiene acceso premium');
      this.mostrarMensajeSuscripcion();
    }
  }
}
```

### Ejemplo 6: Flujo completo de suscripción

```typescript
import { Component, inject } from '@angular/core';
import { SubscriptionService } from '@core/services/subscription.service';
import { NotificationService } from '@core/services/notification.service';
import { Router } from '@angular/router';

@Component({...})
export class PlanesComponent {
  private subscriptionService = inject(SubscriptionService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  procesando = false;

  async suscribirse(idPlan: number) {
    try {
      this.procesando = true;

      // Simular pago (en producción, aquí iría integración con Stripe/PayPal)
      const response = await firstValueFrom(
        this.subscriptionService.simularPago(idPlan, 'tarjeta')
      );

      // Mostrar confirmación
      this.notificationService.success('¡Suscripción activada exitosamente!');

      // Redirigir al dashboard
      this.router.navigate(['/client/dashboard']);

    } catch (error: any) {
      this.notificationService.error(
        error.error?.mensaje || 'Error al procesar la suscripción'
      );
      console.error('Error:', error);
    } finally {
      this.procesando = false;
    }
  }

  async cancelarSuscripcion(idSuscripcion: number) {
    if (!confirm('¿Seguro que deseas cancelar tu suscripción?')) {
      return;
    }

    try {
      await firstValueFrom(
        this.subscriptionService.cancelarSuscripcion(idSuscripcion)
      );

      this.notificationService.success('Suscripción cancelada');
      
      // Recargar datos
      window.location.reload(); // O mejor, actualizar estado reactivamente

    } catch (error: any) {
      this.notificationService.error(
        error.error?.mensaje || 'Error al cancelar'
      );
    }
  }
}
```

## 🔍 Debugging

### Ver claims de Firebase en la consola del navegador

```javascript
// Abrir DevTools (F12)
const auth = getAuth();
const user = auth.currentUser;
if (user) {
  user.getIdTokenResult().then(token => {
    console.log('Claims:', token.claims);
    console.log('Premium:', token.claims.premium);
    console.log('Expira:', token.claims.subscriptionExpires);
  });
}
```

### Forzar actualización de claims

```typescript
// En el componente
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export class MiComponente {
  private authService = inject(AuthService);

  async refrescarClaims() {
    // Forzar refresh del token para obtener claims actualizados
    await this.authService.getIdToken(true);
    console.log('Claims actualizados');
  }
}
```

### Probar en Postman

```http
### Obtener planes (público)
GET http://localhost:3000/public/suscripciones/planes

### Verificar estado (requiere token)
GET http://localhost:3000/client/suscripciones/estado
Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE

### Simular pago
POST http://localhost:3000/client/suscripciones/simular-pago
Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE
Content-Type: application/json

{
  "idPlan": 1,
  "metodoPago": "tarjeta"
}
```

## 📊 Verificar en la Base de Datos

```sql
-- Ver todos los planes
SELECT * FROM planes_suscripcion;

-- Ver suscripciones activas
SELECT 
  us.*,
  ps.nombre,
  u.email_user
FROM usuarios_suscripciones us
JOIN planes_suscripcion ps ON us.id_plan = ps.id_plan
JOIN usuarios u ON us.uid_usuario = u.uid
WHERE us.estado = 'activa'
  AND us.fecha_fin > NOW();

-- Ver historial de un usuario específico
SELECT * FROM usuarios_suscripciones
WHERE uid_usuario = 'FIREBASE_UID_AQUI'
ORDER BY creado_en DESC;
```

## 🎨 Agregar al menú de navegación

```html
<!-- En tu header/navbar component -->
<nav>
  <a routerLink="/inicio">Inicio</a>
  <a routerLink="/planes">Planes</a>
  
  <div *ngIf="isAuthenticated$ | async">
    <a routerLink="/client/mi-suscripcion">Mi Suscripción</a>
    
    <!-- Mostrar badge premium si tiene suscripción -->
    <span *ngIf="tienePremium$ | async" class="badge-premium">
      ⭐ Premium
    </span>
  </div>
</nav>
```

## ⚠️ Errores Comunes

### Error: "Firebase not configured"
**Solución**: Verificar que `GOOGLE_APPLICATION_CREDENTIALS` esté configurado en `.env`

### Error: "No autenticado"
**Solución**: Asegurarse de que el middleware `authenticate` esté antes de `requireSubscription`

### Claims no se actualizan
**Solución**: 
```typescript
// Forzar refresh del token
await this.authService.getIdToken(true);
```

### Guard no permite acceso aunque tiene suscripción
**Solución**:
1. Verificar que la fecha de expiración no haya pasado
2. Sincronizar estado: `POST /client/suscripciones/sincronizar`
3. Revisar logs del backend

---

¡Listo! Tu sistema de suscripciones está configurado. 🎉
