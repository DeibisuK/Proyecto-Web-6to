# Guía de Uso de Modales - Dashboard Torneos

## 📋 Resumen

Sistema de modales implementado para mejorar la UX del dashboard de torneos, reemplazando los dialogs nativos del navegador (alert/confirm) con componentes personalizados y animados.

---

## 🎯 Modales Disponibles

### 1. **ConfirmacionModal**
Modal genérico para confirmaciones, advertencias, información y éxito.

**Ubicación**: `modals/confirmacion-modal.ts`

**Uso**:
```typescript
import { ConfirmacionModalComponent, type ConfirmacionConfig } from '../modals';

// En el componente
showConfirmacionModal: boolean = false;
confirmacionConfig: ConfirmacionConfig | null = null;

// Mostrar modal
this.confirmacionConfig = {
  titulo: 'Cancelar Inscripción',
  mensaje: '¿Estás seguro de que deseas cancelar?',
  textoConfirmar: 'Sí, cancelar',
  textoCancelar: 'No, mantener',
  tipo: 'danger', // 'danger' | 'warning' | 'info' | 'success'
  icono: 'danger'
};
this.showConfirmacionModal = true;

// En el HTML
<app-confirmacion-modal
  [isOpen]="showConfirmacionModal"
  [config]="confirmacionConfig!"
  (confirmar)="onConfirmar()"
  (cancelar)="onCancelar()"
  (cerrar)="onCerrar()">
</app-confirmacion-modal>
```

**Tipos de Modal**:
- `danger`: Acciones destructivas (eliminar, cancelar)
- `warning`: Advertencias (restricciones, límites)
- `info`: Información general
- `success`: Confirmación de éxito

---

### 2. **TorneoQuickViewModal**
Vista rápida de torneo con información resumida y acciones directas.

**Ubicación**: `modals/torneo-quick-view-modal.ts`

**Uso**:
```typescript
import { TorneoQuickViewModalComponent } from '../modals';

// En el componente
showQuickViewModal: boolean = false;
torneoSeleccionado: TorneoModel | null = null;

// Abrir modal
quickView(torneo: TorneoModel, event: Event): void {
  event.stopPropagation();
  this.torneoSeleccionado = torneo;
  this.showQuickViewModal = true;
}

// En el HTML
<app-torneo-quick-view-modal
  [isOpen]="showQuickViewModal"
  [torneo]="torneoSeleccionado"
  (cerrar)="onCerrar()"
  (inscribirse)="onInscribirse($event)">
</app-torneo-quick-view-modal>
```

**Características**:
- 📊 Cards de información (fechas, equipos, premio, costo)
- 📈 Barra de progreso de ocupación
- 🎯 Badges de estado dinámicos
- 🔗 Navegación a detalle completo y clasificación
- ✅ Botón de inscripción condicional (si hay cupos)

---

### 3. **InscripcionModal**
Formulario para inscribirse a un torneo.

**Ubicación**: `modals/inscripcion-modal.ts`

**Uso**:
```typescript
import { InscripcionModalComponent } from '../modals';

// En el componente
showInscripcionModal: boolean = false;
torneoSeleccionado: TorneoModel | null = null;
equiposDisponibles: EquipoUsuario[] = [];

// Abrir modal
abrirInscripcion(torneo: TorneoModel): void {
  this.torneoSeleccionado = torneo;
  // Cargar equipos del usuario para el deporte del torneo
  this.loadEquiposUsuario(torneo.id_deporte);
  this.showInscripcionModal = true;
}

// En el HTML
<app-inscripcion-modal
  [isOpen]="showInscripcionModal"
  [torneo]="torneoSeleccionado"
  [equiposDisponibles]="equiposDisponibles"
  (cerrar)="onCerrar()"
  (inscripcionExitosa)="onInscripcionExitosa($event)">
</app-inscripcion-modal>
```

**Características**:
- 📝 Formulario con selección de equipo
- 👥 Preview del equipo con roster de jugadores
- 💬 Campo de notas opcional
- ✅ Validación de formulario
- ⏳ Spinner de carga durante submit
- 🚨 Manejo de errores con alerts visuales

---

## 🔄 Flujos Implementados

### Flujo 1: Vista Rápida → Inscripción
1. Usuario hace click en botón "Vista rápida" de un torneo
2. Se abre `TorneoQuickViewModal` con información del torneo
3. Usuario hace click en "Inscribirse"
4. Se cierra QuickViewModal y se abre `InscripcionModal`
5. Usuario selecciona equipo y confirma
6. Se ejecuta inscripción y se muestra modal de éxito

