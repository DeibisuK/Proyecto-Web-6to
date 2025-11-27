# 🔔 SISTEMA DE NOTIFICACIONES - IMPLEMENTACIÓN COMPLETA

## ✅ ESTADO: LISTO PARA USAR

---

## 📋 RESUMEN EJECUTIVO

Se ha implementado un **sistema completo de notificaciones automáticas** con:
- ✅ Backend en Node.js + Express + PostgreSQL (puerto 3008)
- ✅ 6 tipos de notificaciones automáticas con cron jobs
- ✅ API REST con 7 endpoints
- ✅ Frontend integrado con Angular 18 (signals + polling)
- ✅ UI responsive con dropdown en navbar y panel de árbitro

---

## 🏗️ ARQUITECTURA

### **Backend: notification-service** (Puerto 3008)

```
notification-service/
├── .env (PORT=3008)
├── package.json
└── src/
    ├── app.js                          # Express app
    ├── server.js                       # Inicia servidor
    ├── api/
    │   └── notification.routes.js      # Rutas REST
    ├── controllers/
    │   └── notification.controller.js  # Maneja requests
    ├── services/
    │   ├── notification.service.js     # Lógica de negocio
    │   ├── notification.repository.js  # Queries SQL
    │   └── notification.scheduler.js   # CRON JOBS AUTOMÁTICOS ⭐
    └── config/
        └── db.js                        # Pool PostgreSQL
```

### **Base de Datos**

**3 Tablas creadas:**

1. **`notificaciones`** - Notificaciones del sistema
   - `id_notificacion` (PK)
   - `uid_usuario` (FK → usuarios)
   - `asunto`, `descripcion`
   - `tipo` (info | success | warning | error | promotion)
   - `leida` (boolean)
   - `fecha_creacion`, `fecha_leida`
   - `origen` (torneo | suscripcion | pedido | partido | carrito | sistema)
   - `id_referencia` (FK genérico)
   - `url_accion` (para navegación)
   - `prioridad` (baja | normal | alta | urgente)

2. **`anuncios_globales`** - Anuncios broadcast
3. **`notificaciones_anuncios_leidas`** - Tracking de lectura

---

## 🤖 NOTIFICACIONES AUTOMÁTICAS (CRON JOBS)

### **1. ⭐⭐⭐ SUSCRIPCIONES (Diario 10:00 AM)**

**Previene pérdida de ingresos por suscripciones vencidas**

```javascript
// A) 7 días antes de vencer
SELECT suscripciones WHERE fecha_fin BETWEEN +6 days AND +7 days
Notificación:
  Asunto: "⏳ Tu suscripción [Premium] vence en 7 días"
  Descripción: "Renueva antes del 27/11 para mantener beneficios..."
  Tipo: warning
  Prioridad: alta
  URL: /metodos-de-pago

// B) 24 horas antes de vencer
SELECT suscripciones WHERE fecha_fin BETWEEN NOW() AND +24 hours
Notificación:
  Asunto: "⚠️ ¡Tu suscripción vence mañana!"
  Tipo: error
  Prioridad: urgente
```

### **2. ⭐⭐⭐ TORNEOS (Diario 9:00 AM)**

**Reduce inasistencias y mejora experiencia**

```javascript
// A) 3 días antes del torneo
SELECT torneos WHERE fecha_inicio = CURRENT_DATE + 3 days
JOIN torneos_equipos + equipos + usuarios (capitanes)
Notificación:
  Asunto: "⚽ El torneo '[Copa Verano]' empieza en 3 días"
  Descripción: "Prepara a tu equipo '[Tigres]', revisa horarios..."
  Tipo: warning
  URL: /dashboard-torneo?id=X

// B) 1 día antes (con horario primer partido)
LEFT JOIN partidos_torneo (primer partido del equipo)
Notificación:
  Asunto: "🏆 Torneo '[Copa Verano]' empieza mañana"
  Descripción: "Tu equipo jugará a las 18:00 en Cancha 5..."
  Tipo: info
```

