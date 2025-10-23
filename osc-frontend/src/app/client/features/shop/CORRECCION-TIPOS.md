# 🔧 Corrección de Tipos - Componentes de Tienda

## 🎯 Problemas Identificados y Corregidos

### ❌ Problema Principal: Inconsistencia de Tipos

**Antes:**
- Modelos usaban `string` para IDs
- Componentes esperaban diferentes tipos
- Backend devuelve `number` pero frontend esperaba `string`
- Tipo mismatch entre componentes padre e hijo

---

## 📝 Cambios Realizados

### 1️⃣ **Modelos Actualizados (Core)**

#### `deporte.model.ts`
```typescript
// ❌ ANTES
export interface Deporte {
   id_deporte: string,  // ⚠️ Tipo incorrecto
   nombre_deporte: string;
   url_imagen: string;
}

// ✅ AHORA
export interface Deporte {
   id_deporte: number,  // ✅ Coincide con BD
   nombre_deporte: string;
   url_imagen: string;
}
```

#### `categoria.model.ts`
```typescript
// ❌ ANTES
export interface Categoria {
    id_categoria: string;  // ⚠️ Tipo incorrecto
    nombre_categoria: string;
}

// ✅ AHORA
export interface Categoria {
    id_categoria: number;  // ✅ Coincide con BD
    nombre_categoria: string;
}
```

#### `marca.model.ts`
```typescript
// ❌ ANTES
export interface Marca {
    id_marca: string;  // ⚠️ Tipo incorrecto
    nombre_marca: string;
}

// ✅ AHORA
export interface Marca {
    id_marca: number;  // ✅ Coincide con BD
    nombre_marca: string;
}
```

#### `producto.ts`
```typescript
// ❌ ANTES
export interface Productos {
  id: string;           // ⚠️ Tipo incorrecto
  id_categoria: string; // ⚠️ Tipo incorrecto
  id_deporte: string;   // ⚠️ Tipo incorrecto
  id_marca: string;     // ⚠️ Tipo incorrecto
  // ... otros campos
}

// ✅ AHORA
export interface Productos {
  id: number;           // ✅ Coincide con BD
  id_categoria: number; // ✅ Coincide con BD
  id_deporte: number;   // ✅ Coincide con BD
  id_marca: number;     // ✅ Coincide con BD
  // ... otros campos
}
```

---

### 2️⃣ **Componente DeporteSelector**

#### TypeScript (`deporte-selector.ts`)

```typescript
// ❌ ANTES
export class DeporteSelector {
  @Input() deporteActivo: string = 'futbol';        // ⚠️ String
  @Output() deporteChange = new EventEmitter<string>(); // ⚠️ Emite string
  
  seleccionarDeporte(id: string) {  // ⚠️ Parámetro string
    this.deporteChange.emit(id);
  }
}

// ✅ AHORA
export class DeporteSelector {
  @Input() deporteActivo: number = 1;               // ✅ Number (ID)
  @Output() deporteChange = new EventEmitter<number>(); // ✅ Emite number
  
  seleccionarDeporte(id: number) {  // ✅ Parámetro number
    this.deporteChange.emit(id);
  }
}
```

#### HTML (`deporte-selector.html`)

```html
<!-- ❌ ANTES: Tenía opción "Todos" que devolvía string -->
<div class="deporte-item"
  [class.activo]="deporteActivo === 'todos'"
  (click)="seleccionarDeporte('todos')">
  <span>Todos</span>
</div>

<!-- ✅ AHORA: Removida la opción "Todos", solo deportes reales -->
<!-- Cada deporte pasa su ID como number -->
@for (deporte of deportes; track deporte.id_deporte) {
<div class="deporte-item"
  [class.activo]="deporteActivo === deporte.id_deporte"
  (click)="seleccionarDeporte(deporte.id_deporte)">
  <img [src]="deporte.url_imagen" [alt]="deporte.nombre_deporte" />
  <span>{{ deporte.nombre_deporte }}</span>
</div>
}
```

**Razón del cambio:**
- La opción "Todos" causaba confusión de tipos (string vs number)
- El backend espera IDs numéricos específicos
- No tiene sentido tener "Todos" si puedes simplemente no filtrar

---

### 3️⃣ **Componente FiltroPanelComponent**

#### TypeScript (`filtro-panel.ts`)

