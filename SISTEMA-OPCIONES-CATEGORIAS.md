# Sistema de Opciones por Categoría - Implementación Completa

**Fecha:** 3 de Noviembre, 2025  
**Estado:** ✅ Completado

## 📋 Resumen

Se ha implementado un sistema que permite que cada categoría de producto (Ropa, Calzado, Accesorios, Equipamiento) tenga opciones específicas y diferenciadas.

### Problema Anterior
- ❌ Todas las categorías compartían las mismas opciones globales
- ❌ Calzado usaba tallas de ropa (S, M, L, XL) en lugar de tallas numéricas
- ❌ No había diferenciación entre tipos de productos

### Solución Implementada
- ✅ Tabla intermedia `categoria_opciones` vincula categorías con opciones específicas
- ✅ Calzado usa tallas numéricas (35-47)
- ✅ Ropa usa tallas de letras (XS-XXL)
- ✅ Cada categoría tiene opciones relevantes (Material, Tecnología, Tipo de Suela, etc.)

---

## 🗄️ Cambios en Base de Datos

### 1. Nueva Tabla: `categoria_opciones`

```sql
CREATE TABLE categoria_opciones (
    id_categoria INTEGER NOT NULL,
    id_opcion INTEGER NOT NULL,
    orden INTEGER DEFAULT 1,
    PRIMARY KEY (id_categoria, id_opcion),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
    FOREIGN KEY (id_opcion) REFERENCES opciones_productos(id_opcion) ON DELETE CASCADE
);
```

**Propósito:** Define qué opciones están disponibles para cada categoría.

### 2. Nuevas Opciones Creadas

| ID | Nombre           | Descripción                              |
|----|------------------|------------------------------------------|
| 1  | Color            | Colores disponibles (global)             |
| 2  | Talla Ropa       | Tallas de ropa (XS, S, M, L, XL, XXL)    |
| 3  | Talla Calzado    | Tallas numéricas (35-47 con medios)      |
| 4  | Material         | Materiales (Cuero, Textil, Mesh, etc.)   |
| 5  | Tipo de Suela    | Tipos de suela (Goma, EVA, Caucho, etc.) |
| 6  | Tecnología       | Tecnologías (Air Max, Boost, etc.)       |

### 3. Valores de Opciones

#### Talla Calzado (24 valores)
```
35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5,
40, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44, 44.5,
45, 45.5, 46, 47
```

#### Talla Ropa (6 valores)
```
XS, S, M, L, XL, XXL
```

### 4. Configuración de Categorías

#### Calzado (id: 3)
| Opción          | Orden | Total Valores |
|-----------------|-------|---------------|
| Color           | 1     | 6             |
| Talla Calzado   | 2     | 24            |
| Material        | 3     | 8             |
| Tipo de Suela   | 4     | 6             |
| Tecnología      | 5     | 7             |

#### Ropa Deportiva (id: 1)
| Opción          | Orden | Total Valores |
|-----------------|-------|---------------|
| Color           | 1     | 6             |
| Talla Ropa      | 2     | 6             |
| Material        | 3     | 8             |
| Tecnología      | 4     | 7             |

#### Accesorios (id: 2)
| Opción          | Orden | Total Valores |
|-----------------|-------|---------------|
| Color           | 1     | 6             |
| Material        | 2     | 8             |

#### Equipamiento (id: 4)
| Opción          | Orden | Total Valores |
|-----------------|-------|---------------|
| Color           | 1     | 6             |
| Material        | 2     | 8             |

---

## 🔧 Cambios en Backend

### Archivos Modificados

1. **`producto.model.js`** - Nuevo método:
   ```javascript
   export const getOpcionesPorCategoria = async (id_categoria)
   ```
   - Obtiene opciones filtradas por categoría
   - Incluye valores ordenados
   - Respeta el orden de visualización

2. **`producto.service.js`** - Nuevo método:
   ```javascript
   export const getOpcionesPorCategoria = async (id_categoria)
   ```

3. **`producto.controller.js`** - Nuevo controlador:
   ```javascript
   export const getOpcionesPorCategoria = async (req, res)
   ```
   - Valida ID de categoría
   - Maneja errores

4. **`producto.admin.routes.js`** - Nueva ruta:
   ```javascript
   router.get("/opciones/categoria/:id_categoria", getOpcionesPorCategoria);
   ```

### Endpoint Creado

```
GET /api/p/admin/productos/opciones/categoria/:id_categoria
```

**Ejemplo de Respuesta (Calzado - id: 3):**
```json
[
  {
    "id_opcion": 1,
    "nombre_opcion": "Color",
    "orden": 1,
    "valores": [
      { "id_valor": 1, "valor": "Verde" },
      { "id_valor": 2, "valor": "Azul" },
      { "id_valor": 3, "valor": "Negro" }
    ]
  },
  {
    "id_opcion": 3,
    "nombre_opcion": "Talla Calzado",
    "orden": 2,
    "valores": [
      { "id_valor": 11, "valor": "35" },
      { "id_valor": 12, "valor": "35.5" },
      { "id_valor": 13, "valor": "36" }
    ]
  }
]
```

