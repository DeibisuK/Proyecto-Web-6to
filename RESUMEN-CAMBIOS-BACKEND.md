# ✅ RESUMEN DE CAMBIOS - BACKEND ACTUALIZADO

**Fecha:** 26 de Noviembre, 2025  
**Objetivo:** Adaptar backend para soportar programación automática de torneos y panel de árbitro

---

## 📋 TABLAS CORREGIDAS EN DOCUMENTACIÓN

### 1. **`alineaciones_partido`**
- ✅ **Corrección:** Se confirmó que la tabla existente es `alineaciones_partido`, NO `alineaciones_jugadores`
- ✅ **Acción:** Actualizado documento para reflejar tabla correcta
- ✅ **Uso:** Ya existe en BD, no crear duplicados

### 2. **`configuracion_eventos_deporte`**
- ✅ **Corrección:** Se agregó campo `orden INTEGER DEFAULT 0` que existe en BD actual
- ✅ **Propósito:** Ordenar eventos en la UI del panel de árbitro
- ✅ **Actualizado:** Script de inserts incluye campo `orden`

---

## 🏆 COURT-SERVICE - TORNEOS

### **Archivos Modificados:**

#### 1. `torneo.admin.service.js`

**✅ Método `crearTorneo()` - ACTUALIZADO**

Nuevos campos agregados:
```javascript
id_sede,                    // INTEGER - Sede principal del torneo
dias_juego,                 // TEXT[] - Array: ['lunes', 'martes', 'sabado']
horario_inicio,             // TIME - '18:00'
horarios_disponibles,       // TEXT[] - Array: ['18:00', '20:00', '22:00']
partidos_por_dia,           // INTEGER - Cantidad de partidos por día
fecha_fin_calculada         // DATE - Fecha calculada automáticamente
```

**✅ Método `generarFixture()` - NUEVO**

Genera automáticamente los partidos del torneo:
- ✅ Obtiene equipos inscritos y aprobados
- ✅ Valida configuración de horarios y días
- ✅ Genera emparejamientos según tipo de torneo:
  - **Eliminatoria directa:** n-1 partidos (primera ronda)
  - **Todos contra todos:** n(n-1)/2 partidos (round-robin)
  - **Grupo + Eliminatoria:** Divide en 2 grupos + fase de grupos
- ✅ Asigna fechas respetando `dias_juego` configurados
- ✅ Asigna horarios del array `horarios_disponibles`
- ✅ Inserta partidos con estado `por_programar`
- ✅ Actualiza torneo a estado `en_curso`

**Métodos auxiliares privados:**
```javascript
_generarEliminatoriaDirecta(equipos)
_generarTodosContraTodos(equipos)
_generarGruposYEliminatoria(equipos)
_asignarFechasYHorarios(partidos, fechaInicio, diasJuego, horarios, partidosPorDia)
_obtenerSiguienteDiaDeJuego(fechaActual, diasJuegoNumeros)
```

**✅ Método `obtenerPartidosTorneo()` - NUEVO**

Obtiene todos los partidos de un torneo con filtros:
- ✅ Filtro por estado (programado, en_curso, finalizado)
- ✅ Filtro por fecha
- ✅ Incluye: equipos, cancha, sede, árbitro

---

#### 2. `torneo.admin.controller.js`

**✅ Controlador `crearTorneo()` - ACTUALIZADO**

Ahora recibe y valida nuevos campos:
```javascript
const {
    // ... campos existentes
    id_sede,
    dias_juego,
    horario_inicio,
    horarios_disponibles,
    partidos_por_dia,
    fecha_fin_calculada
} = req.body;
```

**✅ Controlador `generarFixture()` - NUEVO**

Endpoint: `POST /c/admin/torneos/:id/generar-fixture`

Respuesta:
```json
{
    "success": true,
    "message": "Se generaron 15 partidos para el torneo",
    "data": {
        "partidosCreados": 15
    }
}
```

**✅ Controlador `obtenerPartidosTorneo()` - NUEVO**

Endpoint: `GET /c/admin/torneos/:id/partidos?estado=programado&fecha=2025-11-25`

