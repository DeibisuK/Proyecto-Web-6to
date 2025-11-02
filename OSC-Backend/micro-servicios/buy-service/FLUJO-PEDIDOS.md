# 📦 Flujo Completo de Gestión de Pedidos

## 🔄 **Estados de un Pedido**

```
Pendiente → En Proceso → Enviado → Entregado
              ↓
           Cancelado (opcional)
```

---

## 📋 **Descripción de Estados**

| Estado | Descripción | Quién lo actualiza |
|--------|-------------|-------------------|
| **Pendiente** | Pedido creado, esperando procesamiento | Sistema (automático) |
| **En Proceso** | Pedido siendo preparado/empacado | Admin/Staff |
| **Enviado** | Pedido en tránsito hacia el cliente | Admin/Staff |
| **Entregado** | Pedido recibido por el cliente | Admin/Staff o Cliente |
| **Cancelado** | Pedido cancelado (antes de enviar) | Admin o Cliente |

---

## 🎯 **Flujo desde el Cliente**

### **1. Cliente crea el pedido**

```http
POST /api/orders/user/:uid
```

**Respuesta:**
```json
{
  "message": "Pedido creado exitosamente",
  "pedido": {
    "id_pedido": 2,
    "id_usuario": "firebase_uid_abc123",
    "total": "279.92",
    "estado_pedido": "Pendiente",
    "uuid_factura": "378d72b1-71f0-4fa3-8db5-6951f999a45f",
    "fecha_pedido": "2025-11-02"
  }
}
```

**Lo que sucede automáticamente:**
- ✅ Valida stock de todos los items
- ✅ Crea el pedido con estado "Pendiente"
- ✅ Genera UUID único para la factura
- ✅ Crea detalles del pedido (items)
- ✅ Limpia el carrito del usuario

---

### **2. Cliente consulta sus pedidos**

```http
GET /api/orders/user/:uid
```

**Respuesta:**
```json
[
  {
    "id_pedido": 2,
    "id_usuario": "firebase_uid_abc123",
    "fecha_pedido": "2025-11-02",
    "total": "279.92",
    "estado_pedido": "Pendiente",
    "uuid_factura": "378d72b1-71f0-4fa3-8db5-6951f999a45f"
  },
  {
    "id_pedido": 1,
    "id_usuario": "firebase_uid_abc123",
    "fecha_pedido": "2025-11-01",
    "total": "149.95",
    "estado_pedido": "Entregado",
    "uuid_factura": "..."
  }
]
```

---

### **3. Cliente ve detalle de un pedido**

```http
GET /api/orders/:id_pedido
```

**Respuesta:**
```json
{
  "id_pedido": 2,
  "id_usuario": "firebase_uid_abc123",
  "fecha_pedido": "2025-11-02",
  "total": "279.92",
  "estado_pedido": "Enviado",
  "uuid_factura": "378d72b1-71f0-4fa3-8db5-6951f999a45f",
  "detalles": [
    {
      "id_detalle": 1,
      "id_variante": 9,
      "cantidad": 8,
      "precio_venta": "34.99",
      "nombre_producto": "Camiseta Deportiva Premium",
      "sku": "CAM-PREM-VER-XL",
      "opciones": [
        {"opcion": "Color", "valor": "Verde"},
        {"opcion": "Talla", "valor": "XL"}
      ]
    }
  ]
}
```

---

## 👨‍💼 **Flujo desde el Admin**

### **1. Admin ve todos los pedidos pendientes**

```http
GET /api/orders/pending
```

*(Necesitarías crear este endpoint para el panel de admin)*

---

### **2. Admin actualiza estado del pedido**

#### **A. Marcar como "En Proceso"**
```http
PUT /api/orders/:id_pedido/status
Content-Type: application/json

{
  "estado_pedido": "En Proceso"
}
```

**Cuándo:** Cuando el admin empieza a preparar el pedido.

---

#### **B. Marcar como "Enviado"**
```http
PUT /api/orders/:id_pedido/status
Content-Type: application/json

{
  "estado_pedido": "Enviado"
}
```

**Cuándo:** Cuando el pedido sale de bodega/almacén.

**Funcionalidad adicional recomendada:**
- Enviar email/notificación al cliente
- Incluir número de seguimiento (tracking)

---

#### **C. Marcar como "Entregado"**
```http
PUT /api/orders/:id_pedido/status
Content-Type: application/json

{
  "estado_pedido": "Entregado"
}
```

**Cuándo:** Cuando el cliente confirma recepción o el transportista marca como entregado.

---

#### **D. Cancelar Pedido**
```http
PUT /api/orders/:id_pedido/status
Content-Type: application/json

{
  "estado_pedido": "Cancelado"
}
```

**Cuándo:** 
- Cliente solicita cancelación (antes de envío)
- Admin cancela por falta de stock
- Cliente no completa el pago

**⚠️ Consideración importante:** Si cancelas un pedido, deberías devolver el stock a las variantes.

---

## 🚀 **Mejoras Recomendadas**

### **1. Agregar campo de tracking (rastreo)**

Actualiza el modelo de pedidos:

```sql
ALTER TABLE pedidos 
ADD COLUMN numero_seguimiento VARCHAR(100),
ADD COLUMN courier VARCHAR(50);
```

Endpoint para actualizar tracking:

```http
PUT /api/orders/:id_pedido/tracking
Content-Type: application/json

{
  "numero_seguimiento": "TR123456789",
  "courier": "DHL"
}
```

---

### **2. Historial de cambios de estado**

Crear tabla para auditoría:

```sql
CREATE TABLE historial_estados_pedido (
    id_historial SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido),
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_por TEXT  -- uid del usuario/admin que hizo el cambio
);
```

---

### **3. Notificaciones por Email/Push**

Cuando el estado cambia, enviar notificación al cliente:

```javascript
// En pedidos.service.js
export const updateOrderStatus = async (id, estado_pedido) => {
    const pedido = await model.updateStatus(id, estado_pedido);
    
    // Enviar notificación al cliente
    await sendOrderStatusEmail(pedido.id_usuario, pedido.id_pedido, estado_pedido);
    
    return pedido;
};
```

---

### **4. Devolución de stock al cancelar**

```javascript
export const cancelOrder = async (id_pedido) => {
    // Obtener detalles del pedido
    const detalles = await detallePedidoModel.findByOrderId(id_pedido);
    
    // Devolver stock de cada variante
    for (const detalle of detalles) {
        await variantesModel.incrementStock(detalle.id_variante, detalle.cantidad);
    }
    
    // Actualizar estado a Cancelado
    return await model.updateStatus(id_pedido, 'Cancelado');
};
```

---

### **5. Restricciones de transiciones de estado**

No todas las transiciones deberían ser permitidas:

```javascript
const VALID_TRANSITIONS = {
    'Pendiente': ['En Proceso', 'Cancelado'],
    'En Proceso': ['Enviado', 'Cancelado'],
    'Enviado': ['Entregado'],
    'Entregado': [],  // Estado final
    'Cancelado': []   // Estado final
};

export const updateOrderStatus = async (id, nuevo_estado) => {
    const pedido = await model.findById(id);
    const estado_actual = pedido.estado_pedido;
    
    if (!VALID_TRANSITIONS[estado_actual].includes(nuevo_estado)) {
        throw new Error(`No se puede cambiar de "${estado_actual}" a "${nuevo_estado}"`);
    }
    
    return await model.updateStatus(id, nuevo_estado);
};
```

---

## 📱 **Ejemplo de UI para Cliente**

### **Vista de "Mis Pedidos"**

```
┌─────────────────────────────────────────────────────┐
│ Mis Pedidos                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📦 Pedido #2                                        │
│    Estado: 🚚 Enviado                               │
│    Total: $279.92                                   │
│    Fecha: 2 Nov 2025                                │
│    UUID: 378d72b1-71f0-4fa3-8db5-6951f999a45f      │
│    [Ver Detalle] [Rastrear]                        │
│                                                     │
│ ✅ Pedido #1                                        │
│    Estado: ✓ Entregado                             │
│    Total: $149.95                                   │
│    Fecha: 1 Nov 2025                                │
│    [Ver Detalle] [Descargar Factura]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **Endpoints Adicionales Recomendados**

### **Para Admin:**

```http
# Obtener todos los pedidos
GET /api/admin/orders

# Obtener pedidos por estado
GET /api/admin/orders?estado=Pendiente

# Obtener pedidos por fecha
GET /api/admin/orders?desde=2025-11-01&hasta=2025-11-30

# Estadísticas de pedidos
GET /api/admin/orders/stats
```

### **Para Cliente:**

```http
# Cancelar pedido (solo si está Pendiente)
POST /api/orders/:id_pedido/cancel

# Solicitar factura
GET /api/orders/:id_pedido/invoice

# Rastrear pedido
GET /api/orders/:id_pedido/tracking
```

---

## 📊 **Dashboard de Admin (Ejemplo)**

```
┌─────────────────────────────────────────────────────┐
│ Panel de Pedidos                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Pendientes: 12  │  En Proceso: 5  │  Enviados: 8   │
│                                                     │
│ Pedidos Recientes:                                  │
│                                                     │
│ #2 - Jhon (rTA4VWrt...)    $279.92    🟡 Enviado   │
│    [Ver] [Actualizar] [Cancelar]                   │
│                                                     │
│ #1 - Jhon Cruz (aVFwpya...)  $149.95  🟢 Entregado │
│    [Ver] [Descargar Factura]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ **Resumen del Flujo Actual**

**Lo que ya tienes funcionando:**
- ✅ Crear pedido desde carrito
- ✅ Obtener pedidos del usuario
- ✅ Obtener detalle de pedido
- ✅ Actualizar estado del pedido

**Lo que podrías agregar:**
- 📧 Notificaciones por email
- 📦 Número de rastreo/tracking
- 📊 Panel de admin para gestión
- 🔄 Devolución de stock al cancelar
- 📜 Historial de cambios de estado
- 🚫 Validación de transiciones de estado
- 📄 Generación de factura PDF

---

**¿Quieres que implemente alguna de estas funcionalidades adicionales?** 🚀
