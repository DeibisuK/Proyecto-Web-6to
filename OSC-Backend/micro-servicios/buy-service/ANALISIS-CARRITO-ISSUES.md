# 🔍 Análisis: Problemas del Sistema de Carrito y Pedidos

## 📊 Estado Actual de la Base de Datos

### ✅ Tablas Existentes
1. **`carrito`** - Carrito por usuario
2. **`items_carrito`** - Items en el carrito
3. **`pedidos`** - Órdenes/pedidos realizados
4. **`detalle_pedidos`** - Detalles de cada pedido

### 🔴 PROBLEMA CRÍTICO IDENTIFICADO

## ⚠️ Incompatibilidad entre Modelo Actual y Nuevo Sistema de Productos

### **El Problema:**
La base de datos **HA CAMBIADO** de un modelo simple de productos a un **modelo de productos con variantes**, pero las tablas del carrito y pedidos **NO SE HAN ACTUALIZADO** para reflejar esto.

### **Modelo Antiguo (ACTUAL en carrito/pedidos):**
```
productos
├── id_producto (PK)
├── nombre
├── precio  ❌ YA NO EXISTE
└── stock   ❌ YA NO EXISTE
```

### **Modelo Nuevo (ACTUAL en la BD):**
```
productos
├── id_producto (PK)
├── nombre
├── descripcion
├── id_categoria
├── id_deporte
├── id_marca
└── es_nuevo

variantes_productos  ← AQUÍ está el precio y stock
├── id_variante (PK)
├── id_producto (FK)
├── sku
├── precio ✅
├── stock ✅
├── url_images
└── previous_price

variante_valores
├── id_variante (FK)
└── id_valor (FK)

valores_opcion
├── id_valor (PK)
├── id_opcion (FK)
└── valor (ej: "Rojo", "XL", "42")

opciones_productos
├── id_opcion (PK)
└── nombre (ej: "Color", "Talla", "Número")
```

### **Ejemplo Real de Producto con Variantes:**
```json
{
  "producto": "Camiseta Deportiva Premium",
  "id_producto": 5,
  "variantes": [
    {
      "id_variante": 9,
      "sku": "CAM-PREM-VER-XL",
      "precio": 34.99,
      "stock": 40,
      "opciones": [
        {"opcion": "Color", "valor": "Verde"},
        {"opcion": "Talla", "valor": "XL"}
      ]
    },
    {
      "id_variante": 14,
      "sku": "CAM-PREM-DOR-S",
      "precio": 34.99,
      "stock": 30,
      "opciones": [
        {"opcion": "Color", "valor": "Dorado"},
        {"opcion": "Talla", "valor": "S"}
      ]
    }
  ]
}
```

---

## 🚨 PROBLEMAS ESPECÍFICOS

### 1. **Tabla `items_carrito` - Referencia Incorrecta**

**Estado Actual:**
```sql
CREATE TABLE items_carrito (
    id_item SERIAL PRIMARY KEY,
    id_carrito INTEGER REFERENCES carrito(id_carrito),
    id_producto INTEGER REFERENCES productos(id_producto),  ❌ PROBLEMA
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL
);
```

**Problema:**
- Referencia a `id_producto` cuando debería referenciar `id_variante`
- No hay forma de saber qué talla/color específico el usuario quiere
- No puede obtener el precio correcto porque el precio está en `variantes_productos`

**Debe ser:**
```sql
CREATE TABLE items_carrito (
    id_item SERIAL PRIMARY KEY,
    id_carrito INTEGER REFERENCES carrito(id_carrito),
    id_variante INTEGER REFERENCES variantes_productos(id_variante),  ✅
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL
);
```

### 2. **Tabla `detalle_pedidos` - Mismo Problema**

**Estado Actual:**
```sql
CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido),
    id_producto INTEGER REFERENCES productos(id_producto),  ❌ PROBLEMA
    cantidad INTEGER NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL
);
```

**Debe ser:**
```sql
CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido),
    id_variante INTEGER REFERENCES variantes_productos(id_variante),  ✅
    cantidad INTEGER NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL
);
```

---

## 📝 CONSULTAS INCORRECTAS EN EL CÓDIGO

