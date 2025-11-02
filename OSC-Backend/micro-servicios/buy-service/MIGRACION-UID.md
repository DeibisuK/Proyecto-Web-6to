# 🔄 Migración Completa: id_usuario (INTEGER) → uid (TEXT)

**Fecha:** 2 de Noviembre, 2025  
**Estado:** ✅ COMPLETADA

---

## 📋 Resumen de Cambios

La migración actualiza el sistema de carrito y pedidos para usar **`uid` de Firebase Auth** en lugar de `id_user` (PK autoincremental de PostgreSQL).

### 🎯 Motivación

- **Antes:** `carrito.id_usuario` → `usuarios.id_user` (INTEGER)
- **Ahora:** `carrito.id_usuario` → `usuarios.uid` (TEXT)

**Ventajas:**
- ✅ Consistencia con Firebase Authentication
- ✅ No requiere conversión uid → id_user en cada request
- ✅ Mayor seguridad (uid no es secuencial)
- ✅ Menos queries a la base de datos

---

## 🗄️ Cambios en Base de Datos

### 1. **Tablas Migradas**

#### **carrito**
```sql
-- ANTES
id_usuario INTEGER NOT NULL
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_user)

-- AHORA
id_usuario TEXT NOT NULL
FOREIGN KEY (id_usuario) REFERENCES usuarios(uid)
```

#### **pedidos**
```sql
-- ANTES
id_usuario INTEGER NOT NULL
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_user)

-- AHORA
id_usuario TEXT NOT NULL
FOREIGN KEY (id_usuario) REFERENCES usuarios(uid)
```

### 2. **Vistas Recreadas**

- ✅ `vw_carrito_items_detalle`: Incluye `id_usuario` (TEXT)
- ✅ `vw_carrito_resumen`: Agrupa por `id_usuario` (TEXT)
- ✅ `vw_pedidos_detalle`: Filtra por `id_usuario` (TEXT)

### 3. **Backups Creados**

- `carrito_backup_uid_migration`
- `pedidos_backup_uid_migration`
- `items_carrito_backup` (de migración anterior)
- `detalle_pedidos_backup` (de migración anterior)

### 4. **Índices Creados**

```sql
CREATE INDEX idx_carrito_uid_usuario ON carrito(id_usuario);
CREATE INDEX idx_pedidos_uid_usuario ON pedidos(id_usuario);
```

---

## 💻 Cambios en Backend

### 1. **Rutas Actualizadas**

```javascript
// ❌ ANTES
router.get('/cart/:id_usuario', getCart);
router.post('/cart/:id_usuario/items', addItemToCart);
router.delete('/cart/:id_usuario', clearCart);
router.post('/orders/user/:id_usuario', createOrderFromCart);
router.get('/orders/user/:id_usuario', getOrders);

// ✅ AHORA
router.get('/cart/:uid', getCart);
router.post('/cart/:uid/items', addItemToCart);
router.delete('/cart/:uid', clearCart);
router.post('/orders/user/:uid', createOrderFromCart);
router.get('/orders/user/:uid', getOrders);
```

### 2. **Controladores Actualizados**

```javascript
// buy.controller.js
export const getCart = async (req, res) => {
    const id_usuario = req.params.uid; // uid de Firebase Auth
    const cart = await carritoService.getCartByUserId(id_usuario);
    // ...
};

export const addItemToCart = async (req, res) => {
    const id_usuario = req.params.uid; // uid de Firebase Auth
    // ...
};

// pedidos.controller.js
export const createOrderFromCart = async (req, res) => {
    const id_usuario = req.params.uid; // uid de Firebase Auth
    // ...
};

export const getOrders = async (req, res) => {
    const id_usuario = req.params.uid; // uid de Firebase Auth
    // ...
};
```

### 3. **Modelos y Servicios**

Los modelos y servicios **NO requirieron cambios** porque ya usaban la variable `id_usuario`, que ahora acepta TEXT en lugar de INTEGER.

---

## 🌐 Nuevos Endpoints de la API

### **Carrito**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cart/:uid` | Obtener carrito del usuario |
| POST | `/api/cart/:uid/items` | Agregar item al carrito |
| PUT | `/api/cart/items/:id_item` | Actualizar cantidad |
| DELETE | `/api/cart/items/:id_item` | Eliminar item |
| DELETE | `/api/cart/:uid` | Vaciar carrito |

### **Pedidos**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders/user/:uid` | Crear pedido desde carrito |
| GET | `/api/orders/user/:uid` | Obtener pedidos del usuario |
| GET | `/api/orders/:id_pedido` | Obtener detalle de pedido |
| PUT | `/api/orders/:id_pedido/status` | Actualizar estado |

---

## 📝 Ejemplo de Uso

### **Frontend (Angular)**

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';

export class CarritoService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  async agregarAlCarrito(id_variante: number, cantidad: number) {
    const uid = this.auth.currentUser?.uid; // UID de Firebase Auth
    
