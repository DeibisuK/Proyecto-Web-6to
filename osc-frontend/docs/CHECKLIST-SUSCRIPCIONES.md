# ✅ Checklist de Implementación - Sistema de Suscripciones

## 📋 Antes de Empezar

- [ ] Backup de la base de datos
- [ ] Firebase Admin SDK configurado en el proyecto
- [ ] Variables de entorno configuradas

---

## 🗄️ Paso 1: Base de Datos (YA COMPLETADO ✅)

- [x] Tabla `planes_suscripcion` creada
- [x] Tabla `usuarios_suscripciones` creada
- [x] Índices optimizados creados
- [x] Triggers de timestamp configurados
- [x] Planes iniciales insertados (Mensual y Anual)

**Verificar**:
```sql
SELECT * FROM planes_suscripcion;
SELECT * FROM usuarios_suscripciones LIMIT 5;
```

---

## 🔧 Paso 2: Backend - Subscription Service

### Instalación

- [ ] Navegar a `OSC-Backend/micro-servicios/subscription-service/`
- [ ] Ejecutar `npm install`
- [ ] Verificar que no haya errores de instalación

**Comandos**:
```bash
cd OSC-Backend/micro-servicios/subscription-service
npm install
```

### Configuración

- [ ] Agregar `SUBSCRIPTION_SERVICE_PORT=3007` al archivo `.env`
- [ ] Verificar que `GOOGLE_APPLICATION_CREDENTIALS` esté configurado
- [ ] Verificar credenciales de base de datos en `.env`

**Variables necesarias en `.env`**:
```env
SUBSCRIPTION_SERVICE_PORT=3007
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host
DB_NAME=bd_orosports
DB_PORT=25060
GOOGLE_APPLICATION_CREDENTIALS=ruta/al/archivo/serviceAccount.json
```

### Prueba del servicio

- [ ] Iniciar el servicio: `npm start`
- [ ] Verificar que inicie sin errores
- [ ] Verificar que muestre los endpoints en consola
- [ ] Probar endpoint de salud: `GET http://localhost:3007/`

**Respuesta esperada**:
```json
{
  "service": "Subscription Service",
  "status": "running",
  "version": "1.0.0"
}
```

---

## 🌐 Paso 3: API Gateway

### Configurar Proxy

- [ ] Abrir `OSC-Backend/micro-servicios/api-gateway/src/app.js`
- [ ] Importar `createProxyMiddleware` si no está
- [ ] Agregar rutas de proxy para subscription-service

**Código a agregar**:
```javascript
// Importar al inicio del archivo
import { createProxyMiddleware } from 'http-proxy-middleware';

// Agregar ANTES de otras rutas
app.use('/client/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));

app.use('/public/suscripciones', createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true
}));
```

### Prueba del Gateway

- [ ] Reiniciar API Gateway
- [ ] Probar: `GET http://localhost:3000/public/suscripciones/planes`
- [ ] Verificar que retorne los 2 planes

---

## 🎨 Paso 4: Frontend - Angular

### Servicios y Guards (YA CREADOS ✅)

- [x] `SubscriptionService` creado
- [x] Guards de suscripción creados
- [x] Componentes UI creados

### Configurar Rutas

- [ ] Abrir `osc-frontend/src/app/app.routes.ts`
- [ ] Importar componentes y guards
- [ ] Agregar rutas de suscripción

**Código a agregar**:
```typescript
// Importaciones
import { PlanesSuscripcionComponent } from './features/client/pages/subscription/planes-suscripcion.component';
import { MiSuscripcionComponent } from './features/client/pages/subscription/mi-suscripcion.component';
import { subscriptionGuard, premiumGuard } from './core/guards/subscription.guard';

// Rutas
{
  path: 'planes',
  component: PlanesSuscripcionComponent
},
{
  path: 'client/mi-suscripcion',
  component: MiSuscripcionComponent,
  canActivate: [authGuard]
}
```

### Agregar al Menú de Navegación (Opcional)

- [ ] Abrir componente de header/navbar
- [ ] Agregar link a `/planes`
- [ ] Agregar link a `/client/mi-suscripcion` (solo si está autenticado)

**Ejemplo**:
```html
<nav>
  <a routerLink="/planes">Planes Premium</a>
  <a *ngIf="isAuthenticated$ | async" routerLink="/client/mi-suscripcion">
    Mi Suscripción
  </a>
</nav>
```

---

## 🧪 Paso 5: Pruebas Funcionales

### Prueba 1: Ver Planes (Sin autenticación)

- [ ] Ir a `http://localhost:4200/planes`
- [ ] Verificar que muestre 2 planes
- [ ] Verificar que muestre precios correctos
- [ ] Verificar que muestre "Iniciar sesión para suscribirse"

### Prueba 2: Suscribirse

- [ ] Iniciar sesión con un usuario de prueba
- [ ] Ir a `/planes`
- [ ] Click en "Suscribirse Ahora" en Plan Mensual
- [ ] Verificar mensaje de éxito
- [ ] Verificar redirección a dashboard

### Prueba 3: Verificar Claims

- [ ] Abrir DevTools (F12) → Console
- [ ] Pegar y ejecutar:
```javascript
const auth = getAuth();
auth.currentUser.getIdTokenResult().then(token => {
  console.log('Claims:', token.claims);
});
```
- [ ] Verificar que `premium: true`

### Prueba 4: Ver Suscripción Activa

