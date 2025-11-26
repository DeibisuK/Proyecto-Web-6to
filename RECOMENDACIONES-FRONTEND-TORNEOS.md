# 📋 RECOMENDACIONES FRONTEND - SISTEMA DE TORNEOS

## ✅ CAMBIOS REALIZADOS

### 1. **Eliminación de Filtros Duplicados**
- ❌ **ANTES**: Tabs de deportes en `torneo.html` + Filtros en sidebar = Duplicado
- ✅ **AHORA**: Solo filtros en sidebar con opción "Todos"
- **Beneficio**: UI más limpia, menos confusión para el usuario

### 2. **Filtro "Todos" Agregado**
```html
<!-- Ahora incluye botón "Todos" -->
<button class="filter-chip" [class.active]="selectedSport === null"(click)="filterBySport(null)">
  <span class="material-icons">grid_view</span>
  <span>Todos</span>
</button>
```

### 3. **Sidebar Fijo Verificado**
- El sidebar ya tiene `position: sticky` configurado correctamente
- Se mantiene visible durante el scroll
- `top: calc(140px + var(--spacing-xl))` ajusta posición bajo el header

### 4. **Reemplazo de Emojis**
- ✅ Ya usan Material Icons en lugar de emojis
- ✅ Iconos consistentes: `sports_soccer`, `sports_basketball`, `sports_tennis`

---

## 🚧 PENDIENTE DE IMPLEMENTAR

### 5. **Sistema de Equipos del Usuario**

#### Problema Actual:
```typescript
// En torneo.ts línea ~95
private loadEquipos(): void {
  this.equiposService.getEquiposUsuario().subscribe({
    next: (equipos) => {
      console.log('✅ Equipos cargados:', equipos);
      this.equiposDisponibles = equipos; // Trae TODOS los equipos
    }
  });
}
```

#### Solución Requerida:
El servicio debe filtrar por `id_usuario` del token JWT:

**Backend (equipos.service.ts en court-service):**
```javascript
// En court-service/src/controllers/equipo.controller.js
export const getEquiposPorUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id; // Del token JWT

    const query = `
      SELECT DISTINCT e.*
      FROM equipos e
      INNER JOIN jugadores_equipo je ON e.id_equipo = je.id_equipo
      WHERE je.id_usuario = $1
      AND e.estado = 'activo'
      ORDER BY e.nombre_equipo ASC
    `;

    const result = await pool.query(query, [id_usuario]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener equipos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};
```

**Ruta Nueva:**
```javascript
// court-service/src/api/client/equipo.routes.js
router.get('/mis-equipos', authenticate(), getEquiposPorUsuario);
```

**Frontend (equipos.service.ts):**
```typescript
getEquiposUsuario(): Observable<EquipoUsuario[]> {
  return this.http.get<EquipoUsuario[]>(`${this.apiUrl}/equipos/mis-equipos`);
}
```

---

## 📊 ANÁLISIS BACKEND COMPLETO

### Documentos Generados:
1. **ANALISIS-COMPLETO-BACKEND-TORNEOS.md** (12,000+ palabras)
2. **SCHEMA-BD-TORNEOS-COMPLETO.sql** (500+ líneas)
3. **PLAN-IMPLEMENTACION-PASO-A-PASO.md** (Código completo Fase 1)

### Ubicación:
```
OSC-Backend/docs/
├── ANALISIS-COMPLETO-BACKEND-TORNEOS.md
├── SCHEMA-BD-TORNEOS-COMPLETO.sql
└── PLAN-IMPLEMENTACION-PASO-A-PASO.md
```

---

## 🎯 RESUMEN EJECUTIVO BACKEND

### ✅ LO QUE FUNCIONA:
1. **Court Service**: CRUD completo de torneos, clasificaciones, filtros
2. **Buy Service**: Sistema de inscripciones con validaciones
3. **Match Service**: Gestión de partidos, árbitros, equipos_partido

### ❌ BLOQUEANTES CRÍTICOS:

#### 1. **NO EXISTE TABLA jugadores** ⚠️
```sql
-- URGENTE: Crear esta tabla
CREATE TABLE jugadores (
  id_jugador SERIAL PRIMARY KEY,
  id_equipo INTEGER REFERENCES equipos(id_equipo),
  id_usuario INTEGER REFERENCES usuarios(id_usuario),
  numero_camiseta INTEGER,
  posicion VARCHAR(50),
  es_capitan BOOLEAN DEFAULT false,
  fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'activo'
);
```