    return this.http.post(`/api/cart/${uid}/items`, {
      id_variante,
      cantidad
    }).toPromise();
  }

  async obtenerCarrito() {
    const uid = this.auth.currentUser?.uid;
    return this.http.get(`/api/cart/${uid}`).toPromise();
  }

  async crearPedido() {
    const uid = this.auth.currentUser?.uid;
    return this.http.post(`/api/orders/user/${uid}`, {}).toPromise();
  }
}
```

### **Ejemplo de Request**

```http
POST /api/cart/Xyz1Ab2Cd3Ef4Gh5Ij6Kl7/items
Content-Type: application/json

{
  "id_variante": 9,
  "cantidad": 2
}
```

### **Ejemplo de Response**

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

---

## ⚠️ Breaking Changes

### Para Frontend

**Cambios obligatorios:**

1. ✅ Usar `uid` de Firebase Auth en lugar de `id_usuario` numérico
2. ✅ Actualizar URLs de endpoints:
   - `/api/cart/:id_usuario` → `/api/cart/:uid`
   - `/api/orders/user/:id_usuario` → `/api/orders/user/:uid`
3. ✅ Asegurarse de tener el usuario autenticado antes de llamar a la API

**Ejemplo de migración:**

```typescript
// ❌ ANTES (NO FUNCIONA)
const id_usuario = 123; // ID numérico
http.get(`/api/cart/${id_usuario}`)

// ✅ AHORA (CORRECTO)
const uid = auth.currentUser?.uid; // "Xyz1Ab2Cd3Ef4Gh5Ij6Kl7"
http.get(`/api/cart/${uid}`)
```

---

## 🔍 Verificación Post-Migración

### 1. **Verificar estructura de tablas**

```sql
-- Verificar tipo de columna id_usuario en carrito
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'carrito' 
    AND column_name = 'id_usuario';
-- Resultado esperado: data_type = 'text'

-- Verificar FK
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'carrito' 
    AND tc.constraint_type = 'FOREIGN KEY';
-- Resultado esperado: foreign_table = 'usuarios', foreign_column = 'uid'
```

### 2. **Verificar vistas**

```sql
-- Verificar que las vistas funcionan correctamente
SELECT * FROM vw_carrito_items_detalle LIMIT 1;
SELECT * FROM vw_carrito_resumen LIMIT 1;
SELECT * FROM vw_pedidos_detalle LIMIT 1;
```

### 3. **Test de endpoints**

```bash
# Obtener carrito
curl -X GET http://localhost:3000/api/cart/Xyz1Ab2Cd3Ef4Gh5Ij6Kl7

# Agregar item
curl -X POST http://localhost:3000/api/cart/Xyz1Ab2Cd3Ef4Gh5Ij6Kl7/items \
  -H "Content-Type: application/json" \
  -d '{"id_variante": 9, "cantidad": 2}'

# Crear pedido
curl -X POST http://localhost:3000/api/orders/user/Xyz1Ab2Cd3Ef4Gh5Ij6Kl7
```

---

## 🔙 Rollback (Si es necesario)

En caso de necesitar revertir los cambios:

```sql
-- 1. Eliminar vistas actuales
DROP VIEW IF EXISTS vw_carrito_items_detalle CASCADE;
DROP VIEW IF EXISTS vw_carrito_resumen CASCADE;
DROP VIEW IF EXISTS vw_pedidos_detalle CASCADE;

-- 2. Restaurar tabla carrito
DROP TABLE carrito;
ALTER TABLE carrito_backup_uid_migration RENAME TO carrito;

-- 3. Restaurar tabla pedidos
DROP TABLE pedidos;
ALTER TABLE pedidos_backup_uid_migration RENAME TO pedidos;

-- 4. Recrear vistas originales
-- (Ejecutar scripts de creación de vistas anteriores)
```

---

## ✅ Checklist de Migración

- [x] Crear backups de `carrito` y `pedidos`
- [x] Migrar tabla `carrito` a usar `uid` (TEXT)
- [x] Migrar tabla `pedidos` a usar `uid` (TEXT)
- [x] Recrear vistas con `id_usuario` como TEXT
- [x] Actualizar rutas de la API (`:id_usuario` → `:uid`)
- [x] Actualizar controladores (`req.params.uid`)
- [x] Actualizar documentación (`API-DOCUMENTATION.md`)
- [ ] Actualizar frontend Angular (pendiente)
- [ ] Testing completo del flujo de compra
- [ ] Desplegar a producción

---

## 📚 Archivos Modificados

### Base de Datos
- `carrito` (migración de columna)
- `pedidos` (migración de columna)
- `vw_carrito_items_detalle` (vista recreada)
- `vw_carrito_resumen` (vista recreada)
- `vw_pedidos_detalle` (vista recreada)

### Backend
- `buy.routes.js` (URLs actualizadas)
- `buy.controller.js` (`req.params.uid`)
- `pedidos.controller.js` (`req.params.uid`)
- `API-DOCUMENTATION.md` (documentación actualizada)

### Frontend (Pendiente)
- `carrito.service.ts` (usar Firebase Auth uid)
- Componentes que llaman al carrito
- Componentes que crean pedidos

---

**Migración completada exitosamente** 🎉
