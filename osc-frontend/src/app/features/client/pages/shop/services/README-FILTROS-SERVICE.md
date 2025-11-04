# FiltrosService - Documentación

## 📋 Descripción General

`FiltrosService` es un servicio centralizado para gestionar el estado de filtros de productos en la tienda. Utiliza Angular Signals para proporcionar reactividad y sincronización automática con los query parameters de la URL.

## 🎯 Características Principales

### 1. Estado Global con Signals
- ✅ Signal principal `filtros` que contiene todos los filtros activos
- ✅ Computed signals para detectar filtros activos y contarlos
- ✅ Reactivo automáticamente a cambios

### 2. Sincronización con URL
- ✅ Sincronización bidireccional automática con query params
- ✅ Permite compartir URLs con filtros activos
- ✅ Navegación del navegador (back/forward) funciona correctamente

### 3. Métodos Helper
- ✅ Toggle para categorías, marcas, deportes, colores y tallas
- ✅ Actualización de precio, búsqueda y ordenamiento
- ✅ Métodos de consulta (is*Seleccionado)
- ✅ Limpiar filtros

## 🚀 Uso Básico

### 1. Inyectar el Servicio

```typescript
import { FiltrosService } from '../../services/filtros.service';

export class MiComponente {
  filtrosService = inject(FiltrosService);
}
```

### 2. Acceder a los Filtros

```typescript
// Leer filtros actuales
const filtrosActuales = this.filtrosService.filtros();

// En template
<div>{{ filtrosService.filtros().q }}</div>
```

### 3. Actualizar Filtros

```typescript
// Método 1: Actualizar múltiples filtros
this.filtrosService.actualizarFiltros({
  categorias: [1, 2],
  precioMin: 100,
  precioMax: 500
});

// Método 2: Usar métodos específicos
this.filtrosService.toggleCategoria(1);
this.filtrosService.actualizarBusqueda('zapatillas');
this.filtrosService.actualizarPrecio(100, 500);
```

### 4. Reaccionar a Cambios

```typescript
constructor() {
  // Effect que se ejecuta cuando cambian los filtros
  effect(() => {
    const filtros = this.filtrosService.filtros();
    console.log('Filtros actualizados:', filtros);
    
    // Recargar productos, etc.
    this.cargarProductos();
  });
}
```

## 📊 Computed Signals Disponibles

### `tieneFiltrosActivos`
Indica si hay algún filtro activo (excepto sort y paginación).

```typescript
@if (filtrosService.tieneFiltrosActivos()) {
  <button (click)="filtrosService.limpiarFiltros()">
    Limpiar Filtros
  </button>
}
```

### `contadorFiltrosActivos`
Cuenta cuántos tipos de filtros están activos.

```typescript
<span class="badge">
  {{ filtrosService.contadorFiltrosActivos() }} filtros activos
</span>
```

## 🔧 Métodos Principales

### Actualización General

#### `actualizarFiltros(nuevosFiltros: Partial<FiltrosProducto>)`
Actualiza uno o múltiples filtros. Resetea automáticamente a página 1.

```typescript
this.filtrosService.actualizarFiltros({
  categorias: [1, 3],
  marcas: [5],
  precioMin: 50
});
```

### Toggle de Arrays

#### `toggleCategoria(idCategoria: number)`
Agrega o quita una categoría del filtro.

```typescript
this.filtrosService.toggleCategoria(1);
```

#### `toggleMarca(idMarca: number)`
Agrega o quita una marca del filtro.

#### `toggleDeporte(idDeporte: number)`
Agrega o quita un deporte del filtro.

#### `toggleColor(idValor: number)`
Agrega o quita un color del filtro.

#### `toggleTalla(idValor: number)`
Agrega o quita una talla del filtro.

### Actualización de Valores

#### `actualizarPrecio(precioMin?: number, precioMax?: number)`
Actualiza el rango de precio.

```typescript
this.filtrosService.actualizarPrecio(100, 500);
```

#### `actualizarBusqueda(q: string)`
Actualiza el término de búsqueda.

```typescript
this.filtrosService.actualizarBusqueda('zapatillas nike');
```

#### `actualizarOrdenamiento(sort: string)`
Actualiza el criterio de ordenamiento.

```typescript
this.filtrosService.actualizarOrdenamiento('price_desc');
```

#### `actualizarNovedades(is_new?: boolean)`
Filtra por productos nuevos.

```typescript
this.filtrosService.actualizarNovedades(true);
```

### Paginación

#### `cambiarPagina(page: number)`
Cambia a una página específica.

```typescript
this.filtrosService.cambiarPagina(2);
```

### Limpieza

#### `limpiarFiltros()`
Limpia todos los filtros manteniendo sort y per_page.

```typescript
this.filtrosService.limpiarFiltros();
```

#### `resetearCompleto()`
Resetea completamente incluyendo sort y per_page.

```typescript
this.filtrosService.resetearCompleto();
```

## 🔍 Métodos de Consulta

