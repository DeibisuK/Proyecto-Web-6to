# Panel de Árbitro - Integración Frontend-Backend

## 🎯 Resumen

Sistema completo de gestión de partidos en tiempo real para torneos multideporte (Fútbol, Baloncesto, Padel, Tenis) con panel de árbitro integrado.

## 📦 Componentes Implementados

### **Backend (Match Service - Puerto 3005)**

#### Modelos (6)
1. `eventos_partido.model.js` - Gestión de eventos del partido
2. `alineaciones.model.js` - Control de jugadores y sustituciones
3. `estado_partido_tiempo_real.model.js` - Cronómetro y control de tiempo
4. `clasificacion_torneo.model.js` - Cálculo de tablas de posiciones
5. `jugadores.model.js` - Gestión de jugadores
6. `configuracion_eventos.model.js` - Configuración de eventos por deporte

#### Controladores (6)
- `eventos_partido.controller.js`
- `alineaciones.controller.js`
- `estado_tiempo_real.controller.js`
- `clasificacion.controller.js`
- `jugadores.controller.js`
- `configuracion_eventos.controller.js`

#### Rutas
- **Árbitro (`/arbitro`)**: Gestión de eventos, alineaciones y tiempo real
- **Admin (`/admin`)**: CRUD jugadores, configuración eventos, recalcular clasificación
- **Cliente (`/client`)**: Consultas públicas de clasificación y eventos

### **Frontend (Angular)**

#### Servicios (6)
1. `eventos-partido.service.ts`
2. `alineaciones.service.ts`
3. `tiempo-real.service.ts`
4. `clasificacion.service.ts`
5. `jugadores.service.ts`
6. `configuracion-eventos.service.ts`

#### Componentes (5)
1. `arbitro-panel` - Página principal con tabs
2. `tiempo-real-control` - Cronómetro y controles
3. `eventos-partido` - Registro de eventos
4. `alineaciones-partido` - Gestión de alineaciones y sustituciones
5. `clasificacion-torneo` - Tabla de posiciones

#### Interfaces
- `match.interfaces.ts` - Todas las interfaces TypeScript

## 🚀 Iniciar el Sistema

### 1. Backend (Match Service)

```bash
cd C:\Users\kinji\OneDrive\Documentos\Web\Proyecto-Web-6to\OSC-Backend\micro-servicios\match-service
npm install
npm start
```

El servicio estará disponible en `http://localhost:3005`

### 2. Frontend (Angular)

