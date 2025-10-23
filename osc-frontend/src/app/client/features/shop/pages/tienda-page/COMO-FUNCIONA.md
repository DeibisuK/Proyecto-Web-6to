# 📖 Cómo Funciona el Sistema de Filtrado de Productos

## 🎯 Cambio Fundamental: Filtrado en Backend vs Frontend

### ❌ ANTES (Filtrado en Frontend)
```typescript
// ❌ VIEJO: Traer TODOS los productos y filtrar en el cliente
this.productoService.getAllProductos().subscribe(productos => {
  // Filtrar por categoría en el frontend
  let filtrados = productos.filter(p => categorias.includes(p.categoria));
  // Filtrar por marca en el frontend
  filtrados = filtrados.filter(p => marcas.includes(p.marca));
  // ... más filtros
  this.productos = filtrados;
});
```

**Problemas:**
- 🐌 Lento (descarga todos los productos)
- 📦 Mucho tráfico de red
- 💾 Consume mucha memoria
- 🔄 No hay paginación real

### ✅ AHORA (Filtrado en Backend)
```typescript
// ✅ NUEVO: El backend filtra y solo envía lo que necesitas
this.productoService.searchProductos({
  marcas: [1, 5],
  categorias: [1, 4],
  page: 1,
  per_page: 24
}).subscribe(response => {
  // ✨ Los productos ya vienen filtrados!
  this.productos = response.data;
  this.totalProductos = response.total;
  this.totalPaginas = response.total_pages;
});
```

**Ventajas:**
- ⚡ Rápido (solo los datos necesarios)
- 📉 Menos tráfico de red
- 💚 Menos memoria usada
- 📄 Paginación real del servidor

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐      ┌──────────┐
│  Componente │─────▶│   Servicio   │─────▶│  API Gateway   │─────▶│ Backend  │
│  (Angular)  │      │  (Angular)   │      │  (Puerto 3000) │      │ (Puerto  │
│             │      │              │      │                │      │  3002)   │
└─────────────┘      └──────────────┘      └────────────────┘      └──────────┘
      │                     │                       │                     │
      │ 1. Usuario          │ 2. HTTP POST         │ 3. Proxy a /p       │ 4. Query SQL
      │    cambia           │    con filtros       │                     │    con WHERE
      │    filtros          │                      │                     │    dinámico
      │                     │                      │                     │
      │◀────────────────────│◀─────────────────────│◀────────────────────│
      │ 5. Productos        │                      │                     │
      │    filtrados        │                      │                     │
```

---

## 📋 Flujo Completo Paso a Paso

### 1️⃣ **Usuario Selecciona Filtros**

```html
<!-- Usuario hace clic en checkboxes de marcas -->
<input type="checkbox" (change)="onMarcaChange(1, $event.target.checked)">
Nike
```

### 2️⃣ **Componente Actualiza Estado**

```typescript
onMarcaChange(marcaId: number, checked: boolean) {
  // Agregar o quitar marca del array
  if (checked) {
    this.marcasSeleccionadas.push(marcaId);
  } else {
    this.marcasSeleccionadas = this.marcasSeleccionadas.filter(id => id !== marcaId);
  }
  
  // Actualizar filtros activos
  this.filtrosActivos.marcas = this.marcasSeleccionadas;
  this.filtrosActivos.page = 1; // Resetear a página 1
  
  // Recargar productos
  this.cargarProductos();
}
```

### 3️⃣ **Método cargarProductos() - El Corazón del Sistema**

```typescript
private cargarProductos() {
  this.isLoading = true;

  // 🚀 Llamada al servicio con filtros
  this.productoService.searchProductos(this.filtrosActivos).subscribe({
    next: (response) => {
      // ✅ Backend ya filtró todo
      this.productos = response.data;          // Productos de esta página
      this.totalProductos = response.total;    // Total en toda la BD
      this.totalPaginas = response.total_pages; // Páginas disponibles
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.productos = [];
      this.isLoading = false;
    }
  });
}
```

### 4️⃣ **Servicio Envía Request HTTP**

```typescript
// producto.service.ts
searchProductos(filtros: FiltrosProducto = {}): Observable<ProductosResponse> {
  const url = `${API_URL}/p/client/productos/search`;
  
  const body = {
    page: filtros.page || 1,
    per_page: filtros.per_page || 24,
    marcas: filtros.marcas,        // [1, 5]
    categorias: filtros.categorias, // [1, 4]
    deportes: filtros.deportes,
    is_new: filtros.is_new,
    q: filtros.q,
    sort: filtros.sort
  };

  // POST http://localhost:3000/p/client/productos/search
  return this.http.post<ProductosResponse>(url, body);
}
```

### 5️⃣ **Backend Ejecuta Query SQL**

```javascript
// Backend recibe: { marcas: [1, 5], categorias: [1, 4] }

const sql = `
  SELECT 
    id_producto, nombre, precio, ...
  FROM vw_productos_card
  WHERE 
    id_marca = ANY($1::int[])        -- [1, 5]
    AND id_categoria = ANY($2::int[]) -- [1, 4]
  LIMIT $3 OFFSET $4
`;