### **3. ⭐⭐ ÁRBITROS (Cada hora)**

**Árbitros nunca olvidan sus partidos**

```javascript
// 1-3 horas antes del partido
SELECT partidos_torneo 
WHERE hora_inicio BETWEEN CURRENT_TIME + 1h AND CURRENT_TIME + 3h
  AND id_arbitro IS NOT NULL
Notificación:
  Asunto: "⏰ Partido en 2 horas"
  Descripción: "Arbitrarás [Tigres vs Leones] en [Cancha 5]..."
  Tipo: warning
  Prioridad: alta
  URL: /arbitro/panel
```

### **4. ⭐⭐ CARRITO ABANDONADO (Diario 6:00 PM)**

**Recupera ventas perdidas**

```javascript
// Carritos con +24 horas sin comprar
SELECT carrito WHERE fecha_agregado < NOW() - 24h
GROUP BY uid
HAVING COUNT(items) > 0
Notificación:
  Asunto: "🛒 ¡Tu carrito te espera!"
  Descripción: "Tienes 3 productos por $45.99..."
  Tipo: info
  URL: /tienda/carrito
  
// No molesta cada día (filtra si ya envió en últimas 48h)
```

### **5. ⭐ PEDIDOS (Manual)**

**Llamar cuando cambia el estado del pedido**

```javascript
// En tu código de actualización de pedidos:
import { notificarCambioPedido } from 'notification-service';

await notificarCambioPedido(123, 'confirmado');
await notificarCambioPedido(123, 'enviado');
await notificarCambioPedido(123, 'entregado');

Estados soportados:
  - confirmado → "✅ Pedido confirmado #123"
  - en_preparacion → "📦 Preparando tu pedido"
  - enviado → "🚚 Pedido enviado (código tracking)"
  - entregado → "🎉 Pedido entregado exitosamente"
  - cancelado → "❌ Pedido cancelado (reembolso en 3-5 días)"
```

### **6. 🧹 LIMPIEZA (Domingos 3:00 AM)**

**Mantenimiento de base de datos**

```sql
DELETE FROM notificaciones
WHERE leida = true
  AND fecha_creacion < NOW() - 30 days
```

---

## 🔌 API REST ENDPOINTS

**Base URL:** `http://localhost:3000/n/api/notificaciones` (via Gateway)  
**Directo:** `http://localhost:3008/api/notificaciones`

### **1. GET /** - Obtener notificaciones

```http
GET /api/notificaciones?uid=abc123&leida=false&origen=torneo&limit=20&offset=0

Response:
[
  {
    "id_notificacion": 1,
    "uid_usuario": "abc123",
    "asunto": "Tu suscripción vence en 7 días",
    "descripcion": "Renueva antes del 27/11...",
    "tipo": "warning",
    "leida": false,
    "fecha_creacion": "2025-11-20T10:00:00Z",
    "origen": "suscripcion",
    "id_referencia": 5,
    "url_accion": "/metodos-de-pago",
    "prioridad": "alta"
  }
]
```

### **2. GET /contador** - Contador de no leídas

```http
GET /api/notificaciones/contador?uid=abc123

Response:
{ "unread": 5 }
```

### **3. POST /** - Crear notificación manual

```http
POST /api/notificaciones
Body:
{
  "uid_usuario": "abc123",
  "asunto": "Bienvenido al sistema",
  "descripcion": "Gracias por registrarte...",
  "tipo": "success",
  "origen": "sistema",
  "prioridad": "normal"
}
```

### **4. PUT /:id/leer** - Marcar como leída

```http
PUT /api/notificaciones/15/leer
Body: { "uid": "abc123" }
```

### **5. PUT /leer-todas** - Marcar todas como leídas

```http
PUT /api/notificaciones/leer-todas
Body: { "uid": "abc123" }

Response:
{ "success": true, "updated": 5 }
```

### **6. DELETE /:id** - Eliminar notificación

```http
DELETE /api/notificaciones/15
Body: { "uid": "abc123" }
```

### **7. DELETE /leidas** - Eliminar todas las leídas