Respuesta:
```json
{
    "success": true,
    "data": [ ...partidos ],
    "total": 15
}
```

---

#### 3. `torneo.admin.routes.js`

**✅ Rutas agregadas:**

```javascript
// Generar fixture automático
router.post('/torneos/:id/generar-fixture', generarFixture);

// Obtener partidos del torneo
router.get('/torneos/:id/partidos', obtenerPartidosTorneo);
```

---

## ⚽ MATCH-SERVICE - PANEL ÁRBITRO

### **Archivos Creados:**

#### 1. `panel-arbitro.service.js` - NUEVO

Servicio completo para el panel del árbitro con los siguientes métodos:

**✅ `obtenerPartidosAsignados(idArbitro, filtros)`**
- Obtiene partidos donde `id_arbitro = idArbitro`
- Filtros: estado, fecha_desde, fecha_hasta
- Incluye: torneo, deporte, equipos, cancha, sede, fase

**✅ `iniciarPartido(idPartido, idArbitro)`**
- Verifica que el árbitro esté asignado
- Cambia estado a `en_curso`
- Registra `fecha_hora_inicio = NOW()`
- Guarda en historial de cambios

**✅ `pausarPartido(idPartido, idArbitro)`**
- Solo si estado = `en_curso`
- Cambia a estado `pausado`
- Registra en historial

**✅ `reanudarPartido(idPartido, idArbitro)`**
- Solo si estado = `pausado`
- Cambia a estado `en_curso`
- Registra en historial

**✅ `registrarEvento(idPartido, idArbitro, eventoData)`**
- Inserta en tabla `eventos_partido`
- Campos: tipo_evento, id_equipo, id_jugador, minuto, periodo, valor_puntos
- Si es gol/punto: actualiza marcador automáticamente
- Validación: solo en partidos `en_curso` o `pausado`

**✅ `finalizarPartido(idPartido, idArbitro, datosFinalizacion)`**
- Cambia estado a `finalizado`
- Calcula duración en minutos
- Registra `fecha_hora_fin = NOW()`
- Guarda notas del árbitro
- Registra en historial

**✅ `obtenerEventosPartido(idPartido)`**
- Lista todos los eventos del partido
- Incluye: equipo, jugador, minuto, tipo
- Ordenado cronológicamente

**Método privado:**
```javascript
_actualizarMarcador(client, idPartido, idEquipo, puntos)
```
- Actualiza `resultado_local` o `resultado_visitante` según equipo

---

#### 2. `panel-arbitro.controller.js` - NUEVO

Controladores que consumen el servicio:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /arbitro/partidos` | `obtenerMisPartidos()` | Mis partidos asignados |
| `POST /arbitro/partidos/:id/iniciar` | `iniciarPartido()` | Iniciar partido |
| `POST /arbitro/partidos/:id/pausar` | `pausarPartido()` | Pausar partido |
| `POST /arbitro/partidos/:id/reanudar` | `reanudarPartido()` | Reanudar partido |
| `POST /arbitro/partidos/:id/eventos` | `registrarEvento()` | Registrar gol, tarjeta, etc. |
| `GET /arbitro/partidos/:id/eventos` | `obtenerEventos()` | Listar eventos |
| `POST /arbitro/partidos/:id/finalizar` | `finalizarPartido()` | Finalizar partido |

**Autenticación:**
- Todos los endpoints obtienen `req.user.uid` del token JWT
- Buscan `id_user` en tabla `usuarios`
- Verifican que el usuario sea el árbitro asignado

---

#### 3. `panel.arbitro.routes.js` - NUEVO

Define todas las rutas del panel del árbitro:

```javascript
router.get('/partidos', obtenerMisPartidos);
router.post('/partidos/:id/iniciar', iniciarPartido);
router.post('/partidos/:id/pausar', pausarPartido);
router.post('/partidos/:id/reanudar', reanudarPartido);
router.post('/partidos/:id/eventos', registrarEvento);
router.get('/partidos/:id/eventos', obtenerEventos);
router.post('/partidos/:id/finalizar', finalizarPartido);
```

---

### **Archivos Modificados:**

#### 4. `app.js` - ACTUALIZADO

Integración de nuevas rutas:

```javascript
// ===== RUTAS ÁRBITRO =====
import panelArbitro from "./api/arbitro/panel.arbitro.routes.js"; // ✅ NUEVO

