# Endpoint de Búsqueda de Productos

## 🎯 Endpoint Principal
```
POST /productos/search
```

## 📋 Descripción
Este endpoint permite filtrar productos con múltiples criterios simultáneamente. Si no se envían filtros, devuelve todos los productos.

## 📥 Request Body

### Estructura completa
```json
{
  "marcas": [1, 5],           // Array de IDs de marcas (opcional)
  "categorias": [1, 4],       // Array de IDs de categorías (opcional)
  "deportes": [1],            // Array de IDs de deportes (opcional)
  "is_new": true,             // true | false | undefined (opcional)
  "q": "camiseta",            // Texto de búsqueda (opcional)
  "sort": "price_asc",        // Tipo de ordenamiento (opcional)
  "page": 1,                  // Número de página (default: 1)
  "per_page": 24              // Productos por página (default: 24, max: 100)
}
```

### Parámetros

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `marcas` | `number[]` | Array de IDs de marcas a filtrar | No |
| `categorias` | `number[]` | Array de IDs de categorías a filtrar | No |
| `deportes` | `number[]` | Array de IDs de deportes a filtrar | No |
| `is_new` | `boolean` | Filtrar solo productos nuevos (`true`) o usados (`false`) | No |
| `q` | `string` | Texto para buscar en nombre o descripción del producto | No |
| `sort` | `string` | Tipo de ordenamiento. Valores: `price_asc`, `price_desc`, `newest`, `name_asc`, `name_desc` | No |
| `page` | `number` | Número de página (mínimo: 1) | No |
| `per_page` | `number` | Productos por página (mínimo: 1, máximo: 100) | No |

## 📤 Response

```json
{
  "page": 1,
  "per_page": 24,
  "total": 150,
  "total_pages": 7,
  "data": [
    {
      "id": 4,
      "nombre": "Camiseta Cuello V",
      "caracteristicas": "Camiseta deportiva...",
      "id_categoria": 1,
      "nombre_categoria": "Ropa Deportiva",
      "id_deporte": 1,
      "deporte": "Futbol",
      "id_marca": 1,
      "marca": "Nike",
      "es_nuevo": true,
      "precio": "29.99",
      "precio_anterior": "39.99",
      "stock": 50,
      "imagen": "url_de_imagen.jpg"
    }
  ]
}
```

## 🧪 Ejemplos de Uso

### 1. Obtener TODOS los productos (sin filtros)
```json
{
  "page": 1,
  "per_page": 24
}
```

### 2. Filtrar por múltiples marcas (Nike y Reebok)
```json
{
  "marcas": [1, 5],
  "page": 1,
  "per_page": 24
}
```

### 3. Filtrar por múltiples categorías
```json
{
  "categorias": [1, 4],
  "page": 1,
  "per_page": 24
}
```

### 4. Filtrar por marcas Y categorías (combinado)
```json
{
  "marcas": [1, 5],
  "categorias": [1, 4],
  "page": 1,
  "per_page": 24
}
```

### 5. Filtrar por marcas, categorías y solo productos nuevos
```json
{
  "marcas": [1, 5],
  "categorias": [1, 4],
  "is_new": true,
  "page": 1,
  "per_page": 24
}
```

### 6. Búsqueda por texto con filtros
```json
{
  "marcas": [1],
  "categorias": [1],
  "q": "camiseta",
  "sort": "price_asc",
  "page": 1,
  "per_page": 24
}
```

### 7. Solo productos nuevos de Nike, ordenados por precio descendente
```json
{
  "marcas": [1],
  "is_new": true,
  "sort": "price_desc",
  "page": 1,
  "per_page": 24
}
```

## 📊 IDs de Referencia

### Marcas Disponibles
| ID | Marca |
|----|-------|
| 1 | Nike |
| 2 | Adidas |
| 3 | Puma |
| 4 | Under Armour |
| 5 | Reebok |
| 6 | New Balance |
| 7 | Asics |
| 8 | Mizuno |
| 9 | Wilson |
| 10 | Head |
| 11 | Babolat |
| 12 | Yonex |
| 13 | Decathlon |
| 14 | Joma |
| 15 | Umbro |
| 16 | Kappa |
| 17 | Fila |
| 18 | Skechers |
| 19 | Salomon |
| 20 | Everlast |

### Categorías Disponibles
| ID | Categoría |
|----|-----------|
| 1 | Ropa Deportiva |
| 2 | Accesorios |
| 3 | Calzado |
| 4 | Equipamiento |

## 🔧 Testing con cURL

```bash
# Todos los productos
curl -X POST http://localhost:3000/productos/search \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 24}'

# Filtrar por Nike y Reebok
curl -X POST http://localhost:3000/productos/search \
  -H "Content-Type: application/json" \
  -d '{"marcas": [1, 5], "page": 1, "per_page": 24}'

# Filtrar por categorías Ropa y Equipamiento
curl -X POST http://localhost:3000/productos/search \
  -H "Content-Type: application/json" \
  -d '{"categorias": [1, 4], "page": 1, "per_page": 24}'

# Combinado: Nike y Reebok + Ropa y Equipamiento + Solo nuevos
curl -X POST http://localhost:3000/productos/search \
  -H "Content-Type: application/json" \
  -d '{"marcas": [1, 5], "categorias": [1, 4], "is_new": true, "sort": "price_asc", "page": 1, "per_page": 24}'
```

## 🔧 Testing con PowerShell

```powershell
# Todos los productos
$body = @{
    page = 1
    per_page = 24
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/productos/search" -Method POST -Body $body -ContentType "application/json"

# Filtrar por Nike y Reebok
$body = @{
    marcas = @(1, 5)
    page = 1
    per_page = 24
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/productos/search" -Method POST -Body $body -ContentType "application/json"

# Combinado completo
$body = @{
    marcas = @(1, 5)
    categorias = @(1, 4)
    is_new = $true
    sort = "price_asc"
    page = 1
    per_page = 24
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/productos/search" -Method POST -Body $body -ContentType "application/json"
```

## ✅ Características

- ✅ **Sin filtros**: Devuelve todos los productos
- ✅ **Filtros múltiples**: Permite múltiples marcas, categorías y deportes simultáneamente
- ✅ **Búsqueda por texto**: En nombre y descripción
- ✅ **Filtro por productos nuevos**: `is_new: true/false`
- ✅ **Ordenamiento**: Por precio, nombre o más reciente
- ✅ **Paginación**: Control completo de páginas y resultados por página
- ✅ **Respuesta estructurada**: Incluye información de paginación y total de resultados

## 🎯 Notas

1. **Todos los filtros son opcionales**: Si no envías ningún filtro, obtienes todos los productos.
2. **Los arrays vacíos se ignoran**: `"marcas": []` es lo mismo que no enviar el campo.
3. **Validación automática**: Los IDs inválidos se filtran automáticamente.
4. **Límite de resultados**: Máximo 100 productos por página para evitar sobrecarga.
5. **Case insensitive**: La búsqueda por texto no distingue mayúsculas/minúsculas.