```http
DELETE /api/notificaciones/leidas
Body: { "uid": "abc123" }

Response:
{ "success": true, "deleted": 10 }
```

---

## 🎨 FRONTEND - ANGULAR 18

### **Servicio: SystemNotificationService**

**Ubicación:** `core/services/system-notification.service.ts`

```typescript
import { SystemNotificationService } from '@core/services/system-notification.service';

constructor(private systemNotif: SystemNotificationService) {}

ngOnInit() {
  const uid = this.authService.currentUser?.uid;
  
  // 1. Iniciar polling automático cada 30 segundos
  this.systemNotif.startPolling(uid);
  
  // 2. Obtener notificaciones
  this.systemNotif.getNotifications({ 
    uid, 
    leida: false,
    limit: 20 
  }).subscribe(notifs => {
    this.notifications = notifs;
  });
  
  // 3. Acceder al contador reactivo (signal)
  this.unreadCount = this.systemNotif.unreadCount;
}

// 4. Marcar como leída
markAsRead(notif: SystemNotification) {
  this.systemNotif.markAsRead(notif.id_notificacion, uid)
    .subscribe(() => {
      notif.leida = true;
      
      // Navegar automáticamente si tiene URL
      if (notif.url_accion) {
        this.router.navigate([notif.url_accion]);
      }
    });
}

// 5. Marcar todas como leídas
markAllAsRead() {
  this.systemNotif.markAllAsRead(uid).subscribe();
}
```

### **Componentes Integrados**

✅ **navbar.ts** - Cliente (todas las notificaciones)  
✅ **arbitro-layout.ts** - Árbitro (solo origen='partido')

**Características:**
- Polling automático cada 30 segundos
- Badge con contador de no leídas
- Dropdown con lista de notificaciones
- Click para marcar como leída + navegar
- Botón "Marcar todas como leídas"
- Formato de tiempo relativo ("Hace 5 minutos")

---

## 🚀 CÓMO INICIAR EL SISTEMA

### **1. Backend**

```powershell
# Opción A: Iniciar solo notification-service
cd OSC-Backend/micro-servicios/notification-service
node src/server.js

# Opción B: Iniciar todos los servicios (incluye notification-service)
cd Proyecto-Web-6to
node start-backend.js
```

**Salida esperada:**
```
✅ Scheduler de notificaciones iniciado
📅 Cron jobs activos:
   ⭐⭐⭐ Suscripciones: Diario 10:00 AM (Crítico)
   ⭐⭐⭐ Torneos: Diario 9:00 AM (Importante)
   ⭐⭐  Árbitros: Cada hora (Útil)
   ⭐⭐  Carrito abandonado: Diario 6:00 PM (Recupera ventas)
   ⭐    Pedidos: Manual via notificarCambioPedido()
   🧹   Limpieza: Domingos 3:00 AM (Mantenimiento)
✅ Notification Service corriendo en http://localhost:3008
```

### **2. Frontend**

```powershell
cd osc-frontend
ng serve --open
```

El sistema **detecta automáticamente** cuando un usuario inicia sesión y:
1. Inicia el polling cada 30 segundos
2. Carga las notificaciones desde el backend
3. Actualiza el badge del contador en tiempo real

---

## 🧪 TESTING

### **1. Probar Cron Jobs (Modo Rápido)**

Cambiar temporalmente los schedules en `notification.scheduler.js`:

```javascript
// De esto:
cron.schedule('0 10 * * *', async () => { ... }); // Diario 10 AM

// A esto (cada minuto):
cron.schedule('* * * * *', async () => {
  console.log('🔔 [TEST] Ejecutando check de suscripciones...');
  // ... resto del código
});
```

### **2. Crear Notificación Manual (Postman)**

```http
POST http://localhost:3008/api/notificaciones
Content-Type: application/json

{
  "uid_usuario": "TU_UID_FIREBASE",
  "asunto": "Prueba de notificación",
  "descripcion": "Esto es una prueba del sistema",
  "tipo": "info",
  "origen": "sistema",
  "prioridad": "normal",
  "url_accion": "/dashboard"
}
```

