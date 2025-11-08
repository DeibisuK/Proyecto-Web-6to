# Integración del Componente Inscripciones

## ✅ Cambios Realizados

### 1. **inscripciones.ts** - Integración con Servicios Reales

#### Imports Agregados
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { InscripcionesService } from '../services/inscripciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Inscripcion } from '../models/torneo.models';
```

#### Propiedades del Componente
- **Eliminado:** Mock data de inscripciones hardcodeadas
- **Agregado:**
  - `inscripciones: Inscripcion[]` - Array vacío que se llena desde el backend
  - `error: string | null` - Para manejar errores
  - Servicios inyectados: `InscripcionesService`, `AuthService`, `Router`

#### Métodos Implementados

##### loadInscripciones()
```typescript
loadInscripciones(): void {
  const user = this.authService.currentUser;
  if (!user?.uid) {
    this.error = 'Usuario no autenticado';
    return;
  }
  
  this.inscripcionesService.getInscripcionesUsuario(user.uid).subscribe({
    next: (inscripciones) => {
      this.inscripciones = inscripciones;
      this.isLoading = false;
    },
    error: (error) => {
      this.error = 'Error al cargar las inscripciones';
      this.isLoading = false;
    }
  });
}
```

##### getFilteredInscripciones()
- **Antes:** Lógica manual con statusMap
- **Ahora:** Usa `inscripcionesService.filtrarPorEstado()`

##### getActiveCount() y getPendingCount()
- **Antes:** Filtrado manual con `.filter()`
- **Ahora:** Usa `inscripcionesService.contarPorEstado().activas/pendientes`

##### getStatusBadgeClass()
Actualizado para usar estados del backend:
- `'confirmada'` → `'badge-success'` (ACTIVA)
- `'pendiente'` → `'badge-warning'` (PENDIENTE)
- `'cancelada'` → `'badge-info'` (CANCELADA)
- `'finalizado'` → `'badge-info'` (FINALIZADA)

##### openNewInscriptionWizard()
```typescript
openNewInscriptionWizard(): void {
  this.router.navigate(['/client/reservas/dashboard-torneo/torneo']);
}
```
Navega a la lista de torneos para seleccionar uno.

##### viewDetails()
```typescript
viewDetails(inscripcion: Inscripcion): void {
  this.router.navigate(['/client/reservas/dashboard-torneo/torneo', inscripcion.id_torneo]);
}
```
Navega al detalle del torneo.

##### cancelInscription()
```typescript
cancelInscription(inscripcion: Inscripcion, event: Event): void {
  event.stopPropagation();
  
  // Verificar regla de 24 horas
  if (!this.inscripcionesService.puedeCancelar(inscripcion)) {
    alert('Solo se permiten cancelaciones con al menos 24 horas de anticipación.');
    return;
  }

  // Confirmar con el usuario
  if (!confirm(`¿Cancelar inscripción a "${inscripcion.torneo_nombre}"?`)) {
    return;
  }

  // Llamar al servicio
  this.inscripcionesService.cancelarInscripcion(inscripcion.id_inscripcion).subscribe({
    next: () => {
      alert('Inscripción cancelada exitosamente');
      this.loadInscripciones(); // Recargar lista
    },
    error: (error) => {
      alert('Error al cancelar la inscripción');
    }
  });
}
```

##### Nuevos Métodos Helper
```typescript
getProgreso(inscripcion: Inscripcion): number {
  return this.inscripcionesService.calcularProgresoTorneo(inscripcion);
}

getProximoPartidoFecha(inscripcion: Inscripcion): string {
  return this.inscripcionesService.formatearFechaProximoPartido(inscripcion);
}

puedeCancelar(inscripcion: Inscripcion): boolean {
  return this.inscripcionesService.puedeCancelar(inscripcion);
}
```

---

### 2. **inscripciones.html** - Actualización para Modelo Real

#### Header de Inscripción

##### Antes:
```html
<div class="tournament-icon">{{ inscripcion.icon }}</div>
<h3>{{ inscripcion.tournament }}</h3>
<p>{{ inscripcion.category }}</p>
<span [ngClass]="getStatusBadgeClass(inscripcion.status)">
```

##### Ahora:
```html
<div class="tournament-icon">
  <img [src]="inscripcion.torneo_imagen || inscripcion.deporte_imagen" 
       [alt]="inscripcion.nombre_deporte"
       onerror="this.src='assets/img/default-sport.png'">
</div>
<h3>{{ inscripcion.torneo_nombre }}</h3>
<p>{{ inscripcion.nombre_deporte }}</p>
<span [ngClass]="getStatusBadgeClass(inscripcion.estado_inscripcion)">
  {{ getStatusText(inscripcion.estado_inscripcion) }}
