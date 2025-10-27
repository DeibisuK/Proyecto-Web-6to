# Guía de Uso del Servicio de Productos

## 📦 Servicio: `ProductoService`

El servicio `ProductoService` proporciona métodos para consumir la API de productos con soporte para filtros múltiples.

---

## 🎯 Métodos Disponibles

### 1. `searchProductos(filtros?: FiltrosProducto): Observable<ProductosResponse>`

Método principal para buscar productos con filtros opcionales.

**Parámetros:**
- `filtros` (opcional): Objeto con los filtros a aplicar

**Retorna:** `Observable<ProductosResponse>` con la estructura:
```typescript
{
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Productos[];
}
```

### 2. `getAllProductos(page?: number, perPage?: number): Observable<ProductosResponse>`

Método simplificado para obtener todos los productos sin filtros.

**Parámetros:**
- `page` (opcional, default: 1): Número de página
- `perPage` (opcional, default: 24): Productos por página

---

## 📋 Interfaz `FiltrosProducto`

```typescript
interface FiltrosProducto {
  marcas?: number[];           // Array de IDs de marcas
  categorias?: number[];       // Array de IDs de categorías
  deportes?: number[];        // Array de IDs de deportes
  is_new?: boolean;            // Solo productos nuevos (true/false)
  q?: string;                  // Búsqueda por texto
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc';
  page?: number;               // Número de página (default: 1)
  per_page?: number;           // Productos por página (default: 24)
}
```

---

## 💡 Ejemplos de Uso en Componentes

### Ejemplo 1: Obtener todos los productos

```typescript
import { Component, OnInit } from '@angular/core';
import { ProductoService } from './services/producto.service';
import { ProductosResponse } from './models/producto';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
  productos: Productos[] = [];
  loading = false;
  totalProductos = 0;
  paginaActual = 1;
  totalPaginas = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;

    // Opción 1: Sin filtros
    this.productoService.searchProductos().subscribe({
      next: (response) => {
        this.productos = response.data;
        this.totalProductos = response.total;
        this.paginaActual = response.page;
        this.totalPaginas = response.total_pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
      }
    });

    // Opción 2: Usando getAllProductos
    // this.productoService.getAllProductos(1, 24).subscribe(...);
  }
}
```

### Ejemplo 2: Filtrar por múltiples marcas

```typescript
cargarProductosPorMarcas() {
  this.loading = true;

  const filtros = {
    marcas: [1, 5],  // Nike (1) y Reebok (5)
    page: 1,
    per_page: 24
  };

  this.productoService.searchProductos(filtros).subscribe({
    next: (response) => {
      this.productos = response.data;
      this.totalProductos = response.total;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.loading = false;
    }
  });
}
```

### Ejemplo 3: Filtrar por categorías y marcas

```typescript
cargarProductosFiltrados() {
  this.loading = true;

  const filtros = {
    marcas: [1, 2, 5],          // Nike, Adidas, Reebok
    categorias: [1, 4],         // Ropa Deportiva y Equipamiento
    page: 1,
    per_page: 24
  };

  this.productoService.searchProductos(filtros).subscribe({
    next: (response) => {
      this.productos = response.data;
      this.totalProductos = response.total;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.loading = false;
    }
  });
}
```

### Ejemplo 4: Filtros avanzados con búsqueda y ordenamiento

```typescript
buscarProductos(terminoBusqueda: string) {
  this.loading = true;

  const filtros = {
    q: terminoBusqueda,         // Buscar por texto
    marcas: [1],                // Solo Nike
    categorias: [1],            // Solo Ropa Deportiva
    is_new: true,               // Solo productos nuevos
    sort: 'price_asc',          // Ordenar por precio ascendente
    page: 1,
    per_page: 24
  };

  this.productoService.searchProductos(filtros).subscribe({
    next: (response) => {
      this.productos = response.data;
      this.totalProductos = response.total;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.loading = false;
    }
  });
}
```