### **3. Verificar en Frontend**

1. Inicia sesión en la aplicación
2. El badge de notificaciones debería mostrar el contador
3. Click en el ícono de campana
4. Verás la notificación creada
5. Click en la notificación → se marca como leída + navega a `/dashboard`

### **4. Queries SQL de Diagnóstico**

Ejecuta en PostgreSQL para ver qué notificaciones se generarían:

```sql
-- Ver suscripciones que vencen en 7 días
SELECT 
  s.id_suscripcion,
  u.uid,
  u.nombre_completo,
  p.nombre AS plan_nombre,
  s.fecha_fin
FROM suscripciones s
JOIN usuarios u ON s.uid = u.uid
JOIN planes p ON s.id_plan = p.id_plan
WHERE s.fecha_fin BETWEEN CURRENT_DATE + INTERVAL '6 days' 
                      AND CURRENT_DATE + INTERVAL '7 days'
  AND s.estado = 'activa';
```

---

## 📊 MONITOREO

### **Logs del Scheduler**

El scheduler imprime en consola cada vez que ejecuta:

```
🔔 [CRON] Verificando suscripciones próximas a vencer...
✅ [CRON] 3 notificaciones de suscripción (7 días) enviadas
✅ [CRON] 1 notificaciones de suscripción (24h) enviadas
```

### **Verificar Estado**