### Flujo 2: Cancelar Inscripción
1. Usuario hace click en "Cancelar" en una inscripción
2. Sistema valida si puede cancelar (24 horas antes)
3. Si NO puede: Modal de advertencia (`tipo: 'warning'`)
4. Si SÍ puede: Modal de confirmación (`tipo: 'danger'`)
5. Usuario confirma → Se ejecuta cancelación
6. Éxito: Modal de éxito (`tipo: 'success'`)
7. Error: Modal de error (`tipo: 'danger'`)

---

## 📦 Barrel Export (modals/index.ts)

Para facilitar las importaciones, se creó un archivo barrel:

```typescript
// Importar múltiples modales
import { 
  ConfirmacionModalComponent,
  TorneoQuickViewModalComponent,
  InscripcionModalComponent,
  type ConfirmacionConfig 
} from '../modals';

// En lugar de:
import { ConfirmacionModalComponent } from '../modals/confirmacion-modal';
import { TorneoQuickViewModalComponent } from '../modals/torneo-quick-view-modal';
// ...etc
```

---

## 🎨 Diseño y UX

### Animaciones
- **fadeIn**: Fade in de overlay (0.2s)
- **slideInUp**: Slide up del contenedor (0.3s)

### Responsive
- Desktop: Modal centrado, max-width 600px
- Mobile: Full screen, border-radius 0

### Interacciones
- ✅ Click fuera del modal para cerrar (backdrop)
- ✅ Botón X en header
- ✅ Teclado ESC (pendiente implementar)

### Accesibilidad
- ✅ Standalone components (tree-shakeable)
- ✅ EventEmitter pattern (desacoplamiento)
- ⏳ ARIA labels (pendiente mejorar)
- ⏳ Focus trap (pendiente implementar)

---

## 🔧 Customización

### Cambiar colores de tipos
Editar `confirmacion-modal.css`:

```css
.modal-danger { color: var(--error); }
.modal-warning { color: var(--warning); }
.modal-info { color: var(--info); }
.modal-success { color: var(--success); }
```

### Agregar nuevos tipos
1. Actualizar interface `ConfirmacionConfig`
2. Agregar caso en `getIconoSVG()`
3. Agregar clase CSS en `.modal-{tipo}`

---

## 📊 Métricas de Código

| Modal | TypeScript | HTML | CSS | Total |
|-------|-----------|------|-----|-------|
| ConfirmacionModal | 75 líneas | 31 líneas | 147 líneas | 253 líneas |
| TorneoQuickViewModal | 77 líneas | 135 líneas | 370 líneas | 582 líneas |
| InscripcionModal | 154 líneas | 185 líneas | 410 líneas | 749 líneas |
| **TOTAL** | **306 líneas** | **351 líneas** | **927 líneas** | **1584 líneas** |

---

## ✅ Checklist de Integración

Para integrar un modal en un nuevo componente:

- [ ] Importar modal desde `../modals`
- [ ] Agregar modal al array `imports` del @Component
- [ ] Declarar variables de estado (isOpen, config, etc.)
- [ ] Crear métodos handlers (onConfirmar, onCerrar, etc.)
- [ ] Agregar componente modal al HTML
- [ ] Bindear inputs ([isOpen], [config], etc.)
- [ ] Bindear outputs ((confirmar), (cerrar), etc.)
- [ ] Probar flujo completo (abrir, interactuar, cerrar)

---

## 🐛 Troubleshooting

### Error: "Component not found in template"
- Verificar que el modal esté en el array `imports`
- Verificar que el selector del modal esté correcto en el HTML

### Modal no se abre
- Verificar que `isOpen` esté en `true`
- Verificar bindings en el HTML `[isOpen]="variable"`

### Modal no se cierra al click fuera
- Verificar `onBackdropClick(event)` en el TypeScript
- Verificar que el click event esté en el overlay correcto

### Animaciones no funcionan
- Verificar que el CSS esté importado en `styleUrls`
- Verificar que las keyframes estén definidas

---

## 🚀 Próximas Mejoras

1. **Teclado ESC**: Cerrar modal con tecla ESC
2. **Focus trap**: Mantener foco dentro del modal
3. **ARIA labels**: Mejorar accesibilidad
4. **Stacking**: Soporte para múltiples modales apilados
5. **Animaciones de salida**: Fade out al cerrar
6. **Loading states**: Skeleton loaders en modales
7. **Toast notifications**: Para mensajes rápidos no intrusivos

---

## 📚 Referencias

- **Angular Standalone Components**: https://angular.dev/guide/components/importing
- **EventEmitter Pattern**: https://angular.dev/guide/components/outputs
- **CSS Animations**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations

---

**Autor**: GitHub Copilot  
**Fecha**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
