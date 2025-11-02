# 📘 API Actualizada del Buy-Service

## ✅ Migración Completada (2025-11-02)

### 🎯 Cambios Principales

La API del carrito ahora trabaja con **variantes de productos** en lugar de productos directos.

---

## 📍 Endpoints del Carrito

### 1. **Obtener Carrito del Usuario**

```http
GET /api/cart/:uid
```

**Parámetros:**
- `uid` (URL): UID del usuario (Firebase Auth ID)

**Response:**
```json
{
  "id_carrito": 1,
  "id_usuario": "firebase_uid_abc123xyz",
  "fecha_creacion": "2025-11-02",
  "items": [
    {
      "id_item": 1,
      "id_carrito": 1,
      "id_variante": 9,
      "cantidad": 2,
      "precio_unitario": "34.99",
      "subtotal": "69.98",
      "id_producto": 5,
      "nombre_producto": "Camiseta Deportiva Premium",
      "descripcion": "Camiseta de alto rendimiento...",
      "es_nuevo": true,
      "sku": "CAM-PREM-VER-XL",
      "precio_actual": "34.99",
      "precio_anterior": "39.99",
      "stock": 40,
      "url_images": [...],
      "nombre_categoria": "Ropa Deportiva",
      "nombre_deporte": "Fútbol",
      "nombre_marca": "Nike",
      "opciones": [
        {"opcion": "Color", "valor": "Verde"},
        {"opcion": "Talla", "valor": "XL"}
      ]
    }
  ],
  "resumen": {
    "total_items": 1,
    "total_productos": 2,
    "total_carrito": "69.98"
  }
}
```

---

### 2. **Agregar Item al Carrito**

```http
POST /api/cart/:uid/items
```

**Parámetros:**
- `uid` (URL): UID del usuario (Firebase Auth ID)

**Body:**
```json
{
  "id_variante": 9,
  "cantidad": 2
}
```

**Notas:**
- ✅ `id_variante` es **obligatorio** (antes era `id_producto`)
- ✅ El precio se obtiene automáticamente de la base de datos
- ✅ Se valida stock automáticamente
- ✅ Si el item ya existe, incrementa la cantidad

**Response (Éxito):**
```json
{
  "message": "Item agregado al carrito exitosamente",
  "item": {
    "id_item": 1,
    "id_carrito": 1,
    "id_variante": 9,
    "cantidad": 2,
    "precio_unitario": "34.99"
  }
}
```

**Response (Error - Stock Insuficiente):**
```json
{
  "message": "Stock insuficiente para la variante solicitada"
}
```

---

### 3. **Actualizar Cantidad de Item**

```http
PUT /api/cart/items/:id_item
```

**Body:**
```json
{
  "cantidad": 5
}
```

**Notas:**
- ✅ Valida stock antes de actualizar
- ✅ Cantidad mínima: 1

**Response:**
```json
{
  "message": "Item actualizado exitosamente",
  "item": {
    "id_item": 1,
    "id_carrito": 1,
    "id_variante": 9,
    "cantidad": 5,
    "precio_unitario": "34.99"
  }
}
```

---

### 4. **Eliminar Item del Carrito**

```http
DELETE /api/cart/items/:id_item
```

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

---

### 5. **Vaciar Carrito**

```http
DELETE /api/cart/:uid
```

**Parámetros:**
- `uid` (URL): UID del usuario (Firebase Auth ID)

**Response:**
```json
{
  "message": "Cart cleared"
}
```

---

## 📦 Endpoints de Pedidos

### 1. **Crear Pedido desde Carrito**

```http
POST /api/orders/user/:uid
```

**Parámetros:**
- `uid` (URL): UID del usuario (Firebase Auth ID)

**Notas:**
- ✅ Valida stock de todos los items
- ✅ Limpia el carrito automáticamente
- ✅ Genera UUID de factura

**Response (Éxito):**
```json
{
  "message": "Pedido creado exitosamente",
  "pedido": {
    "id_pedido": 1,
    "id_usuario": "firebase_uid_abc123xyz",
    "fecha_pedido": "2025-11-02",
    "total": "69.98",
    "estado_pedido": "Pendiente",
    "uuid_factura": "550e8400-e29b-41d4-a716-446655440000",
    "detalles": [
      {
        "id_variante": 9,
        "cantidad": 2,
        "precio_unitario": "34.99",
        "subtotal": "69.98",
        "nombre_producto": "Camiseta Deportiva Premium",
        "sku": "CAM-PREM-VER-XL",
        "opciones": [
          {"opcion": "Color", "valor": "Verde"},
          {"opcion": "Talla", "valor": "XL"}
        ]
      }
    ]
  }
}
```