</span>
```

#### Body de Inscripción - Info Grid

##### Campos Actualizados:

1. **Fecha de Inicio**
   - Antes: `{{ inscripcion.startDate }}`
   - Ahora: `{{ inscripcion.fecha_inicio | date: 'dd MMM yyyy' }}`

2. **Participantes** → **Equipo**
   - Antes: `{{ inscripcion.participants }} / {{ inscripcion.maxParticipants }}`
   - Ahora: `{{ inscripcion.nombre_equipo }}`

3. **Ubicación** → **Grupo**
   - Antes: `{{ inscripcion.location }}`
   - Ahora: `{{ inscripcion.nombre_grupo }}` (solo si existe)

4. **Precio** → **Monto Pagado**
   - Antes: `${{ inscripcion.price }}`
   - Ahora: `${{ inscripcion.monto_pagado }}`

##### Nuevos Campos Agregados:

5. **Premio del Torneo**
   ```html
   <div class="info-item" *ngIf="inscripcion.premio">
     <span class="info-label">Premio</span>
     <span class="info-value">${{ inscripcion.premio }}</span>
   </div>
   ```

6. **Próximo Partido**
   ```html
   <div class="info-item" *ngIf="inscripcion.proximo_partido">
     <span class="info-label">Próximo Partido</span>
     <span class="info-value">{{ getProximoPartidoFecha(inscripcion) }}</span>
   </div>
   ```

#### Barra de Progreso

##### Antes:
```html
<div *ngIf="inscripcion.status === 'activa' && inscripcion.progress !== undefined">
  <span>{{ inscripcion.progress }}%</span>
  <div [style.width.%]="inscripcion.progress"></div>
</div>
```

##### Ahora:
```html
<div *ngIf="inscripcion.estado_inscripcion === 'confirmada' && inscripcion.torneo_estado !== 'finalizado'">
  <span>{{ getProgreso(inscripcion) }}%</span>
  <div [style.width.%]="getProgreso(inscripcion)"></div>
</div>
```

#### Botón de Cancelar

##### Antes:
```html
<button 
  *ngIf="inscripcion.status === 'pendiente'"
  (click)="cancelInscription(inscripcion)">
  Cancelar
</button>
```

##### Ahora:
```html
<button 
  *ngIf="inscripcion.estado_inscripcion === 'confirmada' && puedeCancelar(inscripcion)"
  (click)="cancelInscription(inscripcion, $event)">
  Cancelar
</button>
```
- Solo se muestra si está confirmada Y se puede cancelar (24h antes)
- Recibe el evento para `stopPropagation()`

---

### 3. **inscripciones.css** - Actualización de Estilos

#### Antes:
```css
.tournament-icon {
  font-size: 1.75rem;
}
```

#### Ahora:
```css
.tournament-icon {
  overflow: hidden;
}

.tournament-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```
- Cambiado de mostrar emoji a mostrar imagen
- Aplicado `object-fit: cover` para mantener aspecto

---

## 🔄 Flujo de Datos

### Carga Inicial
```
ngOnInit()
  → loadInscripciones()
    → authService.currentUser (obtener UID)
    → inscripcionesService.getInscripcionesUsuario(uid)
      → HTTP GET /b/inscripcion/usuario/:uid
      → Backend query con JOINs (torneo, equipo, deporte, próximo partido)
      → Respuesta con array de Inscripcion[]
    → this.inscripciones = response
    → isLoading = false
```

### Filtrado por Tabs
```
Usuario click tab "Activas"
  → setActiveTab('activas')
  → getFilteredInscripciones()
    → inscripcionesService.filtrarPorEstado(inscripciones, 'activas')
      → Filtra por estado_inscripcion === 'confirmada' && torneo_estado !== 'finalizado'
    → Return inscripciones filtradas
```

### Cancelación de Inscripción
```
Usuario click "Cancelar"
  → cancelInscription(inscripcion, event)
    → Verificar puedeCancelar() (24 horas antes)
    → Mostrar confirmación
    → inscripcionesService.cancelarInscripcion(id)
      → HTTP DELETE /b/inscripcion/:id
      → Backend verifica propiedad del equipo
      → Backend verifica política de 24 horas
      → Backend actualiza estado a 'cancelada'
    → Mostrar mensaje de éxito
    → loadInscripciones() (recargar lista)
