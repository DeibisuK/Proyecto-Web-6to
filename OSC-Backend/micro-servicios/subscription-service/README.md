# Sistema de Suscripciones Premium - Oro Sport Club

## 📋 Descripción General

Sistema completo de suscripciones que integra PostgreSQL, Firebase Custom Claims y Angular para ofrecer funcionalidades premium a los usuarios.

## 🏗️ Arquitectura

### Backend (Node.js/Express)

**Microservicio**: `subscription-service`
- **Puerto**: 3007 (configurar en `.env` como `SUBSCRIPTION_SERVICE_PORT`)
- **Ubicación**: `OSC-Backend/micro-servicios/subscription-service/`

### Base de Datos (PostgreSQL)

**Tablas creadas**:
1. `planes_suscripcion` - Define los planes disponibles (mensual/anual)
2. `usuarios_suscripciones` - Registra las suscripciones de los usuarios

**Planes iniciales**:
- Plan Premium Mensual: $9.99 / 30 días
- Plan Premium Anual: $99.99 / 365 días

### Frontend (Angular)

**Servicios**:
- `SubscriptionService` - Gestión de suscripciones
- Claims automáticos vía `AuthService`

**Guards**:
- `subscriptionGuard` - Protege rutas que requieren suscripción
- `premiumGuard` - Combinación de auth + suscripción
- `noSubscriptionGuard` - Redirige usuarios premium

**Componentes**:
- `PlanesSuscripcionComponent` - Muestra planes y permite suscribirse
- `MiSuscripcionComponent` - Gestiona la suscripción actual

## 🚀 Configuración e Instalación

### 1. Base de Datos

Las tablas ya están creadas. Los planes iniciales ya están insertados.

### 2. Backend - Subscription Service

```bash
cd OSC-Backend/micro-servicios/subscription-service
npm install
```

**Agregar al `.env` principal**:
```env
SUBSCRIPTION_SERVICE_PORT=3007
```

**Iniciar el servicio**:
```bash
npm start
# o en desarrollo
npm run dev
```

### 3. Configurar API Gateway

Agregar proxy para el subscription-service en `api-gateway`:

```javascript
// En api-gateway/src/app.js
app.use('/client/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));

app.use('/public/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));
```

### 4. Frontend - Angular

**Agregar rutas en `app.routes.ts`**:

```typescript
import { PlanesSuscripcionComponent } from './features/client/pages/subscription/planes-suscripcion.component';
import { MiSuscripcionComponent } from './features/client/pages/subscription/mi-suscripcion.component';
import { subscriptionGuard, premiumGuard } from './core/guards/subscription.guard';

export const routes: Routes = [
  // Ruta pública para ver planes
  {
    path: 'planes',
    component: PlanesSuscripcionComponent
  },
  
  // Ruta protegida para gestionar suscripción
  {
    path: 'client/mi-suscripcion',
    component: MiSuscripcionComponent,
    canActivate: [authGuard]
  },
  
  // Ejemplo de ruta premium protegida
  {
    path: 'client/crear-torneo',
    component: CrearTorneoComponent,
    canActivate: [premiumGuard] // Requiere auth + suscripción activa
  }
];
```

## 📡 Endpoints API

### Endpoints Públicos

#### GET `/public/suscripciones/planes`
Obtiene todos los planes disponibles.

**Respuesta**:
```json
{
  "success": true,
  "planes": [
    {
      "id_plan": 1,
      "nombre": "Plan Premium Mensual",
      "descripcion": "...",
      "precio_simulado": 9.99,
      "duracion_dias": 30,
      "tipo": "mensual",
      "activo": true
    }
  ],
  "total": 2
}
```

### Endpoints Protegidos (requieren autenticación)

#### GET `/client/suscripciones/estado`
Verifica el estado de suscripción del usuario autenticado.

**Headers**: `Authorization: Bearer <token>`

**Respuesta**:
```json
{
  "tieneSuscripcion": true,
  "esPremium": true,
  "suscripcion": {
    "id_suscripcion": 1,
    "uid_usuario": "abc123",
    "nombre_plan": "Plan Premium Mensual",
    "tipo_plan": "mensual",
    "fecha_inicio": "2025-11-03T00:00:00Z",
    "fecha_fin": "2025-12-03T00:00:00Z",
    "estado": "activa"
  }
}
```

#### POST `/client/suscripciones/simular-pago`
Simula el pago y activa la suscripción.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "idPlan": 1,
  "metodoPago": "tarjeta"
}
```

**Respuesta**:
```json
{
  "success": true,
  "mensaje": "¡Suscripción activada exitosamente!",
  "suscripcion": { ... },
  "plan": { ... }
}
```

#### POST `/client/suscripciones/cancelar`
Cancela la suscripción activa.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "idSuscripcion": 1
}
```

#### GET `/client/suscripciones/historial`
Obtiene el historial de suscripciones del usuario.

**Headers**: `Authorization: Bearer <token>`

#### POST `/client/suscripciones/sincronizar`
Sincroniza el estado de la BD con Firebase Claims.

**Headers**: `Authorization: Bearer <token>`

## 🔐 Firebase Custom Claims