### Ejemplo 5: Paginación

```typescript
cambiarPagina(pagina: number) {
  this.loading = true;

  const filtros = {
    ...this.filtrosActuales,  // Mantener filtros actuales
    page: pagina,
    per_page: 24
  };

  this.productoService.searchProductos(filtros).subscribe({
    next: (response) => {
      this.productos = response.data;
      this.paginaActual = response.page;
      this.totalPaginas = response.total_pages;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.loading = false;
    }
  });
}
```

### Ejemplo 6: Componente completo con filtros dinámicos

```typescript
import { Component, OnInit } from '@angular/core';
import { ProductoService } from './services/producto.service';
import { FiltrosProducto } from './models/filtros-producto';
import { Productos } from './models/producto';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html'
})
export class ShopComponent implements OnInit {
  productos: Productos[] = [];
  loading = false;

  // Estado de filtros
  filtrosActuales: FiltrosProducto = {
    page: 1,
    per_page: 24
  };

  // Opciones de filtros
  marcasSeleccionadas: number[] = [];
  categoriasSeleccionadas: number[] = [];
  deportesSeleccionados: number[] = [];
  soloNuevos = false;
  terminoBusqueda = '';
  ordenamiento: FiltrosProducto['sort'] = 'price_asc';

  // Paginación
  paginaActual = 1;
  totalPaginas = 0;
  totalProductos = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.aplicarFiltros();
  }

  // Método principal para aplicar filtros
  aplicarFiltros() {
    this.loading = true;

    // Construir objeto de filtros
    this.filtrosActuales = {
      page: this.paginaActual,
      per_page: 24
    };

    // Agregar filtros solo si tienen valores
    if (this.marcasSeleccionadas.length > 0) {
      this.filtrosActuales.marcas = this.marcasSeleccionadas;
    }

    if (this.categoriasSeleccionadas.length > 0) {
      this.filtrosActuales.categorias = this.categoriasSeleccionadas;
    }

    if (this.deportesSeleccionados.length > 0) {
      this.filtrosActuales.deportes = this.deportesSeleccionados;
    }

    if (this.soloNuevos) {
      this.filtrosActuales.is_new = true;
    }

    if (this.terminoBusqueda.trim()) {
      this.filtrosActuales.q = this.terminoBusqueda.trim();
    }

    if (this.ordenamiento) {
      this.filtrosActuales.sort = this.ordenamiento;
    }

    // Llamar al servicio
    this.productoService.searchProductos(this.filtrosActuales).subscribe({
      next: (response) => {
        this.productos = response.data;
        this.paginaActual = response.page;
        this.totalPaginas = response.total_pages;
        this.totalProductos = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
      }
    });
  }

  // Métodos para manejar cambios en filtros
  onMarcaChange(marcaId: number, checked: boolean) {
    if (checked) {
      this.marcasSeleccionadas.push(marcaId);
    } else {
      this.marcasSeleccionadas = this.marcasSeleccionadas.filter(id => id !== marcaId);
    }
    this.paginaActual = 1; // Resetear a página 1
    this.aplicarFiltros();
  }

  onCategoriaChange(categoriaId: number, checked: boolean) {
    if (checked) {
      this.categoriasSeleccionadas.push(categoriaId);
    } else {
      this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter(id => id !== categoriaId);
    }
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  onBusquedaChange(termino: string) {
    this.terminoBusqueda = termino;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  onOrdenamientoChange(ordenamiento: FiltrosProducto['sort']) {
    this.ordenamiento = ordenamiento;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.marcasSeleccionadas = [];
    this.categoriasSeleccionadas = [];
    this.deportesSeleccionados = [];
    this.soloNuevos = false;
    this.terminoBusqueda = '';
    this.ordenamiento = 'price_asc';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }
}
```

---

## 📊 IDs de Referencia