```sql
-- Contar notificaciones por tipo
SELECT tipo, COUNT(*) 
FROM notificaciones 
GROUP BY tipo;

-- Notificaciones no leídas por usuario
SELECT uid_usuario, COUNT(*) 
FROM notificaciones 
WHERE leida = false 
GROUP BY uid_usuario;

-- Notificaciones creadas hoy
SELECT origen, COUNT(*) 
FROM notificaciones 
WHERE fecha_creacion::date = CURRENT_DATE 
GROUP BY origen;
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### **Cambiar Horarios de Cron Jobs**

Edita `src/services/notification.scheduler.js`:

```javascript
// Formato: minuto hora día mes día-semana
'0 10 * * *'   // Diario 10:00 AM
'0 */2 * * *'  // Cada 2 horas
'0 * * * *'    // Cada hora
'* * * * *'    // Cada minuto (testing)
'0 8 * * 1'    // Lunes 8:00 AM
'0 3 * * 0'    // Domingos 3:00 AM
```

### **Agregar Nuevo Tipo de Notificación**

1. **Backend** - Agregar cron job en `notification.scheduler.js`:

```javascript
cron.schedule('0 12 * * *', async () => {
  console.log('🔔 [CRON] Verificando nuevos eventos...');
  
  const eventos = await pool.query(`
    SELECT * FROM eventos WHERE fecha = CURRENT_DATE + 1
  `);
  
  for (const evento of eventos.rows) {
    await pool.query(`
      INSERT INTO notificaciones (uid_usuario, asunto, descripcion, tipo, origen)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      evento.uid_organizador,
      `🎉 Evento "${evento.nombre}" es mañana`,
      `Prepárate para el evento...`,
      'info',
      'evento'
    ]);
  }
});
```

2. **Frontend** - Filtrar en componente (opcional):

```typescript
// Si quieres un componente que solo muestre cierto tipo
this.systemNotif.getNotifications({ 
  uid, 
  origen: 'evento' 
}).subscribe();
```

---

## 📝 ARCHIVOS MODIFICADOS/CREADOS

### **Backend (OSC-Backend/micro-servicios/notification-service/)**
- ✅ `.env` - Variables de entorno
- ✅ `package.json` - Dependencias
- ✅ `src/app.js` - Express app
- ✅ `src/server.js` - Inicia servidor
- ✅ `src/api/notification.routes.js` - Rutas REST
- ✅ `src/controllers/notification.controller.js` - Controlador
- ✅ `src/services/notification.service.js` - Lógica
- ✅ `src/services/notification.repository.js` - SQL
- ✅ `src/services/notification.scheduler.js` - **CRON JOBS** ⭐
- ✅ `src/config/db.js` - Pool PostgreSQL

### **Gateway**
- ✅ `api-gateway/.env` - Agregado `NOTIFICATION_SERVICE_URL=http://localhost:3008`
- ✅ `api-gateway/src/app.js` - Agregado proxy `/n` → puerto 3008

### **Frontend (osc-frontend/src/app/)**
- ✅ `core/services/system-notification.service.ts` - Servicio Angular
- ✅ `shared/components/navbar/navbar.ts` - Integrado servicio real
- ✅ `shared/components/navbar/navbar.html` - Actualizado propiedades
- ✅ `features/arbitro/layout/arbitro-layout.ts` - Integrado servicio real
- ✅ `features/arbitro/layout/arbitro-layout.html` - Actualizado propiedades

### **Database**
- ✅ Tabla `notificaciones`
- ✅ Tabla `anuncios_globales`
- ✅ Tabla `notificaciones_anuncios_leidas`
- ✅ Indexes en uid_usuario, fecha_creacion, origen

---

## 🎯 PRÓXIMOS PASOS (OPCIONALES)

### **Mejoras Futuras**

1. **WebSocket en tiempo real** (en lugar de polling)
   - Notificaciones instantáneas sin esperar 30s
   - Usa Socket.io o Firebase Realtime Database

2. **Notificaciones push del navegador**
   - Web Push API
   - Service Workers para notificaciones offline

3. **Email/SMS para notificaciones urgentes**
   - Suscripción vence en 24h → Email automático
   - Partido en 2 horas → SMS al árbitro

4. **Panel de administración**
   - Crear anuncios globales desde UI
   - Enviar notificaciones masivas
   - Estadísticas de lectura

5. **Más tipos de notificaciones**
   - Cambios de horario en torneos
   - Clasificación a siguiente fase
   - Logros/gamificación
   - Productos con stock bajo
   - Nuevos descuentos personalizados

---

## ✅ CHECKLIST DE VALIDACIÓN

- [x] Backend corre en puerto 3008
- [x] Cron jobs se ejecutan automáticamente
- [x] API responde a peticiones
- [x] Gateway hace proxy a `/n`
- [x] Frontend carga notificaciones al login
- [x] Polling funciona cada 30 segundos
- [x] Badge muestra contador correcto
- [x] Dropdown muestra notificaciones
- [x] Marcar como leída funciona
- [x] Navegación a url_accion funciona
- [x] Árbitros ven solo sus notificaciones
- [x] Clientes ven todas sus notificaciones

---

## 🐛 TROUBLESHOOTING

### **Backend no arranca**

```powershell
# Verificar dependencias
cd notification-service
npm install

# Verificar variables de entorno
cat .env  # Debe tener PORT=3008
```

### **Notificaciones no aparecen en frontend**

1. Verificar que el usuario esté autenticado (`uid` disponible)
2. Abrir DevTools → Network → Buscar llamadas a `/n/api/notificaciones`
3. Verificar que haya notificaciones en la BD:
   ```sql
   SELECT * FROM notificaciones WHERE uid_usuario = 'TU_UID';
   ```

### **Cron jobs no se ejecutan**

1. Verificar que el servidor esté corriendo
2. Verificar horarios en `notification.scheduler.js`
3. Para testing, cambiar a `* * * * *` (cada minuto)
4. Ver logs en consola del servidor

### **Contador no se actualiza**

1. El polling tarda 30 segundos en la primera actualización
2. Forzar actualización: recargar página o reloguearse
3. Verificar en DevTools → Network → llamadas a `/contador`

---

## 📞 SOPORTE

Si necesitas agregar más tipos de notificaciones o modificar horarios, edita:
- **Backend:** `src/services/notification.scheduler.js`
- **Frontend:** `core/services/system-notification.service.ts`

**Documentación SQL:** `OSC-Backend/docs/QUERIES-NOTIFICACIONES-AUTOMATICAS.sql`

---

**Fecha de implementación:** 27 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ PRODUCCIÓN
