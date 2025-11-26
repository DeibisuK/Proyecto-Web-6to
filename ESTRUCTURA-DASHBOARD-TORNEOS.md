# 🏆 ESTRUCTURA DASHBOARD TORNEOS - DOCUMENTACIÓN

## 📁 Estructura de Componentes

```
dashboard-torneo/
├── dashboard-torneo.ts/html/css        → PADRE (Sidebar + Header)
├── torneo/                             → Lista de torneos disponibles
├── inscripciones/                      → Mis inscripciones
├── clasificacion/                      → Tabla de posiciones del torneo
├── detalle-partido/                    → Detalle individual de un partido
├── modals/
│   ├── torneo-quick-view-modal        → Vista rápida del torneo
│   └── inscripcion-modal              → Modal para inscribir equipo
├── services/
│   ├── torneos.service.ts             → API torneos
│   ├── inscripciones.service.ts       → API inscripciones
│   ├── partidos.service.ts            → API partidos
│   └── equipos.service.ts             → API equipos
└── models/
    └── torneo.models.ts               → Interfaces TypeScript
```

---

## 🔄 FLUJO DE NAVEGACIÓN

### 1. **Dashboard Torneo** (Componente Padre)
**Ruta**: `/dashboard-torneo`

**Función**:
- Sidebar con navegación y filtros por deporte
- Header con estadísticas del usuario
- Contiene `<router-outlet>` para los componentes hijos

**Filtros del Sidebar**:
```typescript
// Ahora funciona correctamente con BehaviorSubject
filterBySport(sport: string | null) {
  this.torneosService.setFiltroDeporte(sport); // ✅ Comunica al hijo
}
```

---

### 2. **Torneo** (Lista de Torneos)
**Ruta**: `/dashboard-torneo/torneos`

**Función**:
- Muestra cards de torneos disponibles
- Se suscribe al filtro de deporte del padre
- Botones de acción:
  - **Vista rápida**: Abre modal con info del torneo
  - **Ver clasificación**: Navega a `/clasificacion/:id`
  - **Click en card**: Navega a `/partido/:id` (detalle del torneo)

**Filtrado Ahora Funciona**:
```typescript
// ✅ ARREGLADO
ngOnInit() {
  this.torneosService.filtroDeporte$.subscribe(deporte => {
    this.deporteFiltrado = deporte;
    this.aplicarFiltros(); // Filtra: fútbol, basket, padel
  });
}

aplicarFiltros() {
  if (this.deporteFiltrado) {
    resultado = resultado.filter(t => 
      t.nombre_deporte.toLowerCase().includes(this.deporteFiltrado!)
    );
  }
}
```

**Estado Vacío**:
```html
<!-- Aparece cuando torneosFiltrados.length === 0 -->
<div class="empty-state-modern">
  <h3>No hay torneos disponibles</h3>
  <p>Por el momento no hay torneos con los filtros seleccionados</p>
</div>
```

---

### 3. **Inscripciones** (Mis Inscripciones)
**Ruta**: `/dashboard-torneo/inscripciones`

**Función**:
- Muestra torneos en los que el usuario está inscrito
- Tabs: Activas / Pendientes / Finalizadas
- Botón "Nueva Inscripción" abre modal

**Estado**:
- `activas`: Torneos en curso
- `pendientes`: Inscripciones sin confirmar
- `finalizadas`: Torneos terminados

---

### 4. **Clasificación** (Tabla de Posiciones)
**Ruta**: `/dashboard-torneo/clasificacion/:id_torneo`

**Función**:
- Muestra tabla de posiciones de un torneo específico
- Columnas: Posición, Equipo, PJ, PG, PE, PP, GF, GC, DG, Pts
- Se accede desde botón "Ver clasificación" en card de torneo

**Servicio**:
```typescript
getClasificacionTorneo(idTorneo: number): Observable<Clasificacion[]>
```

---

### 5. **Detalle Partido** (Info del Partido)
**Ruta**: `/dashboard-torneo/partido/:id_torneo`

**Función**:
- Muestra lista de partidos del torneo
- Información de equipos, resultado, fecha
- Estado: Programado / En curso / Finalizado

**Servicio**:
```typescript
getPartidosPorTorneo(idTorneo: number): Observable<Partido[]>
```

---

## 🎯 MODALES

### **1. Torneo Quick View Modal**
**Trigger**: Botón "Vista rápida" en card de torneo

**Contenido**:
- Información completa del torneo
- Equipos inscritos
- Fechas
- Botón "Inscribirme" → Abre Modal de Inscripción

### **2. Inscripción Modal**
**Trigger**: 
- Botón "Inscribirme" desde Quick View
- Botón "Nueva Inscripción" en sidebar

**Contenido**:
- Lista de equipos del usuario
- Seleccionar equipo para inscribir
- Validaciones (cupos, fechas, etc.)