```bash
cd C:\Users\kinji\OneDrive\Documentos\Web\Proyecto-Web-6to\osc-frontend
npm install
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### 3. Base de Datos

Ejecutar el script de migración:

```sql
-- Ubicación: OSC-Backend/MIGRACION-BD-OPTIMIZADA.sql
psql -U postgres -d nombre_db -f MIGRACION-BD-OPTIMIZADA.sql
```

## 📍 Rutas de Acceso

### Panel de Árbitro
```
http://localhost:4200/admin/arbitro-panel/:idPartido?idTorneo=:idTorneo
```

Ejemplo:
```
http://localhost:4200/admin/arbitro-panel/1?idTorneo=5
```

## 🎮 Funcionalidades

### Tab: Gestionar Tiempo ⏱️
- Cronómetro con actualización en tiempo real (polling cada 3 segundos)
- Controles: Iniciar, Pausar, Finalizar, Reiniciar
- Selector de periodo
- Indicador visual del estado (corriendo/pausado/detenido)
- Animación de pulso cuando está corriendo

### Tab: Eventos ⚽
- Formulario de registro de eventos
- Lista de eventos configurados por deporte
- Historial de eventos del partido
- Eliminación de eventos
- Muestra: tipo, jugador, equipo, minuto, periodo, puntos

### Tab: Alineaciones 👥
- Lista de titulares y suplentes por equipo
- Registro de sustituciones (modal)
- Indicadores visuales: minuto de entrada/salida
- Distinción entre jugadores activos y sustituidos

### Tab: Clasificación 🏆
- Tabla de posiciones completa
- Columnas: PJ, PG, PE, PP, PF, PC, DIF, PTS
- Botón para recalcular (admin)
- Resaltado de top 3 posiciones
- Indicadores de diferencia positiva/negativa

## 🔌 Endpoints Principales

### Árbitro
```
POST   /arbitro/partidos/:id/eventos
GET    /arbitro/partidos/:id/eventos
DELETE /arbitro/partidos/:id/eventos/:idEvento
GET    /arbitro/partidos/:id/alineaciones
POST   /arbitro/partidos/:id/sustituciones
POST   /arbitro/partidos/:id/tiempo-real/iniciar
POST   /arbitro/partidos/:id/tiempo-real/pausar
POST   /arbitro/partidos/:id/tiempo-real/detener
```

### Cliente (Público)
```
GET /client/torneos/:id/clasificacion
GET /client/torneos/:id/goleadores
GET /client/deportes/:id/eventos
```

### Admin
```
GET    /admin/equipos/:id/jugadores
POST   /admin/jugadores
PUT    /admin/jugadores/:id
DELETE /admin/jugadores/:id
POST   /admin/torneos/:id/clasificacion/recalcular
```

## 🛠️ Características Técnicas

### Backend
- **Database**: PostgreSQL con triggers automáticos
- **Triggers**: 
  - Actualización automática de marcador al registrar evento
  - Actualización automática de clasificación al finalizar partido
  - Timestamp de modificación
- **Transacciones**: Sustituciones y asignación de capitán
- **JSONB**: Datos flexibles por deporte (detalles, puntuación, estadísticas)

### Frontend
- **Angular 18+**: Standalone components
- **Signals**: Estado reactivo
- **RxJS**: Polling automático para tiempo real
- **FormsModule**: Formularios reactivos
- **Responsive**: Diseño adaptable móvil

## 🎨 Sistema de Eventos Preconfigurados

### Fútbol ⚽
- Gol, Tiro de Esquina, Tiro Libre, Penalti, Tarjeta Amarilla, Tarjeta Roja

### Baloncesto 🏀
- Canasta (2pts), Triple (3pts), Tiro Libre, Falta Personal, Falta Técnica

### Padel/Tenis 🎾
- Punto, Game, Set, Ace, Doble Falta

## 📊 Actualización Automática

El componente de tiempo real implementa **polling automático**:
- Intervalo: 3 segundos
- Se detiene cuando el partido finaliza
- Actualiza: tiempo, estado, periodo, puntuación

## 🔒 Seguridad (Pendiente)

Los endpoints actualmente NO tienen middleware de autenticación aplicado. Para producción agregar:

```typescript
// En app.js
import authenticate from '../../../middleware/authenticate.js';
import authorizeRole from '../../../middleware/authorizeRole.js';

app.use('/arbitro', authenticate, authorizeRole('arbitro'), eventosArbitro);
app.use('/admin', authenticate, authorizeRole('admin'), jugadoresAdmin);
```

## ⚡ Próximos Pasos

1. ✅ Agregar índices a la base de datos
2. ✅ Aplicar middleware de autenticación
3. ⬜ Implementar WebSocket para actualizaciones en tiempo real (Socket.IO)
4. ⬜ Agregar validaciones de request body (express-validator)
5. ⬜ Tests unitarios y de integración
6. ⬜ Documentación API con Swagger

## 🐛 Debugging

### Verificar conexión backend:
```bash
curl http://localhost:3005/client/eventos
```

### Ver logs del backend:
Los logs de errores aparecen en la consola donde ejecutaste `npm start`

### Verificar conexión base de datos:
```sql
SELECT * FROM configuracion_eventos_deporte;
SELECT * FROM partidos_torneo WHERE id_partido = 1;
```

## 📝 Notas Importantes

1. El **id_partido** debe existir en la tabla `partidos_torneo`
2. El **id_torneo** es necesario para ver la clasificación
3. Los **eventos** deben existir en `configuracion_eventos_deporte`
4. La **FK usa id_user** (no id_usuario) según corrección del usuario

## 🤝 Estructura de Respuestas

Todas las respuestas siguen el formato:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos */ }
}
```

Error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Error técnico"
}
```