**Impacto**: Sin esto, no puedes:
- Validar inscripciones (mínimo jugadores)
- Mostrar "mis equipos" correctamente
- Gestionar plantillas
- Registrar goleadores/asistencias

#### 2. **NO EXISTE generación automática de partidos** ⚠️
```javascript
// NECESARIO: Algoritmo de fixture
export const generarPartidosFase = async (req, res) => {
  const { id_fase } = req.params;
  
  // 1. Obtener equipos de la fase
  // 2. Según tipo (grupos/eliminatoria):
  //    - Grupos: Round-robin
  //    - Eliminatoria: Single/Double elimination bracket
  // 3. Asignar canchas/horarios
  // 4. Crear registros en partidos_torneo
};
```

#### 3. **NO EXISTE panel de árbitros en tiempo real** ⚠️
```javascript
// NECESARIO: Endpoints para árbitros
router.put('/partidos/:id/evento', authenticate(), authorizeRole(['arbitro']), agregarEvento);
router.put('/partidos/:id/marcador', authenticate(), authorizeRole(['arbitro']), actualizarMarcador);
router.put('/partidos/:id/estado', authenticate(), authorizeRole(['arbitro']), cambiarEstado);
```

#### 4. **NO EXISTE sistema en tiempo real (WebSocket/SSE)** ⚠️
```javascript
// NECESARIO: Para actualizaciones live
import { Server } from 'socket.io';

io.on('connection', (socket) => {
  socket.on('join-match', (id_partido) => {
    socket.join(`match-${id_partido}`);
  });
});

// Emitir eventos
io.to(`match-${id_partido}`).emit('score-update', { 
  equipo1: 2, 
  equipo2: 1 
});
```

---

## 📅 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### **FASE 1: Sistema de Jugadores** (2-3 días) 🔴 CRÍTICO
```
1. Crear tabla jugadores en BD
2. Crear modelo jugadores en court-service
3. Crear endpoints CRUD jugadores
4. Actualizar endpoint /mis-equipos para validar jugadores
5. Frontend: Mostrar solo equipos del usuario
```

### **FASE 2: Generación de Partidos** (3-4 días) 🔴 CRÍTICO
```
1. Algoritmo round-robin para fase de grupos
2. Algoritmo single-elimination para knockout
3. Asignación automática de canchas/horarios
4. Endpoint POST /torneos/:id/generar-partidos
5. Frontend: Botón "Generar Fixture" en admin
```

### **FASE 3: Panel de Árbitros** (2-3 días) 🟡 IMPORTANTE
```
1. Crear rutas /arbitros/mis-partidos
2. Endpoints para actualizar marcador/eventos
3. Frontend: Nueva vista /arbitro/partido/:id
4. Interfaz para agregar goles/tarjetas/sustituciones
```

### **FASE 4: Tiempo Real** (3-4 días) 🟡 IMPORTANTE
```
1. Integrar Socket.IO en match-service
2. Eventos: score-update, event-added, match-status
3. Frontend: Conectar a WebSocket
4. Actualizar UI en tiempo real sin refresh
```

### **FASE 5: Historial y Estadísticas** (2-3 días) 🟢 DESEABLE
```
1. Vistas SQL para clasificación automática
2. Endpoint /torneos/:id/clasificacion
3. Endpoint /torneos/:id/goleadores
4. Frontend: Tabs de Clasificación/Goleadores
```

---

## 🔧 CAMBIOS EN BD RECOMENDADOS

### Tablas a CREAR:
```sql
-- 1. jugadores (CRÍTICO)
CREATE TABLE jugadores (...);

-- 2. eventos_partido (para tiempo real)
CREATE TABLE eventos_partido (
  id_evento SERIAL PRIMARY KEY,
  id_partido INTEGER REFERENCES partidos_torneo(id_partido),
  tipo_evento VARCHAR(50), -- 'gol', 'tarjeta_amarilla', etc.
  minuto INTEGER,
  id_jugador INTEGER REFERENCES jugadores(id_jugador),
  datos_extra JSONB
);

-- 3. sustituciones
CREATE TABLE sustituciones (
  id_sustitucion SERIAL PRIMARY KEY,
  id_partido INTEGER REFERENCES partidos_torneo(id_partido),
  id_jugador_sale INTEGER REFERENCES jugadores(id_jugador),
  id_jugador_entra INTEGER REFERENCES jugadores(id_jugador),
  minuto INTEGER
);
```