const result = await pool.query(sql, [
  [1, 5],      // marcas
  [1, 4],      // categorias
  24,          // limit
  0            // offset
]);
```

### 6️⃣ **Backend Responde con Datos Filtrados**

```json
{
  "page": 1,
  "per_page": 24,
  "total": 45,
  "total_pages": 2,
  "data": [
    {
      "id": 4,
      "nombre": "Camiseta Nike",
      "marca": "Nike",
      "precio": 24.99,
      ...
    },
    // ... más productos
  ]
}
```

### 7️⃣ **Componente Muestra Productos**

```html
<div class="producto-card" *ngFor="let producto of productos">
  <img [src]="producto.imagen" [alt]="producto.nombre">
  <h3>{{ producto.nombre }}</h3>
  <p>{{ producto.marca }}</p>
  <p class="precio">${{ producto.precio }}</p>
</div>
```

---

## 🔧 Propiedades Importantes del Componente

```typescript
export class TiendaPage {
  // 📦 DATOS
  productos: Productos[] = [];              // Productos de la página actual
  categorias: Categoria[] = [];             // Lista de categorías disponibles
  deporteSeleccionado: number = 1;          // Deporte actualmente seleccionado
  
  // 🎯 FILTROS ACTIVOS (se envían al backend)
  filtrosActivos: FiltrosProducto = {
    categorias: [],    // Array de IDs de categorías seleccionadas
    marcas: [],        // Array de IDs de marcas seleccionadas
    deportes: [],      // Array de IDs de deportes seleccionados
    is_new: undefined, // true = solo nuevos, false = solo usados, undefined = todos
    q: '',             // Texto de búsqueda
    sort: 'price_asc', // Ordenamiento
    page: 1,           // Página actual
    per_page: 24,      // Productos por página
  };
  
  // 📊 PAGINACIÓN
  totalProductos: number = 0;    // Total de productos que cumplen los filtros
  totalPaginas: number = 0;      // Total de páginas disponibles
  
  // 🔄 ESTADO
  isLoading: boolean = false;    // Indica si está cargando
}
```

---

## 🎮 Métodos Principales

### 1. `cargarProductos()` - Carga productos del backend
```typescript
private cargarProductos() {
  this.isLoading = true;
  this.productoService.searchProductos(this.filtrosActivos).subscribe({
    next: (response) => {
      this.productos = response.data;
      this.totalProductos = response.total;
      this.totalPaginas = response.total_pages;
      this.isLoading = false;
    }
  });
}
```

**¿Cuándo se llama?**
- Al iniciar el componente (`ngOnInit`)
- Cuando cambian los filtros
- Cuando cambias de página
- Cuando cambias el deporte

### 2. `onDeporteChange(deporte)` - Cambio de deporte
```typescript
onDeporteChange(deporte: number) {
  this.deporteSeleccionado = deporte;
  this.filtrosActivos.deportes = [deporte];
  this.filtrosActivos.page = 1; // ⚠️ Importante: resetear a página 1
  this.cargarProductos();
}
```

**¿Por qué resetear a página 1?**
Porque los filtros nuevos pueden tener menos resultados. Si estabas en la página 5 y ahora solo hay 2 páginas, habría un error.

### 3. `onFiltrosChange(filtros)` - Cambio de filtros
```typescript
onFiltrosChange(filtros: FiltrosProducto) {
  this.filtrosActivos = { 
    ...this.filtrosActivos,  // Mantener filtros existentes
    ...filtros,              // Sobrescribir con nuevos
    page: 1                  // Resetear a página 1
  };
  this.cargarProductos();
}
```

**Ejemplo de uso:**
```typescript
// Desde el panel de filtros
onFiltrosChange({
  marcas: [1, 5],
  categorias: [1],
  sort: 'price_asc'
});
```

### 4. `cambiarPagina(pagina)` - Navegación entre páginas
```typescript
cambiarPagina(pagina: number) {
  if (pagina < 1 || pagina > this.totalPaginas) {
    return; // Validar límites
  }
  this.filtrosActivos.page = pagina;
  this.cargarProductos();
}
```

### 5. `limpiarFiltros()` - Resetear todo
```typescript
limpiarFiltros() {
  this.filtrosActivos = {
    categorias: [],
    marcas: [],
    deportes: [],
    is_new: undefined,
    q: '',
    sort: 'price_asc',
    page: 1,
    per_page: 24,
  };
  this.cargarProductos();
}
```

---

## 🔍 Ejemplos Prácticos

### Ejemplo 1: Usuario busca "camiseta"
```typescript
// Usuario escribe en el input de búsqueda
onBusquedaChange(termino: string) {
  this.filtrosActivos.q = termino;
  this.filtrosActivos.page = 1;
  this.cargarProductos();
}

// Body enviado al backend:
{
  "q": "camiseta",
  "page": 1,
  "per_page": 24
}