```typescript
// ❌ ANTES: Propiedades obsoletas y valores incorrectos
@Input() filtrosActivos: FiltrosProducto = {
  deportes: [],
  marcas: [],
  categorias: [],
  q: '',
  sort: 'price_asc',
  is_new: false,        // ⚠️ Debería ser undefined por defecto
  page: 1,
  per_page: 12,         // ⚠️ Valor inconsistente
};

filtros: FiltrosProducto = {
  categorias: [],
  marcas: [],
  deportes: [],
  is_new: false,        // ⚠️ Debería ser undefined
  q: '',
  sort: 'price_asc',
  page: 1,
  per_page: 10,         // ⚠️ Valor inconsistente
};

// ✅ AHORA: Limpio y consistente
@Input() filtrosActivos: FiltrosProducto = {
  deportes: [],
  marcas: [],
  categorias: [],
  q: '',
  sort: 'price_asc',
  is_new: undefined,    // ✅ undefined = sin filtro
  page: 1,
  per_page: 24,         // ✅ Valor consistente
};

filtros: FiltrosProducto = {
  categorias: [],
  marcas: [],
  deportes: [],
  is_new: undefined,    // ✅ undefined = sin filtro
  q: '',
  sort: 'price_asc',
  page: 1,
  per_page: 24,         // ✅ Valor consistente
};
```

**Cambios en `limpiarFiltros()`:**
```typescript
// ❌ ANTES
limpiarFiltros() {
  this.filtros = {
    categorias: [],
    deportes: [],
    is_new: false,      // ⚠️ false no es neutral
    q: '',
    marcas: [],
    sort: 'price_asc',
    page: 1,
    per_page: 10,       // ⚠️ Inconsistente
  };
  this.aplicarFiltros();
}

// ✅ AHORA
limpiarFiltros() {
  this.filtros = {
    categorias: [],
    deportes: [],
    is_new: undefined,  // ✅ undefined = sin filtro
    q: '',
    marcas: [],
    sort: 'price_asc',
    page: 1,
    per_page: 24,       // ✅ Consistente con el resto
  };
  this.aplicarFiltros();
}
```

---

## 🔄 Flujo de Datos Corregido

### Antes (Con Errores):
```
DeporteSelector (emite string "futbol")
   ↓
TiendaPage.onDeporteChange(deporte: number) ❌ Error de tipo
   ↓
filtrosActivos.deportes = [deporte] ❌ Array de números recibe string
   ↓
Backend ❌ Error al procesar
```

### Ahora (Correcto):
```
DeporteSelector (emite number 1)
   ↓
TiendaPage.onDeporteChange(deporte: number) ✅ Tipo correcto
   ↓
filtrosActivos.deportes = [1] ✅ Array de números
   ↓
Backend recibe: { "deportes": [1] } ✅ Correcto
   ↓
SQL: WHERE id_deporte = ANY(ARRAY[1]) ✅ Funciona
```

---

## 📊 Tabla de Tipos Corregidos

| Campo | Antes | Ahora | Razón |
|-------|-------|-------|-------|
| `Deporte.id_deporte` | `string` | `number` | Coincide con BD (PostgreSQL INTEGER) |
| `Categoria.id_categoria` | `string` | `number` | Coincide con BD (PostgreSQL INTEGER) |
| `Marca.id_marca` | `string` | `number` | Coincide con BD (PostgreSQL INTEGER) |
| `Productos.id` | `string` | `number` | Backend devuelve number |
| `Productos.id_*` | `string` | `number` | Backend devuelve number |
| `DeporteSelector.deporteActivo` | `string` | `number` | Debe coincidir con el modelo |
| `DeporteSelector.deporteChange` | `EventEmitter<string>` | `EventEmitter<number>` | Debe emitir ID numérico |
| `FiltrosProducto.is_new` | `false` | `undefined` | undefined = sin filtro |
| `per_page` valores | 10, 12 | 24 | Estandarizado |

---

## ✅ Validación de Tipos

### Ahora TypeScript valida correctamente:

```typescript
// ✅ CORRECTO
const deporte: Deporte = {
  id_deporte: 1,              // number
  nombre_deporte: "Futbol",
  url_imagen: "..."
};

const filtros: FiltrosProducto = {
  deportes: [1, 2],           // number[]
  categorias: [1, 4],         // number[]
  marcas: [1, 5],             // number[]
  is_new: undefined,          // boolean | undefined
  page: 1,                    // number
  per_page: 24                // number
};

// ❌ ERROR (TypeScript detecta):
const filtrosInvalidos: FiltrosProducto = {
  deportes: ["1", "2"],       // ❌ Type 'string' is not assignable to type 'number'
  is_new: false,              // ✅ Válido pero no recomendado (usa undefined)
};
```

---

## 🎯 Razones de los Cambios