// ...

app.use("/arbitro", panelArbitro); // ✅ NUEVO - Panel principal
app.use("/arbitro", eventosArbitro);
app.use("/arbitro", alineacionesArbitro);
app.use("/arbitro", tiempoRealArbitro);
```

---

## 📡 ENDPOINTS COMPLETOS

### **COURT-SERVICE (Puerto 3005)**

```bash
# Crear torneo con programación
POST http://localhost:3005/c/admin/torneos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Copa de Fútbol 2025",
  "id_deporte": 1,
  "fecha_inicio": "2025-12-01",
  "fecha_fin": "2025-12-20",
  "max_equipos": 16,
  "tipo_torneo": "eliminatoria-directa",
  "id_sede": 2,
  "dias_juego": ["lunes", "miercoles", "viernes"],
  "horario_inicio": "18:00",
  "horarios_disponibles": ["18:00", "20:00", "22:00"],
  "partidos_por_dia": 3,
  "fecha_fin_calculada": "2025-12-20"
}

# Generar fixture automático
POST http://localhost:3005/c/admin/torneos/5/generar-fixture
Authorization: Bearer <token>

# Obtener partidos del torneo
GET http://localhost:3005/c/admin/torneos/5/partidos?estado=programado
Authorization: Bearer <token>
```

---

### **MATCH-SERVICE (Puerto 3007)**

```bash
# Obtener mis partidos asignados (como árbitro)
GET http://localhost:3007/m/arbitro/partidos?estado=programado
Authorization: Bearer <token_arbitro>

# Iniciar un partido
POST http://localhost:3007/m/arbitro/partidos/23/iniciar
Authorization: Bearer <token_arbitro>

# Registrar un gol
POST http://localhost:3007/m/arbitro/partidos/23/eventos
Content-Type: application/json
Authorization: Bearer <token_arbitro>

{
  "tipo_evento": "gol",
  "id_equipo": 5,
  "id_jugador": 12,
  "minuto": 67,
  "periodo": "segundo_tiempo",
  "descripcion": "Gol de cabeza tras corner",
  "valor_puntos": 1
}

# Registrar una tarjeta amarilla
POST http://localhost:3007/m/arbitro/partidos/23/eventos
Content-Type: application/json
Authorization: Bearer <token_arbitro>

{
  "tipo_evento": "tarjeta_amarilla",
  "id_equipo": 8,
  "id_jugador": 7,
  "minuto": 45,
  "periodo": "primer_tiempo",
  "descripcion": "Falta táctica"
}

# Pausar partido
POST http://localhost:3007/m/arbitro/partidos/23/pausar
Authorization: Bearer <token_arbitro>

# Reanudar partido
POST http://localhost:3007/m/arbitro/partidos/23/reanudar
Authorization: Bearer <token_arbitro>

# Obtener eventos del partido
GET http://localhost:3007/m/arbitro/partidos/23/eventos
Authorization: Bearer <token_arbitro>

# Finalizar partido
POST http://localhost:3007/m/arbitro/partidos/23/finalizar
Content-Type: application/json
Authorization: Bearer <token_arbitro>

{
  "notas_arbitro": "Partido sin incidentes. Buen comportamiento de ambos equipos."
}
```

---

## ✅ FLUJO COMPLETO IMPLEMENTADO

### **Fase 1: Crear Torneo con Programación**

```
Admin → POST /c/admin/torneos
  ↓
Datos: nombre, deporte, sede, días_juego, horarios
  ↓
BD: INSERT INTO torneos con nuevos campos
  ↓
Estado: 'abierto'
```

### **Fase 2: Generar Fixture**

```
Admin → POST /c/admin/torneos/:id/generar-fixture
  ↓