// Backend responde con productos que contienen "camiseta" en nombre o descripción
```

### Ejemplo 2: Filtrar Nike + Adidas de categoría "Ropa"
```typescript
// Usuario selecciona filtros
this.filtrosActivos = {
  marcas: [1, 2],      // Nike y Adidas
  categorias: [1],     // Ropa Deportiva
  page: 1,
  per_page: 24
};
this.cargarProductos();

// Body enviado:
{
  "marcas": [1, 2],
  "categorias": [1],
  "page": 1,
  "per_page": 24
}

// Backend responde solo con productos Nike o Adidas de Ropa Deportiva
```

### Ejemplo 3: Paginación
```typescript
// Usuario está en página 1, hace clic en "Siguiente"
cambiarPagina(2);

// Body enviado:
{
  ...filtrosActivos,  // Mantiene todos los filtros
  "page": 2          // Solo cambia la página
}

// Backend responde con productos 25-48 (si per_page=24)
```

---

## ⚠️ Cosas Importantes a Recordar

### 1. **Siempre resetear a página 1 cuando cambien filtros**
```typescript
// ✅ CORRECTO
onFiltrosChange(filtros) {
  this.filtrosActivos = { ...this.filtrosActivos, ...filtros, page: 1 };
  this.cargarProductos();
}

// ❌ INCORRECTO (puede causar errores)
onFiltrosChange(filtros) {
  this.filtrosActivos = { ...this.filtrosActivos, ...filtros }; // page puede ser inválida
  this.cargarProductos();
}
```

### 2. **Arrays vacíos = sin filtro**
```typescript
// Estos son equivalentes:
{ marcas: [] }        // Sin filtro de marcas
{ marcas: undefined } // Sin filtro de marcas
// Ambos devuelven todos los productos (respecto a marcas)
```

### 3. **El servicio limpia automáticamente valores vacíos**
```typescript
// Tu envías:
{
  marcas: [],
  categorias: [1],
  q: ''
}

// El servicio envía al backend:
{
  categorias: [1]
}
// Arrays vacíos y strings vacíos se eliminan automáticamente
```

### 4. **No filtres en el frontend**
```typescript
// ❌ NO HAGAS ESTO
cargarProductos() {
  this.service.searchProductos(filtros).subscribe(response => {
    // ❌ Filtrar después de recibir del backend
    this.productos = response.data.filter(p => p.precio > 50);
  });
}

// ✅ HAZ ESTO: Deja que el backend filtre
// Si necesitas filtrar por precio, agrégalo a FiltrosProducto
```

---

## 🎓 Resumen para Nuevos Desarrolladores

1. **El backend hace TODO el filtrado** - No filtres en el componente
2. **Solo llama a `cargarProductos()`** - Cuando cambien filtros
3. **Resetea a página 1** - Al cambiar cualquier filtro
4. **Usa `filtrosActivos`** - Para mantener el estado de los filtros
5. **Muestra `isLoading`** - Para indicar que está cargando
6. **Usa `totalPaginas`** - Para la paginación

---

## 🔮 Próximas Implementaciones (Futuro)

Filtros que se agregarán más adelante:

```typescript
interface FiltrosProductoFuturo extends FiltrosProducto {
  precioMin?: number;     // Precio mínimo
  precioMax?: number;     // Precio máximo
  tallas?: string[];      // Array de tallas
  colores?: string[];     // Array de colores
}
```

Cuando se implementen, el flujo será exactamente el mismo:
1. Usuario selecciona filtro
2. Actualizar `filtrosActivos`
3. Llamar `cargarProductos()`
4. Backend filtra
5. Mostrar resultados

---

## 📚 Recursos Adicionales

- **Documentación del servicio:** `EJEMPLO-USO-SERVICIO-PRODUCTOS.md`
- **Documentación del endpoint:** `OSC-Backend/micro-servicios/products-service/ENDPOINT-SEARCH-PRODUCTOS.md`
- **Modelo de filtros:** `models/filtros-producto.ts`
- **Modelo de respuesta:** `models/producto.ts`

---

## ❓ Preguntas Frecuentes

### ¿Por qué no filtrar en el frontend como antes?
- **Rendimiento**: Filtrar 1000 productos en el navegador es lento
- **Tráfico**: Descargar 1000 productos cuando solo necesitas 24 es ineficiente
- **Escalabilidad**: Con 10,000 productos, sería imposible

### ¿Qué pasa si el backend está caído?
```typescript
error: (error) => {
  console.error('Error:', error);
  this.productos = [];        // Mostrar lista vacía
  this.isLoading = false;     // Dejar de mostrar loading
  // Opcional: Mostrar mensaje de error al usuario
}
```

### ¿Cómo sé qué filtros están activos?
```typescript
console.log(this.filtrosActivos);
// Muestra el objeto completo con todos los filtros actuales
```

### ¿Puedo ver las peticiones HTTP?
Sí! Abre las DevTools del navegador:
1. F12 → Network
2. Filtrar por "search"
3. Ver el Request Body y Response
