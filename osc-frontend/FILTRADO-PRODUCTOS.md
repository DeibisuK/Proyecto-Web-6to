# Sistema de Filtrado de Productos

## Descripción General
El sistema de filtrado permite a los usuarios filtrar productos por múltiples criterios: categoría, deporte, marca, precio y ordenamiento.

## Componentes Involucrados

### 1. TiendaPage (`tienda-page.ts`)
Componente principal que:
- Gestiona el estado de los filtros activos
- Carga productos desde el backend
- Aplica filtros en el frontend
- Maneja el ordenamiento de productos

### 2. FiltroPanelComponent (`filtro-panel.ts`)
Panel lateral de filtros que:
- Carga dinámicamente categorías y marcas desde el backend
- Permite selección múltiple de categorías y marcas
- Emite cambios de filtros al componente padre
- Incluye botón para limpiar todos los filtros

### 3. DeporteSelector (`deporte-selector.ts`)
Selector visual de deportes que:
- Carga deportes disponibles desde el backend
- Permite seleccionar un deporte específico o "Todos"
- Emite el ID del deporte seleccionado

## Flujo de Filtrado

### Filtrado por Categoría
```typescript
// En FiltroPanelComponent
toggleCategoria(categoriaId: string) {
  // Agrega/quita el ID de categoría del array de filtros
}

// En TiendaPage
// Filtra productos que coincidan con las categorías seleccionadas
productosFiltrados.filter(p => 
  filtrosActivos.categoria.includes(p.id_categoria.toString())
);
```

### Filtrado por Deporte
```typescript
// En DeporteSelector
seleccionarDeporte(id: string) {
  // Emite el ID del deporte (o 'todos')
}

// En TiendaPage
if (filtrosActivos.deporte !== 'todos') {
  // Filtra productos por ID de deporte
  productosFiltrados.filter(p => 
    p.id_deporte.toString() === deporteFiltro
  );
}
```

### Filtrado por Marca
```typescript
// En FiltroPanelComponent
toggleMarca(marcaId: string) {
  // Agrega/quita el ID de marca del array de filtros
}

// En TiendaPage
// Filtra productos que coincidan con las marcas seleccionadas
productosFiltrados.filter(p => 
  filtrosActivos.marca.includes(p.id_marca.toString())
);
```

### Filtrado por Precio
```typescript
// Filtra productos dentro del rango de precio
productosFiltrados.filter(p => 
  p.precio >= precioMin && p.precio <= precioMax
);
```

## Ordenamiento

El sistema soporta los siguientes tipos de ordenamiento:
- **relevancia**: Orden original del backend
- **precio-asc**: Precio ascendente (menor a mayor)
- **precio-desc**: Precio descendente (mayor a menor)
- **nombre**: Orden alfabético por nombre

```typescript
private ordenarProductos(productos: Productoa[]): Productoa[] {
  switch (this.filtrosActivos.ordenamiento) {
    case 'precio-asc':
      return [...productos].sort((a, b) => a.precio - b.precio);
    case 'precio-desc':
      return [...productos].sort((a, b) => b.precio - a.precio);
    case 'nombre':
      return [...productos].sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
    default:
      return productos;
  }
}
```

## Modelos de Datos

### FiltrosProducto
```typescript
interface FiltrosProducto {
  categoria?: string[];      // IDs de categorías
  deporte?: string;          // ID de deporte o 'todos'
  precioMin?: number;
  precioMax?: number;
  marca?: string[];          // IDs de marcas
  tallas?: string[];
  color?: string[];
  ordenamiento?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre';
  pagina?: number;
  porPagina?: number;
}
```

### Productoa (del backend)
```typescript
interface Productoa {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  id_categoria?: number | null;
  nombre_categoria?: string | null;
  id_deporte?: number | null;
  nombre_deporte?: string | null;
  id_marca?: number | null;
  nombre_marca?: string | null;
  precio: number;
  stock?: number;
  images?: string[];
}
```

## Mejoras Implementadas

### ✅ Conversión de IDs
Los IDs del backend (numbers) se convierten a strings para comparación:
```typescript
p.id_categoria.toString() === categoriaId
```

### ✅ Validación de Nulos
Se verifica que los IDs no sean null antes de filtrar:
```typescript
if (p.id_categoria == null) return false;
```

### ✅ Filtros Múltiples
Se pueden aplicar múltiples filtros simultáneamente. Todos los filtros son acumulativos (AND).

### ✅ Query Params
El componente soporta recibir filtros iniciales vía query params:
```typescript
// URL: /tienda?categoria=123
// Automáticamente filtrará por esa categoría
```

## Uso

### Aplicar Filtro de Categoría
1. El usuario hace clic en una categoría en el panel de filtros
2. `toggleCategoria()` se ejecuta en FiltroPanelComponent
3. Se emite el evento `filtrosChange`
4. TiendaPage recibe el cambio en `onFiltrosChange()`
5. Se ejecuta `cargarProductos()` para refiltrar

### Aplicar Filtro de Deporte
1. El usuario hace clic en un deporte
2. `seleccionarDeporte()` se ejecuta en DeporteSelector
3. Se emite el evento `deporteChange`
4. TiendaPage recibe el cambio en `onDeporteChange()`
5. Se ejecuta `cargarProductos()` para refiltrar

### Limpiar Filtros
1. El usuario hace clic en "Limpiar filtros"
2. Se resetean todos los filtros excepto el deporte
3. Se recargan todos los productos

## Notas Técnicas

- **Filtrado Frontend**: Actualmente el filtrado se realiza en el frontend después de cargar todos los productos
- **Performance**: Para grandes cantidades de productos, considerar implementar filtrado en backend
- **Estado**: Los filtros activos se mantienen en `filtrosActivos` en TiendaPage
- **Reactividad**: Cualquier cambio en los filtros recarga automáticamente los productos