- [ ] Ir a `/client/mi-suscripcion`
- [ ] Verificar que muestre plan activo
- [ ] Verificar fecha de expiración
- [ ] Verificar días restantes

### Prueba 5: Cancelar Suscripción

- [ ] En `/client/mi-suscripcion`
- [ ] Click en "Cancelar Suscripción"
- [ ] Confirmar en diálogo
- [ ] Verificar mensaje de éxito
- [ ] Verificar que `premium: false` en claims

---

## 🛡️ Paso 6: Proteger Rutas (Ejemplo)

### Proteger una ruta de backend

- [ ] Elegir un endpoint que quieras proteger (ej: crear torneo)
- [ ] Agregar middleware `requireSubscription`
- [ ] Probar sin suscripción (debe rechazar)
- [ ] Probar con suscripción (debe permitir)

**Ejemplo**:
```javascript
import requireSubscription from '../../../middleware/requireSubscription.js';

router.post('/crear-torneo',
  authenticate,
  requireSubscription,  // ← Agregar aquí
  controller.crear
);
```

### Proteger una ruta de frontend

- [ ] Elegir una ruta que quieras proteger
- [ ] Agregar `canActivate: [premiumGuard]`
- [ ] Probar sin suscripción (debe redirigir)
- [ ] Probar con suscripción (debe permitir)

**Ejemplo**:
```typescript
{
  path: 'client/crear-torneo',
  component: CrearTorneoComponent,
  canActivate: [premiumGuard]  // ← Agregar aquí
}
```

---

## 📊 Paso 7: Verificaciones en Base de Datos

### Verificar suscripción en BD

- [ ] Conectar a la base de datos
- [ ] Ejecutar query para ver suscripción activa:

```sql
SELECT 
  us.*,
  ps.nombre,
  u.email_user
FROM usuarios_suscripciones us
JOIN planes_suscripcion ps ON us.id_plan = ps.id_plan
JOIN usuarios u ON us.uid_usuario = u.uid
WHERE us.uid_usuario = 'TU_UID_DE_FIREBASE'
ORDER BY us.creado_en DESC;
```

- [ ] Verificar que estado sea 'activa'
- [ ] Verificar que fecha_fin sea mayor a HOY

---

## 🔍 Paso 8: Testing con Postman (Opcional)

### Colección de pruebas

- [ ] Crear colección "Suscripciones"
- [ ] Agregar requests:

**1. Obtener Planes**
```
GET http://localhost:3000/public/suscripciones/planes
```

**2. Verificar Estado**
```
GET http://localhost:3000/client/suscripciones/estado
Headers:
  Authorization: Bearer YOUR_TOKEN
```

**3. Simular Pago**
```
POST http://localhost:3000/client/suscripciones/simular-pago
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "idPlan": 1,
  "metodoPago": "tarjeta"
}
```

**4. Cancelar**
```
POST http://localhost:3000/client/suscripciones/cancelar
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "idSuscripcion": 1
}
```

---

## 📝 Paso 9: Documentación y Limpieza

- [ ] Leer `README.md` del subscription-service
- [ ] Leer `GUIA-SUSCRIPCIONES.md`
- [ ] Leer `RESUMEN-SUSCRIPCIONES.md`
- [ ] Agregar comentarios donde sea necesario
- [ ] Actualizar README principal del proyecto

---

## 🚀 Paso 10: Deployment (Futuro)

### Para cuando estés listo para producción:

- [ ] Configurar variables de entorno de producción
- [ ] Actualizar URLs del API en frontend
- [ ] Configurar CORS apropiadamente
- [ ] Implementar SSL/HTTPS
- [ ] Configurar logging y monitoreo
- [ ] Implementar sistema de pagos real (Stripe/PayPal)
- [ ] Configurar cron job para marcar suscripciones caducadas

---

## ❓ Troubleshooting

### Si algo no funciona:

**Backend no inicia**:
- [ ] Verificar dependencias instaladas
- [ ] Verificar variables de entorno
- [ ] Verificar logs de consola

**No se actualiza el claim**:
- [ ] Verificar que Firebase Admin esté configurado
- [ ] Forzar refresh: `getIdToken(true)`
- [ ] Verificar logs del backend

**Guard no permite acceso**:
- [ ] Verificar que el usuario esté autenticado
- [ ] Verificar claims en DevTools
- [ ] Verificar que suscripción no esté caducada

**Error en BD**:
- [ ] Verificar conexión a PostgreSQL
- [ ] Verificar que tablas existan
- [ ] Verificar logs de queries

---

## ✅ Checklist Final

Una vez completados todos los pasos:

- [ ] Backend subscription-service funcionando
- [ ] API Gateway proxying correctamente
- [ ] Frontend mostrando planes
- [ ] Proceso de suscripción funcionando
- [ ] Claims de Firebase actualizándose
- [ ] Guards protegiendo rutas
- [ ] Middleware protegiendo backend
- [ ] Base de datos registrando correctamente
- [ ] Documentación leída y comprendida

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, tu sistema de suscripciones está **100% funcional** y listo para usar.

**Próximos pasos sugeridos**:
1. Agregar más rutas protegidas según necesites
2. Personalizar estilos de los componentes
3. Agregar analytics para tracking
4. Implementar notificaciones de expiración
5. Cuando estés listo, integrar pasarela de pago real

---

**Fecha**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Sistema Completo