### 1. **Consistencia con la Base de Datos**
PostgreSQL almacena IDs como `INTEGER`, no como `TEXT`:
```sql
CREATE TABLE deportes (
    id_deporte INTEGER PRIMARY KEY,  -- Es INTEGER, no TEXT
    nombre_deporte VARCHAR(255)
);
```

### 2. **Respuesta del Backend**
El backend devuelve números:
```json
{
  "id": 4,              // number, no "4"
  "id_deporte": 1,      // number, no "1"
  "id_categoria": 1,    // number, no "1"
  "id_marca": 1         // number, no "1"
}
```

### 3. **SQL Query Correcto**
El backend necesita números para las queries:
```sql
-- ✅ CORRECTO
WHERE id_marca = ANY(ARRAY[1, 5])

-- ❌ INCORRECTO (si enviamos strings)
WHERE id_marca = ANY(ARRAY['1', '5'])  -- Error de tipo
```

### 4. **TypeScript Type Safety**
Con tipos correctos, TypeScript puede detectar errores en compilación:
```typescript
// ❌ TypeScript detecta el error
const id: number = "1";  // Type 'string' is not assignable to type 'number'

// ✅ TypeScript aprueba
const id: number = 1;
```

---

## 🐛 Errores que se Resolvieron

### Error 1: Tipo string vs number
```
Property 'deporteActivo' does not match type 'number' expected by parent.
Type 'string' is not assignable to type 'number'.
```
**Solución:** Cambiar `deporteActivo` de `string` a `number`

### Error 2: EventEmitter con tipo incorrecto
```
Argument of type 'number' is not assignable to parameter of type 'string'.
```
**Solución:** Cambiar `EventEmitter<string>` a `EventEmitter<number>`

### Error 3: Comparación imposible
```
This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
```
**Solución:** Corregir tipos en modelos

### Error 4: is_new siempre es boolean
```
Backend espera undefined para "sin filtro", pero recibía false
```
**Solución:** Usar `undefined` en lugar de `false` como valor por defecto

---

## 📚 Archivos Modificados

1. ✅ `core/models/deporte.model.ts` - ID a number
2. ✅ `core/models/categoria.model.ts` - ID a number
3. ✅ `core/models/marca.model.ts` - ID a number
4. ✅ `shop/models/producto.ts` - Todos los IDs a number
5. ✅ `shop/components/deporte-selector/deporte-selector.ts` - Tipos number
6. ✅ `shop/components/deporte-selector/deporte-selector.html` - Removida opción "Todos"
7. ✅ `shop/components/filtro-panel/filtro-panel.ts` - Limpieza y consistencia

---

## ✨ Resultado Final

### Antes:
- ❌ Errores de compilación TypeScript
- ❌ Tipos inconsistentes entre componentes
- ❌ Confusión entre string y number
- ❌ Opción "Todos" causaba problemas
- ❌ Valores por defecto incorrectos

### Ahora:
- ✅ Sin errores de compilación
- ✅ Tipos consistentes en toda la app
- ✅ Coincide con la estructura de la BD
- ✅ TypeScript detecta errores automáticamente
- ✅ Código más limpio y mantenible

---

## 🎓 Lecciones Aprendidas

1. **Siempre tipear según la fuente de verdad (BD)**
   - Si la BD usa INTEGER, usa `number`
   - Si la BD usa TEXT, usa `string`

2. **Verificar respuestas del backend**
   - Usar DevTools para ver qué tipo devuelve realmente
   - Ajustar modelos TypeScript según eso

3. **undefined vs false vs null**
   - `undefined`: Campo no presente = sin filtro
   - `false`: Valor booleano específico = filtrar por false
   - `null`: Valor explícito de "nulo"

4. **Consistencia en per_page**
   - Decidir un valor estándar (24 en nuestro caso)
   - Usarlo en todos lados

5. **EventEmitter debe coincidir con @Input del padre**
   - Si el hijo emite `number`, el padre debe esperar `number`
   - TypeScript te ayuda a detectar esto

---

## 🚀 Próximos Pasos

Si necesitas agregar más filtros:

1. **Verifica el tipo en la BD primero**
2. **Actualiza el modelo TypeScript**
3. **Actualiza la interfaz FiltrosProducto**
4. **Implementa en el componente**
5. **Prueba que TypeScript no tenga errores**

Ejemplo para precio:
```typescript
// 1. Verificar BD: precio es NUMERIC (se convierte a number en JS)
// 2. Actualizar FiltrosProducto
interface FiltrosProducto {
  // ... campos existentes
  precioMin?: number;  // ✅ number
  precioMax?: number;  // ✅ number
}

// 3. Usar en componente
this.filtros.precioMin = 10;    // ✅ Correcto
this.filtros.precioMax = "100"; // ❌ Error detectado
```