**Response (Error - Stock Insuficiente):**
```json
{
  "message": "Stock insuficiente para: Camiseta Deportiva Premium (CAM-PREM-VER-XL)"
}
```

---

### 2. **Obtener Pedidos del Usuario**

```http
GET /api/orders/user/:uid
```

**Parámetros:**
- `uid` (URL): UID del usuario (Firebase Auth ID)

**Response:**
```json
[
  {
    "id_pedido": 1,
    "id_usuario": "firebase_uid_abc123xyz",
    "fecha_pedido": "2025-11-02",
    "total": "69.98",
    "estado_pedido": "Pendiente",
    "uuid_factura": "550e8400-e29b-41d4-a716-446655440000"
  }
]
```

---

### 3. **Obtener Detalle de un Pedido**

```http
GET /api/orders/:id_pedido
```

**Parámetros:**
- `id_pedido` (URL): ID del pedido

**Response:**
```json
{
  "id_pedido": 1,
  "id_usuario": "firebase_uid_abc123xyz",
  "fecha_pedido": "2025-11-02",
  "total": "69.98",
  "estado_pedido": "Pendiente",
  "uuid_factura": "550e8400-e29b-41d4-a716-446655440000",
  "detalles": [
    {
      "id_detalle": 1,
      "id_variante": 9,
      "cantidad": 2,
      "precio_venta": "34.99",
      "nombre_producto": "Camiseta Deportiva Premium",
      "sku": "CAM-PREM-VER-XL",
      "opciones": [...]
    }
  ]
}
```

---

### 4. **Actualizar Estado del Pedido**

```http
PUT /api/orders/:id_pedido/status
```

**Parámetros:**
- `id_pedido` (URL): ID del pedido

**Body:**
```json
{
  "estado_pedido": "Enviado"
}
```

**Posibles estados:**
- `Pendiente`
- `En Proceso`
- `Enviado`
- `Entregado`
- `Cancelado`

---

## 🔧 Funciones de Base de Datos Disponibles

### 1. **Validar Stock**
```sql
SELECT fn_validar_stock_carrito(id_variante, cantidad);
```
Retorna `true` si hay stock suficiente, `false` si no.

### 2. **Obtener Precio de Variante**
```sql
SELECT fn_obtener_precio_variante(id_variante);
```
Retorna el precio actual de la variante.

---

## 📊 Vistas Útiles

### 1. **vw_carrito_items_detalle**
Vista completa de items del carrito con información de producto, variante, opciones, etc.

```sql
SELECT * FROM vw_carrito_items_detalle WHERE id_carrito = 1;
```

### 2. **vw_carrito_resumen**
Resumen del carrito: total de items, productos y monto total.

```sql
SELECT * FROM vw_carrito_resumen WHERE id_usuario = 'firebase_uid_abc123xyz';
```

### 3. **vw_pedidos_detalle**
Vista completa de pedidos con detalles de productos y variantes.

```sql
SELECT * FROM vw_pedidos_detalle WHERE id_usuario = 'firebase_uid_abc123xyz';
```

---

## 🔄 Cambios Principales en la API

### ❌ **Antes (DEPRECATED):**
```json
{
  "id_producto": 5,
  "cantidad": 2,
  "precio_unitario": 34.99
}
```

### ✅ **Ahora (CORRECTO):**
```json
{
  "id_variante": 9,  // Identifica producto + opciones (color, talla, etc.)
  "cantidad": 2
  // El precio se obtiene automáticamente
}
```

---

## 🎯 Validaciones Automáticas

1. **Stock Insuficiente**: Se valida antes de agregar al carrito y antes de crear pedido
2. **Precio Automático**: El precio siempre se obtiene de la base de datos
3. **Variante Existente**: Se verifica que la variante exista
4. **Cantidad Mínima**: La cantidad debe ser >= 1

---

## 🚀 Próximos Pasos (Frontend)

Para actualizar el frontend de Angular:

1. **Usar `uid` de Firebase Auth** en lugar de `id_usuario`
2. **Actualizar llamadas HTTP** para enviar `uid` en la URL
3. **Modificar `CarritoService.agregarProducto()`** para enviar `id_variante`
4. **Actualizar interfaz de selección** de opciones (talla, color, etc.)
5. **Capturar `id_variante`** en lugar de `id_producto` al agregar al carrito

**Ejemplo de cambio en el frontend:**
```typescript
// ❌ Antes
http.post(`/api/cart/${id_usuario}/items`, { id_producto: 5, cantidad: 2 })

// ✅ Ahora
http.post(`/api/cart/${uid}/items`, { id_variante: 9, cantidad: 2 })
```

---

**Fecha:** 2 de Noviembre, 2025  
**Estado:** ✅ Backend Actualizado - Usando UID de Firebase Auth