---

## 💻 Cambios en Frontend

### Archivos Modificados

1. **`producto.service.ts`** - Nuevo método:
   ```typescript
   getOpcionesPorCategoria(idCategoria: number): Observable<any[]>
   ```

2. **`productos.ts`** (Componente Admin):
   
   **Propiedades agregadas:**
   ```typescript
   currentCategoriaId: number | null = null;
   ```

   **Métodos agregados:**
   ```typescript
   onCategoriaChange(categoriaId: number): void
   ```
   - Se ejecuta cuando el usuario cambia la categoría
   - Carga las opciones específicas de esa categoría
   - Actualiza `opcionesModal`

   **Métodos modificados:**
   ```typescript
   abrirModalVariantesPara(productoId: number)
   ```
   - Ahora usa `getOpcionesPorCategoria` en lugar del método global
   - Obtiene la categoría del producto actual

3. **`productos.html`** - Template actualizado:
   ```html
   <select
     [(ngModel)]="productForm.id_categoria"
     (ngModelChange)="onCategoriaChange($event)"
   >
   ```

---

## 🔄 Flujo de Usuario

### 1. Crear Producto de Calzado

```
1. Admin abre modal "Crear Producto"
2. Selecciona categoría: Calzado
   ↓ Trigger: onCategoriaChange(3)
3. Frontend llama: GET /opciones/categoria/3
4. Backend retorna opciones de Calzado:
   - Color
   - Talla Calzado (35-47) ← Tallas numéricas
   - Material
   - Tipo de Suela
   - Tecnología
5. Usuario crea el producto
6. Se abre modal "Añadir Variantes"
7. Modal muestra SOLO opciones de Calzado
8. Usuario selecciona:
   - Color: Negro, Blanco
   - Talla: 38, 39, 40
9. Sistema genera 6 variantes (2 colores × 3 tallas)
   - SKU: NIKE-NEG-38
   - SKU: NIKE-NEG-39
   - SKU: NIKE-NEG-40
   - SKU: NIKE-BLA-38
   - SKU: NIKE-BLA-39
   - SKU: NIKE-BLA-40
```

### 2. Crear Producto de Ropa

```
1. Admin selecciona categoría: Ropa Deportiva
   ↓ Trigger: onCategoriaChange(1)
2. Backend retorna opciones de Ropa:
   - Color
   - Talla Ropa (XS-XXL) ← Tallas de letras
   - Material
   - Tecnología
3. Usuario crea variantes con tallas: S, M, L
4. Sistema genera SKUs con tallas de letras
```

---

## ✅ Verificación

### Consultas de Prueba

**Ver opciones de Calzado:**
```sql
SELECT op.nombre, COUNT(vo.id_valor) AS total_valores
FROM categoria_opciones co
JOIN opciones_productos op ON co.id_opcion = op.id_opcion
LEFT JOIN valores_opcion vo ON op.id_opcion = vo.id_opcion
WHERE co.id_categoria = 3
GROUP BY op.nombre
ORDER BY co.orden;
```

**Resultado esperado:**
| Opción        | Total Valores |
|---------------|---------------|
| Color         | 6             |
| Talla Calzado | 24            |
| Material      | 8             |
| Tipo de Suela | 6             |
| Tecnología    | 7             |

---

## 🎯 Beneficios

1. **Flexibilidad:** Cada categoría tiene opciones específicas y relevantes
2. **Escalabilidad:** Fácil agregar nuevas categorías y opciones
3. **UX Mejorado:** Los administradores ven solo opciones relevantes
4. **Consistencia:** Calzado siempre usa tallas numéricas, ropa usa letras
5. **Mantenibilidad:** Cambios centralizados en la tabla `categoria_opciones`

---

## 🚀 Próximos Pasos Recomendados

1. ✅ **Testing:** Probar creación de productos en todas las categorías
2. ✅ **Documentación:** Actualizar documentación de API
3. 📝 **UI/UX:** Mejorar visualización de opciones en el modal de variantes
4. 🔐 **Validación:** Agregar validaciones de negocio (ej: Calzado debe tener Talla Calzado)
5. 🎨 **Iconos:** Agregar iconos visuales para cada tipo de opción

---

## 📚 Referencias

- **Base de Datos:** PostgreSQL 14+
- **Backend:** Node.js + Express
- **Frontend:** Angular 20
- **API Gateway:** Puerto configurado en `environment.ts`

---

## 🔗 Endpoints Relacionados

| Método | Endpoint                                    | Descripción                              |
|--------|---------------------------------------------|------------------------------------------|
| GET    | `/admin/productos/opciones`                 | Obtiene todas las opciones globales      |
| GET    | `/admin/productos/opciones/categoria/:id`   | Obtiene opciones de una categoría        |
| POST   | `/admin/productos`                          | Crea un producto                         |
| POST   | `/admin/productos/:id/variantes`            | Crea variantes de un producto            |

---

**Implementado por:** GitHub Copilot  
**Versión:** 1.0.0  
**Estado:** ✅ Producción