### Marcas
| ID | Marca |
|----|-------|
| 1 | Nike |
| 2 | Adidas |
| 3 | Puma |
| 4 | Under Armour |
| 5 | Reebok |

### Categorías
| ID | Categoría |
|----|-----------|
| 1 | Ropa Deportiva |
| 2 | Accesorios |
| 3 | Calzado |
| 4 | Equipamiento |

---

## 🎨 Ejemplo de Template HTML

```html
<!-- Barra de búsqueda -->
<div class="search-bar">
  <input
    type="text"
    [(ngModel)]="terminoBusqueda"
    (input)="onBusquedaChange(terminoBusqueda)"
    placeholder="Buscar productos...">
</div>

<!-- Filtros -->
<div class="filters">
  <!-- Filtro por marcas -->
  <div class="filter-group">
    <h3>Marcas</h3>
    <label>
      <input type="checkbox" (change)="onMarcaChange(1, $event.target.checked)">
      Nike
    </label>
    <label>
      <input type="checkbox" (change)="onMarcaChange(2, $event.target.checked)">
      Adidas
    </label>
    <!-- ... más marcas -->
  </div>

  <!-- Filtro por categorías -->
  <div class="filter-group">
    <h3>Categorías</h3>
    <label>
      <input type="checkbox" (change)="onCategoriaChange(1, $event.target.checked)">
      Ropa Deportiva
    </label>
    <!-- ... más categorías -->
  </div>

  <!-- Ordenamiento -->
  <div class="filter-group">
    <h3>Ordenar por</h3>
    <select [(ngModel)]="ordenamiento" (change)="onOrdenamientoChange(ordenamiento)">
      <option value="price_asc">Precio: Menor a Mayor</option>
      <option value="price_desc">Precio: Mayor a Menor</option>
      <option value="newest">Más Recientes</option>
      <option value="name_asc">Nombre: A-Z</option>
      <option value="name_desc">Nombre: Z-A</option>
    </select>
  </div>

  <button (click)="limpiarFiltros()">Limpiar Filtros</button>
</div>

<!-- Lista de productos -->
<div class="productos-grid" *ngIf="!loading">
  <div class="producto-card" *ngFor="let producto of productos">
    <img [src]="producto.imagen" [alt]="producto.nombre">
    <h3>{{ producto.nombre }}</h3>
    <p>{{ producto.marca }}</p>
    <p class="precio">${{ producto.precio }}</p>
    <span class="badge" *ngIf="producto.es_nuevo">Nuevo</span>
  </div>
</div>

<!-- Loading -->
<div class="loading" *ngIf="loading">
  Cargando productos...
</div>

<!-- Paginación -->
<div class="pagination" *ngIf="!loading && totalPaginas > 1">
  <button
    [disabled]="paginaActual === 1"
    (click)="cambiarPagina(paginaActual - 1)">
    Anterior
  </button>

  <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>

  <button
    [disabled]="paginaActual === totalPaginas"
    (click)="cambiarPagina(paginaActual + 1)">
    Siguiente
  </button>
</div>
```

---

## ⚠️ Notas Importantes

1. **Todos los filtros son opcionales**: Si no envías ningún filtro, obtienes todos los productos.
2. **Arrays vacíos se ignoran**: El servicio automáticamente limpia arrays vacíos antes de enviar la petición.
3. **Paginación por defecto**: Si no especificas `page` o `per_page`, se usan los valores por defecto (1 y 24).
4. **API Gateway**: El servicio usa la ruta `/p/client/productos/search` a través del API Gateway.
5. **CORS**: Asegúrate de que el backend tenga CORS habilitado para tu frontend.

---

## 🚀 Prueba Rápida

Para probar rápidamente en la consola del navegador:

```typescript
// Inyecta el servicio en tu componente
this.productoService.searchProductos({
  marcas: [1, 5],
  categorias: [1],
  is_new: true,
  sort: 'price_asc'
}).subscribe(response => console.log(response));
```