El sistema actualiza automáticamente los Custom Claims en Firebase cuando:
- Se activa una suscripción
- Se cancela una suscripción
- Se caduca una suscripción

**Claims agregados**:
```javascript
{
  premium: true,                              // Indica si tiene suscripción activa
  subscriptionType: "mensual",                // Tipo de plan
  subscriptionExpires: "2025-12-03T00:00:00Z", // Fecha de expiración
  subscriptionPlan: "Plan Premium Mensual",   // Nombre del plan
  subscriptionUpdatedAt: "2025-11-03T10:30:00Z" // Última actualización
}
```

## 🛡️ Proteger Rutas Backend

Para proteger endpoints del backend que requieren suscripción:

```javascript
import requireSubscription from '../../../middleware/requireSubscription.js';
import authenticate from '../../../middleware/authenticate.js';

// Usar ambos middlewares
router.post('/crear-torneo', 
  authenticate,           // Primero verificar autenticación
  requireSubscription,    // Luego verificar suscripción
  torneoController.crear
);
```

El middleware verifica en la BD si el usuario tiene suscripción activa y no caducada.

## 🎨 Uso en Componentes Angular

### Verificar si tiene suscripción

```typescript
export class MiComponente {
  private subscriptionService = inject(SubscriptionService);
  
  tienePremium$ = this.subscriptionService.tieneSuscripcionActiva$;
}
```

**En el template**:
```html
<div *ngIf="tienePremium$ | async">
  <!-- Contenido premium -->
</div>

<div *ngIf="!(tienePremium$ | async)">
  <a routerLink="/planes">Suscríbete para acceder</a>
</div>
```

### Obtener información de la suscripción

```typescript
this.subscriptionService.obtenerInfoSuscripcionDesdeClaims().subscribe(info => {
  if (info?.isPremium) {
    console.log('Plan:', info.nombrePlan);
    console.log('Expira:', info.expira);
  }
});
```

### Suscribirse a un plan

```typescript
suscribirse(idPlan: number) {
  this.subscriptionService.simularPago(idPlan).subscribe({
    next: (response) => {
      console.log('Suscripción activada');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('Error:', err);
    }
  });
}
```

## 🔄 Flujo Completo de Suscripción

1. **Usuario ve los planes** (`/planes`)
   - Componente: `PlanesSuscripcionComponent`
   - Endpoint: `GET /public/suscripciones/planes`

2. **Usuario hace clic en "Suscribirse"**
   - Se llama a `simularPago(idPlan)`
   - Endpoint: `POST /client/suscripciones/simular-pago`

3. **Backend procesa la suscripción**:
   - Cancela suscripciones anteriores
   - Crea nueva suscripción en BD
   - Actualiza Firebase Custom Claims
   - Retorna confirmación

4. **Frontend recibe confirmación**:
   - Actualiza estado local
   - Refresca token de Firebase
   - Redirige al dashboard

5. **Usuario accede a funciones premium**:
   - Guards verifican claims de Firebase
   - Backend verifica en BD si es necesario
   - Acceso concedido

## 🧪 Testing

### Probar el sistema

1. Crear un usuario de prueba
2. Ir a `/planes`
3. Suscribirse a un plan
4. Verificar que los claims se actualicen
5. Intentar acceder a rutas protegidas
6. Ver suscripción en `/client/mi-suscripcion`
7. Cancelar suscripción
8. Verificar que se revoque el acceso

### Verificar Claims en Firebase

```javascript
// En la consola del navegador
const user = auth.currentUser;
const token = await user.getIdTokenResult();
console.log(token.claims);
```

## 📝 Mantenimiento

### Marcar suscripciones caducadas

Crear un cron job o tarea programada para ejecutar:

```javascript
// En el backend
await Suscripcion.marcarSuscripcionesCaducadas();
```

Esto marcará como 'caducada' las suscripciones cuya `fecha_fin` haya pasado.

### Sincronizar claims masivamente

Si necesitas sincronizar todos los usuarios:

```javascript
// Script de mantenimiento
const usuarios = await obtenerTodosLosUsuarios();
for (const usuario of usuarios) {
  await FirebaseClaimsService.sincronizarEstado(usuario.uid);
}
```

## 🎯 Próximos Pasos

1. ✅ Agregar rutas al API Gateway
2. ✅ Probar flujo completo
3. ⬜ Implementar renovación automática (opcional)
4. ⬜ Agregar webhooks de pago real (cuando se implemente pago real)
5. ⬜ Crear dashboard de admin para gestionar suscripciones

## 🐛 Troubleshooting

### Claims no se actualizan
- Forzar refresh del token: `auth.currentUser.getIdToken(true)`
- Verificar que Firebase Admin esté configurado correctamente

### Error al crear suscripción
- Verificar que el usuario exista en la tabla `usuarios`
- Verificar que el `uid` sea de tipo TEXT en la BD
- Revisar logs del backend

### Guard no permite acceso
- Verificar que el token esté actualizado
- Verificar que la fecha de expiración no haya pasado
- Revisar console logs del guard

---

**Desarrollado para**: Oro Sport Club  
**Fecha**: Noviembre 2025  
**Versión**: 1.0.0