**Props**:
```typescript
@Input() torneo: TorneoModel;
@Input() equiposDisponibles: EquipoUsuario[];
@Output() inscripcionExitosa: EventEmitter<any>;
```

---

## 🔧 CAMBIOS REALIZADOS HOY

### ✅ 1. **Filtro por Deporte Funciona**
**Antes**: 
```typescript
❌ dashboard-torneo cambiaba selectedSport
❌ torneo NO recibía el cambio
❌ Seguían mostrando todos los torneos
```

**Ahora**:
```typescript
✅ BehaviorSubject en TorneosService
✅ dashboard-torneo llama setFiltroDeporte()
✅ torneo se suscribe a filtroDeporte$
✅ aplicarFiltros() filtra por nombre_deporte
```

### ✅ 2. **Mensaje de Estado Vacío**
Ya existe en el HTML:
```html
<div class="empty-state-modern" *ngIf="torneosFiltrados.length === 0">
  <h3>No hay torneos disponibles</h3>
</div>
```

### ✅ 3. **Comunicación Padre → Hijo**
```
dashboard-torneo (sidebar filter)
    ↓
TorneosService.setFiltroDeporte()
    ↓
BehaviorSubject emite valor
    ↓
torneo.ts se suscribe
    ↓
aplicarFiltros() ejecuta
    ↓
torneosFiltrados actualizado
```

---

## 🚀 FUNCIONALIDADES COMPLETAS

### **Navegación**:
- ✅ Sidebar con filtros por deporte (Todos, Fútbol, Padel, Basket)
- ✅ Navegación entre Torneos / Inscripciones
- ✅ Click en torneo → Ver partidos
- ✅ "Ver clasificación" → Tabla de posiciones

### **Filtros**:
- ✅ Filtro por deporte (sidebar)
- ✅ Filtro por estado (Todos, En Curso, Abierto, Finalizado)
- ✅ Estado vacío cuando no hay resultados

### **Inscripciones**:
- ✅ Modal para inscribir equipos
- ✅ Lista de equipos del usuario
- ✅ Validación de cupos

### **Información**:
- ✅ Cards de torneos con datos completos
- ✅ Vista rápida en modal
- ✅ Clasificación del torneo
- ✅ Detalle de partidos

---

## 📋 PENDIENTE DE IMPLEMENTAR

### 1. **Equipos del Usuario** ⏳
Actualmente trae TODOS los equipos. Debe filtrar solo del usuario:

**Backend necesario**:
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

### 2. **Actualización en Tiempo Real** ⏳
Para mostrar resultados de partidos en vivo:

**Backend necesario**:
```javascript
// match-service con Socket.IO
io.to(`match-${id_partido}`).emit('score-update', { 
  equipo1: 2, 
  equipo2: 1 
});
```

**Frontend**:
```typescript
// En detalle-partido.ts
this.socketService.onScoreUpdate(id_partido).subscribe(score => {
  this.actualizarMarcador(score);
});
```

### 3. **Generación Automática de Fixture** ⏳
Ver documento: `OSC-Backend/docs/PLAN-IMPLEMENTACION-PASO-A-PASO.md`

---

## 🔍 TESTING

### **Prueba el Filtro**:
1. Ve a `/dashboard-torneo/torneos`
2. Click en "Basket" en el sidebar
3. Solo debe mostrar torneos de baloncesto
4. Si no hay, debe mostrar mensaje de estado vacío

### **Prueba la Inscripción**:
1. Click en card de torneo → Abre modal Quick View
2. Click "Inscribirme" → Abre modal de inscripción
3. Selecciona un equipo → Confirmar

### **Prueba la Clasificación**:
1. Click en "Ver clasificación" en card
2. Debe navegar a `/clasificacion/:id`
3. Muestra tabla de posiciones

---

## 📞 ARQUITECTURA DE SERVICIOS

```typescript
// TorneosService
- getTorneosPublicos()          → Lista torneos
- getClasificacionTorneo()      → Tabla posiciones
- getPartidosPorTorneo()        → Partidos del torneo
- setFiltroDeporte()            → ✅ NUEVO: Comunicación
- filtroDeporte$                → ✅ NUEVO: Observable

// InscripcionesService
- getMisInscripciones()         → Torneos inscritos
- inscribirEquipo()             → Crear inscripción

// EquiposService
- getEquiposUsuario()           → ⏳ Debe filtrar por usuario

// PartidosService
- getDetallePartido()           → Info completa partido
```

---

## 🎨 ESTILOS

Todos los componentes usan:
- `shared-styles.css` → Estilos comunes
- Componente-específico `.css` → Estilos propios

Variables CSS:
```css
--color-accent: #10b981;
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #0f172a;
```

---

**Fecha**: Noviembre 23, 2025  
**Estado**: ✅ Filtros funcionando | ✅ Comunicación padre-hijo | ⏳ Backend en progreso