### `isCategoriaSeleccionada(idCategoria: number): boolean`
### `isMarcaSeleccionada(idMarca: number): boolean`
### `isDeporteSeleccionado(idDeporte: number): boolean`
### `isColorSeleccionado(idValor: number): boolean`
### `isTallaSeleccionada(idValor: number): boolean`

Verifican si un elemento específico está seleccionado.

```typescript
// En componente
estaSeleccionada(id: number): boolean {
  return this.filtrosService.isCategoriaSeleccionada(id);
}

// En template
<button [class.active]="filtrosService.isCategoriaSeleccionada(cat.id)">
  {{ cat.nombre }}
</button>
```

## 🌐 Sincronización con URL

El servicio sincroniza automáticamente los filtros con la URL:

### URL Generada
```
/tienda?categorias=1,3&marcas=5&precioMin=100&precioMax=500&q=nike&page=2
```

### Inicialización desde URL
Al cargar la página, el servicio lee los query params y restaura el estado.

```typescript
// Automático - no requiere código adicional
// El constructor del servicio llama a inicializarDesdURL()
```

## 💡 Ejemplo Completo: TiendaPage

```typescript
import { Component, inject, signal, computed, effect } from '@angular/core';
import { FiltrosService } from '../../services/filtros.service';
import { ProductoService } from '@shared/services/index';

export class TiendaPage {
  // Inyectar servicios
  filtrosService = inject(FiltrosService);
  private productoService = inject(ProductoService);

  // Signals locales
  productos = signal<Producto[]>([]);
  isLoading = signal(false);

  // Computed
  totalPaginas = computed(() => {
    const perPage = this.filtrosService.filtros().per_page || 24;
    return Math.ceil(this.totalProductos() / perPage);
  });

  constructor() {
    // Effect para cargar productos cuando cambian filtros
    effect(() => {
      const filtros = this.filtrosService.filtros();
      this.cargarProductos();
    });
  }

  private cargarProductos() {
    this.isLoading.set(true);
    
    this.productoService.searchProductos(this.filtrosService.filtros())
      .subscribe({
        next: (response) => {
          this.productos.set(response.data);
          this.isLoading.set(false);
        }
      });
  }

  // Métodos de UI
  cambiarPagina(pagina: number) {
    this.filtrosService.cambiarPagina(pagina);
  }

  limpiarFiltros() {
    this.filtrosService.limpiarFiltros();
  }
}
```

## 📝 Ejemplo: Componente de Búsqueda

```typescript
export class BuscadorComponent {
  filtrosService = inject(FiltrosService);
  
  terminoBusqueda = signal('');

  constructor() {
    // Sincronizar con el servicio
    effect(() => {
      const q = this.filtrosService.filtros().q;
      this.terminoBusqueda.set(q);
    });
  }

  onBuscar() {
    this.filtrosService.actualizarBusqueda(this.terminoBusqueda());
  }
}
```

## 🎨 Ejemplo: Componente de Filtros

```typescript
export class FiltroPanelComponent {
  filtrosService = inject(FiltrosService);
  
  categorias = signal<Categoria[]>([]);

  // En template
  isCategoriaSeleccionada(id: number): boolean {
    return this.filtrosService.isCategoriaSeleccionada(id);
  }

  toggleCategoria(id: number) {
    this.filtrosService.toggleCategoria(id);
  }
}
```

```html
@for (cat of categorias(); track cat.id) {
  <label>
    <input type="checkbox"
           [checked]="isCategoriaSeleccionada(cat.id)"
           (change)="toggleCategoria(cat.id)">
    {{ cat.nombre }}
  </label>
}
```

## ⚡ Ventajas de Usar el Servicio

1. **Estado Centralizado**: Una única fuente de verdad para todos los filtros
2. **Reactividad**: Cambios automáticos se propagan a todos los componentes
3. **URLs Compartibles**: Los usuarios pueden copiar/pegar URLs con filtros
4. **Menos Código**: No duplicar lógica de filtros en cada componente
5. **Type Safety**: TypeScript garantiza tipos correctos
6. **Navegación del Navegador**: Back/forward funcionan correctamente
7. **Testeable**: Fácil de testear con signals

## 🔒 Consideraciones

- El servicio es **singleton** (`providedIn: 'root'`)
- Los filtros se resetean a página 1 automáticamente al cambiar (excepto paginación)
- La sincronización con URL usa `replaceUrl: true` para no contaminar el historial
- Los valores por defecto están definidos en el constructor

## 🐛 Debugging

Para ver los cambios de filtros:

```typescript
constructor() {
  effect(() => {
    console.log('Filtros actuales:', this.filtrosService.filtros());
  });
}
```

Para ver si hay filtros activos:

```typescript
console.log('Tiene filtros:', this.filtrosService.tieneFiltrosActivos());
console.log('Contador:', this.filtrosService.contadorFiltrosActivos());
```

## 📚 Referencias

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Angular Router Query Params](https://angular.io/api/router/ActivatedRoute#queryParams)