### Tablas a DEPRECAR:
```sql
-- Estas están en match-service pero NO se usan:
DROP TABLE IF EXISTS partidos; -- Usar partidos_torneo
DROP TABLE IF EXISTS equipos_partido; -- Usar equipos_fase
DROP TABLE IF EXISTS historial_partidos; -- Migrar a eventos_partido
DROP TABLE IF EXISTS gestion_tiempo_partido; -- Integrar en partidos_torneo
```

---

## 🚀 QUICK WINS (Implementar YA)

### 1. **Endpoint /mis-equipos** (30 minutos)
```javascript
// court-service/src/api/client/equipo.routes.js
router.get('/mis-equipos', authenticate(), async (req, res) => {
  const query = `
    SELECT DISTINCT e.*
    FROM equipos e
    INNER JOIN jugadores_equipo je ON e.id_equipo = je.id_equipo
    WHERE je.id_usuario = $1 AND e.estado = 'activo'
  `;
  const result = await pool.query(query, [req.user.id]);
  res.json(result.rows);
});
```

### 2. **Filtro por deporte funcional** (15 minutos)
```typescript
// dashboard-torneo.ts - Ya está implementado, solo activar
filterBySport(sport: string | null): void {
  this.selectedSport = this.selectedSport === sport ? null : sport;
  // Emitir evento o usar servicio compartido
  this.torneosService.filtroDeporte.next(sport);
}

// torneo.ts - Suscribirse
this.torneosService.filtroDeporte.subscribe(sport => {
  this.filtrarPorDeporte(sport);
});
```

### 3. **Validación de jugadores en inscripción** (20 minutos)
```typescript
// inscripciones.ts
validarEquipoCompleto(equipoId: number): boolean {
  // Llamar a backend: GET /equipos/:id/jugadores
  // Validar que tenga al menos X jugadores
  return jugadores.length >= minJugadores;
}
```

---

## 📈 MÉTRICAS DE ÉXITO

### Frontend:
- ✅ Eliminado código duplicado (tabs deportes)
- ✅ Sidebar fijo funcional
- ✅ Filtro "Todos" agregado
- ⏳ Mostrar solo equipos del usuario (Pendiente backend)

### Backend:
- ⏳ Tabla jugadores creada
- ⏳ Endpoint /mis-equipos implementado
- ⏳ Generación de partidos automática
- ⏳ Panel de árbitros funcional
- ⏳ Tiempo real con WebSocket

---

## 💡 RECOMENDACIONES FINALES

### 1. **Prioridad Inmediata**:
```
DÍA 1-2: Implementar Fase 1 (Sistema de Jugadores)
DÍA 3-5: Implementar Fase 2 (Generación de Partidos)
```

### 2. **Arquitectura**:
- Mantener microservicios actuales (court, buy, match)
- Agregar match-service WebSocket para tiempo real
- Usar Redis para cache de clasificaciones

### 3. **Testing**:
- Crear torneos de prueba con 4, 8, 16 equipos
- Validar fixture genera correctamente
- Probar inscripciones con jugadores

### 4. **Documentación**:
- Actualizar docs/ENDPOINTS-TORNEOS.md
- Documentar eventos WebSocket
- Crear guía para árbitros

---

## 📞 PRÓXIMOS PASOS

1. **Revisar** los 3 documentos generados en `OSC-Backend/docs/`
2. **Crear** tabla jugadores con el schema provisto
3. **Implementar** endpoint /mis-equipos (código incluido)
4. **Probar** que el filtro del sidebar funcione
5. **Continuar** con Fase 2 del plan de implementación

---

**Fecha**: Noviembre 23, 2025
**Estado**: ✅ Frontend optimizado | ⏳ Backend en progreso
**Siguientes**: Sistema de Jugadores + Generación de Partidos