### **Archivo: `items_carrito.model.js`**

**Línea con problema:**
```javascript
// ❌ INCORRECTO - id_producto ya no tiene precio
export const create = async (item) => {
    const { id_carrito, id_producto, cantidad, precio_unitario } = item;
    const result = await pool.query(
        'INSERT INTO items_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_carrito, id_producto, cantidad, precio_unitario]
    );
    return result.rows[0];
};
```

**Debe ser:**
```javascript
// ✅ CORRECTO - usar id_variante
export const create = async (item) => {
    const { id_carrito, id_variante, cantidad, precio_unitario } = item;
    const result = await pool.query(
        'INSERT INTO items_carrito (id_carrito, id_variante, cantidad, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_carrito, id_variante, cantidad, precio_unitario]
    );
    return result.rows[0];
};
```

### **Archivo: `detalle_pedido.model.js`**

**Línea con problema:**
```javascript
// ❌ INCORRECTO
export const create = async (detalle) => {
    const { id_pedido, id_producto, cantidad, precio_venta } = detalle;
    const result = await pool.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_venta) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_pedido, id_producto, cantidad, precio_venta]
    );
    return result.rows[0];
};
```

**Debe ser:**
```javascript
// ✅ CORRECTO
export const create = async (detalle) => {
    const { id_pedido, id_variante, cantidad, precio_venta } = detalle;
    const result = await pool.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_variante, cantidad, precio_venta) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_pedido, id_variante, cantidad, precio_venta]
    );
    return result.rows[0];
};
```

---

## 🔧 SOLUCIÓN PROPUESTA

### **Opción 1: Migración de Base de Datos (RECOMENDADO)**

1. **Modificar columnas en tablas existentes**
   - Cambiar `id_producto` por `id_variante` en `items_carrito`
   - Cambiar `id_producto` por `id_variante` en `detalle_pedidos`
   - Actualizar las foreign keys

2. **Actualizar todos los modelos del backend**
3. **Actualizar el servicio de carrito en Angular**

### **Opción 2: Mantener Compatibilidad (NO RECOMENDADO)**

- Agregar ambas columnas (`id_producto` e `id_variante`)
- Más complejo de mantener
- Datos redundantes

---

## 📋 CHECKLIST DE CAMBIOS NECESARIOS

### **Base de Datos:**
- [x] Migración: Renombrar `items_carrito.id_producto` → `items_carrito.id_variante`
- [x] Migración: Actualizar FK en `items_carrito`
- [x] Migración: Renombrar `detalle_pedidos.id_producto` → `detalle_pedidos.id_variante`
- [x] Migración: Actualizar FK en `detalle_pedidos`
- [x] Crear vistas útiles para consultas
- [x] Crear funciones de validación

### **Backend (buy-service):**
- [x] Actualizar `items_carrito.model.js`
- [x] Actualizar `detalle_pedido.model.js`
- [x] Actualizar `carrito.service.js`
- [x] Actualizar `pedidos.service.js`
- [x] Actualizar `items_carrito.service.js`
- [x] Actualizar controladores relacionados
- [ ] Actualizar rutas/API (si es necesario)

### **Frontend (Angular):**
- [ ] Actualizar `CarritoService` para enviar `id_variante`
- [ ] Actualizar interfaces/modelos TypeScript
- [ ] Actualizar componentes del carrito

---

## ⚡ IMPACTO

**ALTO** - El sistema actual **NO FUNCIONA** con el modelo de productos nuevo.

- ❌ No se puede agregar productos al carrito correctamente
- ❌ No se puede obtener el precio correcto
- ❌ No se puede validar el stock
- ❌ No se puede crear pedidos válidos

---

## 🎯 PRÓXIMOS PASOS

1. **Crear script de migración SQL** para actualizar las tablas
2. **Actualizar modelos del backend**
3. **Actualizar servicios del backend**
4. **Actualizar frontend de Angular**
5. **Probar flujo completo: agregar al carrito → checkout → crear pedido**

---

**Fecha de análisis:** 2 de Noviembre, 2025
**Analizado por:** GitHub Copilot
**Estado:** ⚠️ REQUIERE ACCIÓN INMEDIATA