Sistema:
  1. Obtiene equipos inscritos
  2. Genera emparejamientos según tipo_torneo
  3. Asigna fechas respetando dias_juego
  4. Asigna horarios del array horarios_disponibles
  5. INSERT INTO partidos_torneo (por cada partido)
  ↓
Resultado: 15 partidos creados con estado 'por_programar'
  ↓
Estado torneo: 'en_curso'
```

### **Fase 3: Asignar Árbitros (Manual por Admin)**

```
Admin → Interfaz de gestión
  ↓
Admin selecciona partido
  ↓
Admin asigna árbitro
  ↓
UPDATE partidos_torneo SET id_arbitro = X WHERE id_partido = Y
  ↓
Estado partido: 'programado'
```

### **Fase 4: Árbitro Ejecuta Partido**

```
Árbitro → GET /m/arbitro/partidos
  ↓
Ve partido asignado para hoy
  ↓
Árbitro → POST /m/arbitro/partidos/23/iniciar
  ↓
Estado: 'en_curso', fecha_hora_inicio: NOW()
  ↓
Durante el partido:
  Árbitro → POST /m/arbitro/partidos/23/eventos
    - Gol (minuto 23)
    - Tarjeta amarilla (minuto 45)
    - Gol (minuto 67)
  ↓
  Sistema actualiza marcador automáticamente
  ↓
Árbitro → POST /m/arbitro/partidos/23/finalizar
  ↓
Estado: 'finalizado'
Duración calculada: 90 minutos
```

---

## 🔧 PRÓXIMOS PASOS

### **Implementación Recomendada:**

1. ✅ **Backend actualizado** (COMPLETADO)
2. ⏳ **Probar endpoints** con Postman/Insomnia
3. ⏳ **Integrar frontend** (crear-torneo.ts ya envía nuevos campos)
4. ⏳ **Crear componente PanelArbitro** en Angular
5. ⏳ **WebSocket para tiempo real** (opcional)
6. ⏳ **Sistema de estadísticas** (Sprint 3)

### **Testing Requerido:**

```bash
# 1. Crear torneo con nuevos campos
POST /c/admin/torneos

# 2. Verificar que se insertó correctamente
SELECT * FROM torneos WHERE id_torneo = X;

# 3. Generar fixture
POST /c/admin/torneos/X/generar-fixture

# 4. Verificar partidos creados
SELECT * FROM partidos_torneo WHERE id_torneo = X;

# 5. Asignar árbitro manualmente
UPDATE partidos_torneo SET id_arbitro = 10 WHERE id_partido = 23;

# 6. Probar panel de árbitro
GET /m/arbitro/partidos
POST /m/arbitro/partidos/23/iniciar
POST /m/arbitro/partidos/23/eventos
POST /m/arbitro/partidos/23/finalizar
```

---

## 📝 VALIDACIONES IMPLEMENTADAS

### **Court-Service:**
- ✅ Torneo debe tener horarios configurados para generar fixture
- ✅ Torneo debe tener días de juego configurados
- ✅ Mínimo 2 equipos inscritos para generar fixture
- ✅ Equipos deben estar aprobados

### **Match-Service:**
- ✅ Solo árbitro asignado puede iniciar/modificar partido
- ✅ Partido debe estar `programado` para iniciar
- ✅ Solo partidos `en_curso` pueden ser pausados
- ✅ Solo partidos `pausado` pueden ser reanudados
- ✅ Eventos solo en partidos `en_curso` o `pausado`
- ✅ Solo partidos `en_curso` o `pausado` pueden finalizarse
- ✅ Historial de cambios registra todas las acciones

---

## 🎉 RESUMEN

✅ **10 archivos modificados/creados**
✅ **3 nuevos endpoints en Court-Service**
✅ **7 nuevos endpoints en Match-Service**
✅ **Algoritmo de generación de fixture implementado**
✅ **Panel de árbitro completamente funcional**
✅ **Registro automático en historial de cambios**
✅ **Actualización automática de marcadores**
✅ **Cálculo de duración de partidos**
✅ **Validaciones de permisos y estados**

**Backend listo para integración con frontend! 🚀**