```

---

## 📊 Mapeo de Propiedades

### Modelo Mock (Antes) vs. Modelo Real (Ahora)

| Mock Property | Real Property | Tipo | Notas |
|---------------|---------------|------|-------|
| `id` | `id_inscripcion` | number | ID de la inscripción |
| `tournament` | `torneo_nombre` | string | Nombre del torneo |
| `category` | `nombre_deporte` | string | Deporte del torneo |
| `icon` | `torneo_imagen` / `deporte_imagen` | string | URL de imagen |
| `status` | `estado_inscripcion` | 'pendiente' \| 'confirmada' \| 'cancelada' | Estado de inscripción |
| `startDate` | `fecha_inicio` | string | Fecha ISO formateada |
| `participants` | ❌ | - | Eliminado |
| `maxParticipants` | ❌ | - | Eliminado |
| `location` | ❌ | - | Eliminado |
| `price` | `monto_pagado` | string | Monto real pagado |
| `progress` | Calculado | number | `calcularProgresoTorneo()` |
| ❌ | `nombre_equipo` | string | **Nuevo:** Nombre del equipo inscrito |
| ❌ | `equipo_logo` | string | **Nuevo:** Logo del equipo |
| ❌ | `nombre_grupo` | string | **Nuevo:** Grupo asignado |
| ❌ | `premio` | string | **Nuevo:** Premio del torneo |
| ❌ | `proximo_partido` | ProximoPartido | **Nuevo:** Datos del próximo partido |
| ❌ | `torneo_estado` | EstadoTorneo | **Nuevo:** Estado del torneo |

---

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
1. **Carga de inscripciones** desde el backend por UID del usuario
2. **Filtrado por estado** usando servicio (activas/pendientes/finalizadas)
3. **Contadores en tabs** con lógica del servicio
4. **Navegación a torneos** para crear nueva inscripción
5. **Navegación a detalles** del torneo
6. **Cancelación de inscripciones** con validación de 24 horas
7. **Confirmación de cancelación** con diálogo nativo
8. **Recarga automática** después de cancelar
9. **Barra de progreso** calculada dinámicamente
10. **Información de próximo partido** si existe
11. **Badges de estado** con colores dinámicos
12. **Manejo de errores** con mensajes al usuario
13. **Estados vacíos** personalizados por tab
14. **Skeleton loader** durante la carga

### ⏳ Pendientes
1. Implementar **modales personalizados** en lugar de `alert()` y `confirm()`
2. Implementar **toast notifications** para mensajes de éxito/error
3. Agregar **animaciones** para transiciones
4. Implementar **lazy loading** de imágenes
5. Agregar **filtros adicionales** (por deporte, fecha, etc.)
6. Implementar **búsqueda** de inscripciones
7. Agregar **paginación** si hay muchas inscripciones

---

## 🔌 Integración con Backend

### Endpoints Utilizados

1. **GET** `/b/inscripcion/usuario/:uid`
   - Retorna todas las inscripciones del usuario
   - Incluye JOINs con torneos, equipos, deportes, partidos
   - Response: `Inscripcion[]`

2. **DELETE** `/b/inscripcion/:id`
   - Cancela una inscripción
   - Valida propiedad del equipo
   - Valida política de 24 horas
   - Response: `{ message: string }`

### Validaciones del Backend
- ✅ Usuario autenticado (JWT)
- ✅ Equipo pertenece al usuario (UID en tabla equipos)
- ✅ Cancelación permitida (>24h antes del inicio)
- ✅ Estado de inscripción válido

---

## 🎨 Mejoras de UI/UX

### Antes (Mock):
- Emoji estático `{{ inscripcion.icon }}`
- Datos hardcodeados
- Sin validación de cancelación
- Sin información de próximo partido
- Progress hardcodeado

### Ahora (Real):
- Imagen dinámica con fallback
- Datos reales del backend
- Validación de 24 horas antes de cancelar
- Información del próximo partido si existe
- Progress calculado según fechas del torneo
- Estados personalizados por tipo de inscripción

---

## 📝 Próximos Pasos Sugeridos

1. **Crear componente de modal personalizado** para reemplazar `alert()` y `confirm()`
2. **Implementar servicio de notificaciones** (toasts)
3. **Crear componente de detalle de inscripción** con más información
4. **Agregar botón de "Ver Clasificación"** si el torneo está en curso
5. **Implementar chat del equipo** desde la inscripción
6. **Agregar calendario de partidos** por inscripción
7. **Mostrar estadísticas del equipo** en el torneo

---

## ✨ Resumen

**Archivos modificados:** 3
- `inscripciones.ts` - ~210 líneas (era ~181)
- `inscripciones.html` - ~178 líneas (sin cambios en cantidad, pero contenido actualizado)
- `inscripciones.css` - ~380 líneas (+7 líneas para imágenes)

**Funcionalidades agregadas:** 14
**Endpoints integrados:** 2
**Métodos del servicio usados:** 6
**Estados de compilación:** ✅ Sin errores

El componente de Inscripciones está completamente integrado con el backend y listo para usar en producción. 🚀
