# Documentación de Consultas SQL - Sistema de Reportes

**Fecha:** 2 de Enero, 2026  
**Autor:** GitHub Copilot  
**Propósito:** Documentar todas las consultas SQL utilizadas en los reportes para verificar compatibilidad con el esquema de base de datos

---

## 📋 Índice
1. [Categoría: CANCHAS](#categoría-canchas)
2. [Categoría: INGRESOS](#categoría-ingresos)
3. [Categoría: EQUIPOS](#categoría-equipos)
4. [Categoría: RESERVAS](#categoría-reservas)
5. [Categoría: TORNEOS](#categoría-torneos)
6. [Resumen de Tablas Utilizadas](#resumen-de-tablas-utilizadas)

---

## Categoría: CANCHAS

### 📊 Opción 1: Listar Canchas

**Descripción:** Lista todas las canchas con su información completa

**Consulta SQL:**
```sql
SELECT 
  c.nombre_cancha AS "Nombre",
  d.nombre_deporte AS "Deporte",
  s.nombre AS "Sede",
  s.ciudad AS "Ciudad",
  c.estado AS "Estado",
  COALESCE(c.tarifa, 0) AS "Precio/Hora",
  c.largo || 'm x ' || c.ancho || 'm' AS "Dimensiones",
  c.tipo_superficie AS "Superficie"
FROM canchas c
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
LEFT JOIN sedes s ON c.id_sede = s.id_sede
ORDER BY s.nombre, c.nombre_cancha
```

**Tablas y Columnas Utilizadas:**
- **canchas**
  - `id_cancha` (PK)
  - `nombre_cancha`
  - `id_deporte` (FK)
  - `id_sede` (FK)
  - `estado` (valores esperados: 'Disponible', 'Mantenimiento')
  - `tarifa`
  - `largo`
  - `ancho`
  - `tipo_superficie`

- **deportes**
  - `id_deporte` (PK)
  - `nombre_deporte`

- **sedes**
  - `id_sede` (PK)
  - `nombre`
  - `ciudad`

---

### 📊 Opción 2: Canchas Más Utilizadas

**Descripción:** Muestra las canchas con mayor número de reservas en un periodo

**Consulta SQL:**
```sql
SELECT 
  c.nombre_cancha AS "Cancha",
  s.nombre AS "Sede",
  d.nombre_deporte AS "Deporte",
  COUNT(r.id_reserva) AS "Total Reservas",
  ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
  ROUND(
    (SUM(r.duracion_minutos) / 60.0 / (30 * 12)) * 100, 
    2
  ) AS "Tasa Ocupación (%)",
  COALESCE(SUM(r.monto_total), 0) AS "Ingresos"
FROM canchas c
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
  AND EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2  -- Opcional
  AND r.estado_pago != 'Cancelado'
GROUP BY c.id_cancha, c.nombre_cancha, s.nombre, d.nombre_deporte
HAVING COUNT(r.id_reserva) > 0
ORDER BY COUNT(r.id_reserva) DESC
LIMIT 20
```

**Tablas Adicionales:**
- **reservas**
  - `id_reserva` (PK)
  - `id_cancha` (FK)
  - `fecha_reserva`
  - `duracion_minutos`
  - `monto_total`
  - `estado_pago` (valores: 'Pendiente', 'Pagado', 'Cancelado', 'Completado')

---

### 📊 Opción 3: Canchas Mejor Puntuadas

**Descripción:** Canchas ordenadas por número total de reservas

**Consulta SQL:**
```sql
SELECT 
  c.nombre_cancha AS "Cancha",
  s.nombre AS "Sede",
  d.nombre_deporte AS "Deporte",
  c.estado AS "Estado",
  COUNT(r.id_reserva) AS "Total Reservas",
  COALESCE(c.tarifa, 0) AS "Tarifa"
FROM canchas c
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
GROUP BY c.id_cancha, c.nombre_cancha, s.nombre, d.nombre_deporte, c.estado, c.tarifa
ORDER BY COUNT(r.id_reserva) DESC
LIMIT 20
```

**Nota:** Esta consulta no filtra por fecha y muestra todas las reservas históricas.

---

### 📊 Opción 4: Ingresos por Cancha

**Descripción:** Ingresos generados por cada cancha en un periodo

**Consulta SQL:**
```sql
SELECT 
  c.nombre_cancha AS "Cancha",
  s.nombre AS "Sede",
  COUNT(r.id_reserva) AS "Total Reservas",
  COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales",
  COALESCE(AVG(r.monto_total), 0) AS "Ingreso Promedio",
  ROUND(
    (COALESCE(SUM(r.monto_total), 0) * 100.0) / 
    NULLIF((SELECT SUM(monto_total) FROM reservas 
            WHERE estado_pago = 'Pagado' 
            AND EXTRACT(YEAR FROM fecha_reserva) = $1
            AND EXTRACT(MONTH FROM fecha_reserva) = $2), 0),  -- Opcional
    2
  ) AS "% del Total"
FROM canchas c
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
  AND EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2  -- Opcional
  AND r.estado_pago = 'Pagado'
GROUP BY c.id_cancha, c.nombre_cancha, s.nombre
HAVING SUM(r.monto_total) > 0
ORDER BY SUM(r.monto_total) DESC NULLS LAST
```

---

### 📊 Opción 5: Tasa de Ocupación

**Descripción:** Porcentaje de ocupación de cada cancha

**Consulta SQL:**
```sql
SELECT 
  c.nombre_cancha AS "Cancha",
  s.nombre AS "Sede",
  360 AS "Horas Disponibles",  -- 30 días * 12 horas (mes), o 4320 para año
  COALESCE(ROUND(SUM(r.duracion_minutos) / 60.0, 2), 0) AS "Horas Reservadas",
  ROUND(
    (COALESCE(SUM(r.duracion_minutos), 0) / 60.0 / 360) * 100,
    2
  ) AS "Tasa Ocupación (%)"
FROM canchas c
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
  AND EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2  -- Opcional
  AND r.estado_pago != 'Cancelado'
WHERE c.estado = 'Disponible'
GROUP BY c.id_cancha, c.nombre_cancha, s.nombre
ORDER BY (COALESCE(SUM(r.duracion_minutos), 0) / 60.0 / 360) * 100 DESC
```

**Nota:** Las horas disponibles se calculan dinámicamente (360 para un mes, 4320 para un año).

---

## Categoría: INGRESOS

### 📊 Opción 1: Listar Ingresos

**Descripción:** Lista todas las transacciones (reservas y productos)

**Consulta SQL:**
```sql
-- Ingresos por Reservas
SELECT 
  r.fecha_reserva AS "Fecha",
  'Reserva' AS "Tipo",
  c.nombre_cancha || ' - ' || s.nombre AS "Concepto",
  u.name_user AS "Usuario",
  r.monto_total AS "Monto",
  r.estado_pago AS "Estado Pago"
FROM reservas r
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN usuarios u ON r.id_usuario = u.id_user
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago = 'Pagado'

UNION ALL

-- Ingresos por Productos
SELECT 
  p.fecha_pedido AS "Fecha",
  'Producto' AS "Tipo",
  'Pedido #' || p.id_pedido AS "Concepto",
  u.name_user AS "Usuario",
  p.total AS "Monto",
  p.estado_pedido AS "Estado Pago"
FROM pedidos p
LEFT JOIN usuarios u ON p.id_usuario = u.id_user
WHERE EXTRACT(YEAR FROM p.fecha_pedido) = $1
  AND EXTRACT(MONTH FROM p.fecha_pedido) = $2
  AND p.estado_pedido = 'Completado'

ORDER BY "Fecha" DESC
LIMIT 500
```

**Tablas y Columnas Adicionales:**
- **usuarios**
  - `id_user` (PK)
  - `name_user`

- **pedidos**
  - `id_pedido` (PK)
  - `id_usuario` (FK)
  - `fecha_pedido`
  - `total`
  - `estado_pedido` (valores: 'Pendiente', 'Completado', 'Cancelado')

---

### 📊 Opción 2: Ingresos Totales

**Descripción:** Suma total de ingresos por categoría

**Consulta SQL:**
```sql
WITH ingresos_reservas AS (
  SELECT COALESCE(SUM(monto_total), 0) AS total
  FROM reservas
  WHERE EXTRACT(YEAR FROM fecha_reserva) = $1
    AND EXTRACT(MONTH FROM fecha_reserva) = $2
    AND estado_pago = 'Pagado'
),
ingresos_productos AS (
  SELECT COALESCE(SUM(total), 0) AS total
  FROM pedidos
  WHERE EXTRACT(YEAR FROM fecha_pedido) = $1
    AND EXTRACT(MONTH FROM fecha_pedido) = $2
    AND estado_pedido = 'Completado'
)
SELECT 
  'Reservas' AS "Concepto",
  ir.total AS "Monto"
FROM ingresos_reservas ir

UNION ALL

SELECT 
  'Productos' AS "Concepto",
  ip.total AS "Monto"
FROM ingresos_productos ip

UNION ALL

SELECT 
  'TOTAL' AS "Concepto",
  ir.total + ip.total AS "Monto"
FROM ingresos_reservas ir, ingresos_productos ip
```

---

### 📊 Opción 3: Ingresos por Categoría

**Descripción:** Comparación de ingresos entre reservas y productos

**Consulta SQL:**
```sql
SELECT 
  'Reservas de Canchas' AS "Categoría",
  COUNT(*) AS "Transacciones",
  COALESCE(SUM(monto_total), 0) AS "Ingreso Total",
  COALESCE(AVG(monto_total), 0) AS "Ingreso Promedio"
FROM reservas
WHERE EXTRACT(YEAR FROM fecha_reserva) = $1
  AND EXTRACT(MONTH FROM fecha_reserva) = $2
  AND estado_pago = 'Pagado'

UNION ALL

SELECT 
  'Venta de Productos' AS "Categoría",
  COUNT(*) AS "Transacciones",
  COALESCE(SUM(total), 0) AS "Ingreso Total",
  COALESCE(AVG(total), 0) AS "Ingreso Promedio"
FROM pedidos
WHERE EXTRACT(YEAR FROM fecha_pedido) = $1
  AND EXTRACT(MONTH FROM fecha_pedido) = $2
  AND estado_pedido = 'Completado'

ORDER BY "Ingreso Total" DESC
```

---

### 📊 Opción 4: Ingresos por Deporte

**Descripción:** Ingresos desglosados por tipo de deporte

**Consulta SQL:**
```sql
SELECT 
  d.nombre_deporte AS "Deporte",
  COUNT(r.id_reserva) AS "Reservas",
  COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
  ROUND(
    (COALESCE(SUM(r.monto_total), 0) * 100.0) / 
    NULLIF((SELECT SUM(monto_total) FROM reservas WHERE estado_pago = 'Pagado'), 0),
    2
  ) AS "% del Total"
FROM reservas r
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago = 'Pagado'
GROUP BY d.nombre_deporte
ORDER BY SUM(r.monto_total) DESC
```

---

### 📊 Opción 5: Proyección de Ingresos

**Descripción:** Estimación de ingresos fin de mes basado en datos actuales

**Consulta SQL:**
```sql
WITH dias_transcurridos AS (
  SELECT EXTRACT(DAY FROM CURRENT_DATE) AS dias
),
ingresos_actuales AS (
  SELECT 
    COALESCE(SUM(r.monto_total), 0) + COALESCE(SUM(p.total), 0) AS total
  FROM reservas r
  FULL OUTER JOIN pedidos p ON 1=1
  WHERE (EXTRACT(YEAR FROM r.fecha_reserva) = $1 
         AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
         AND r.estado_pago = 'Pagado')
     OR (EXTRACT(YEAR FROM p.fecha_pedido) = $1 
         AND EXTRACT(MONTH FROM p.fecha_pedido) = $2
         AND p.estado_pedido = 'Completado')
)
SELECT 
  'Ingresos Actuales' AS "Concepto",
  ia.total AS "Valor"
FROM ingresos_actuales ia

UNION ALL

SELECT 
  'Promedio Diario' AS "Concepto",
  ia.total / NULLIF(dt.dias, 0) AS "Valor"
FROM ingresos_actuales ia, dias_transcurridos dt

UNION ALL

SELECT 
  'Proyección Fin de Mes' AS "Concepto",
  (ia.total / NULLIF(dt.dias, 0)) * 30 AS "Valor"
FROM ingresos_actuales ia, dias_transcurridos dt
```

---

## Categoría: EQUIPOS

### 📊 Opción 1: Listar Equipos

**Descripción:** Lista todos los equipos registrados

**Consulta SQL:**
```sql
SELECT 
  e.nombre_equipo AS "Equipo",
  d.nombre_deporte AS "Deporte",
  e.firebase_uid AS "UID Creador",
  (SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo) AS "Jugadores",
  e.creado_en::DATE AS "Fecha Creación"
FROM equipos e
LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
ORDER BY e.creado_en DESC
LIMIT 200
```

**Tablas y Columnas Utilizadas:**
- **equipos**
  - `id_equipo` (PK)
  - `nombre_equipo`
  - `id_deporte` (FK)
  - `firebase_uid`
  - `creado_en`

- **jugadores**
  - `id_jugador` (PK)
  - `id_equipo` (FK)

**Nota:** Esta categoría solo tiene implementada 1 opción. Las demás retornan "Pendiente de implementación".

---

## Categoría: RESERVAS

### 📊 Opción 1: Listar Reservas

**Descripción:** Lista todas las reservas del periodo

**Consulta SQL:**
```sql
SELECT 
  r.fecha_reserva AS "Fecha",
  u.name_user AS "Usuario",
  c.nombre_cancha AS "Cancha",
  s.nombre AS "Sede",
  d.nombre_deporte AS "Deporte",
  r.hora_inicio AS "Hora Inicio",
  r.duracion_minutos AS "Duración (min)",
  r.monto_total AS "Monto",
  r.estado_pago AS "Estado Pago"
FROM reservas r
LEFT JOIN usuarios u ON r.id_usuario = u.id_user
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN sedes s ON c.id_sede = s.id_sede
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
LIMIT 500
```

**Columnas Adicionales de reservas:**
- `hora_inicio`
- `id_usuario` (FK)

---

### 📊 Opción 2: Reservas por Estado

**Descripción:** Agrupa reservas según su estado de pago

**Consulta SQL:**
```sql
SELECT 
  r.estado_pago AS "Estado",
  COUNT(*) AS "Cantidad",
  COALESCE(SUM(r.monto_total), 0) AS "Monto Total"
FROM reservas r
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
GROUP BY r.estado_pago
ORDER BY COUNT(*) DESC
```

---

### 📊 Opción 3: Cancelaciones

**Descripción:** Reservas canceladas con monto perdido

**Consulta SQL:**
```sql
SELECT 
  r.fecha_reserva AS "Fecha Reserva",
  u.name_user AS "Usuario",
  c.nombre_cancha AS "Cancha",
  r.monto_total AS "Monto Perdido"
FROM reservas r
LEFT JOIN usuarios u ON r.id_usuario = u.id_user
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago = 'Cancelado'
ORDER BY r.fecha_reserva DESC
```

---

### 📊 Opción 4: Reservas por Deporte

**Descripción:** Estadísticas de reservas agrupadas por deporte

**Consulta SQL:**
```sql
SELECT 
  d.nombre_deporte AS "Deporte",
  COUNT(r.id_reserva) AS "Número de Reservas",
  ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Totales",
  COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales"
FROM reservas r
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago = 'Pagado'
GROUP BY d.nombre_deporte
ORDER BY COUNT(r.id_reserva) DESC
```

---

### 📊 Opción 5: Reservas por Día de Semana

**Descripción:** Distribución de reservas según día de la semana

**Consulta SQL:**
```sql
SELECT 
  CASE EXTRACT(DOW FROM r.fecha_reserva)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END AS "Día de la Semana",
  COUNT(r.id_reserva) AS "Número de Reservas",
  COALESCE(SUM(r.monto_total), 0) AS "Ingresos"
FROM reservas r
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago = 'Pagado'
GROUP BY EXTRACT(DOW FROM r.fecha_reserva)
ORDER BY EXTRACT(DOW FROM r.fecha_reserva)
```

---

### 📊 Opción 6: Duración Promedio

**Descripción:** Estadísticas de duración de reservas por deporte

**Consulta SQL:**
```sql
SELECT 
  d.nombre_deporte AS "Deporte",
  ROUND(AVG(r.duracion_minutos), 2) AS "Duración Promedio (min)",
  MIN(r.duracion_minutos) AS "Duración Mínima (min)",
  MAX(r.duracion_minutos) AS "Duración Máxima (min)",
  COUNT(r.id_reserva) AS "Total Reservas"
FROM reservas r
LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
  AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
  AND r.estado_pago != 'Cancelado'
GROUP BY d.nombre_deporte
ORDER BY AVG(r.duracion_minutos) DESC
```

---

## Categoría: TORNEOS

**Estado:** Pendiente de implementación  
**Nota:** Módulo de torneos en desarrollo. Retorna mensaje placeholder.

```javascript
return {
  columns: ["Nota"],
  rows: [{ "Nota": "Reportes de torneos - Pendiente de implementación (módulo de torneos en desarrollo)" }],
  summary: { 'Estado': 'Pendiente' }
};
```

---

## Resumen de Tablas Utilizadas

### 📁 Tablas Principales

#### 1. **canchas**
```
Columnas requeridas:
- id_cancha (PK)
- nombre_cancha
- id_deporte (FK → deportes.id_deporte)
- id_sede (FK → sedes.id_sede)
- estado (valores: 'Disponible', 'Mantenimiento')
- tarifa (DECIMAL/NUMERIC)
- largo (NUMERIC)
- ancho (NUMERIC)
- tipo_superficie (TEXT/VARCHAR)
```

#### 2. **reservas**
```
Columnas requeridas:
- id_reserva (PK)
- id_cancha (FK → canchas.id_cancha)
- id_usuario (FK → usuarios.id_user)
- fecha_reserva (DATE/TIMESTAMP)
- hora_inicio (TIME/VARCHAR)
- duracion_minutos (INTEGER)
- monto_total (DECIMAL/NUMERIC)
- estado_pago (valores: 'Pendiente', 'Pagado', 'Completado', 'Cancelado')
```

#### 3. **usuarios**
```
Columnas requeridas:
- id_user (PK)
- name_user (VARCHAR)
- email_user (VARCHAR)
- uid (VARCHAR) - Firebase UID
```

#### 4. **deportes**
```
Columnas requeridas:
- id_deporte (PK)
- nombre_deporte (VARCHAR)
```

#### 5. **sedes**
```
Columnas requeridas:
- id_sede (PK)
- nombre (VARCHAR)
- ciudad (VARCHAR)
- direccion (VARCHAR)
```

#### 6. **pedidos**
```
Columnas requeridas:
- id_pedido (PK)
- id_usuario (FK → usuarios.id_user)
- fecha_pedido (DATE/TIMESTAMP)
- total (DECIMAL/NUMERIC)
- estado_pedido (valores: 'Pendiente', 'Completado', 'Cancelado')
```

#### 7. **equipos**
```
Columnas requeridas:
- id_equipo (PK)
- nombre_equipo (VARCHAR)
- id_deporte (FK → deportes.id_deporte)
- firebase_uid (VARCHAR)
- creado_en (TIMESTAMP)
```

#### 8. **jugadores**
```
Columnas requeridas:
- id_jugador (PK)
- id_equipo (FK → equipos.id_equipo)
```

---

## 🔗 Relaciones Entre Tablas

```
usuarios (1) ──┬─── (N) reservas
               │
               └─── (N) pedidos

deportes (1) ──┬─── (N) canchas
               │
               └─── (N) equipos

sedes (1) ────────── (N) canchas

canchas (1) ─────── (N) reservas

equipos (1) ────── (N) jugadores
```

---

## ⚠️ Valores Enumerados Críticos

### Estado de Canchas
- `'Disponible'` - Cancha activa para reservas
- `'Mantenimiento'` - Cancha fuera de servicio

### Estado de Pago (Reservas)
- `'Pendiente'` - Pago no realizado
- `'Pagado'` - Pago confirmado
- `'Completado'` - Reserva completada
- `'Cancelado'` - Reserva cancelada

### Estado de Pedidos
- `'Pendiente'` - Pedido en proceso
- `'Completado'` - Pedido finalizado
- `'Cancelado'` - Pedido cancelado

---

## 📝 Notas para Scripts de Base de Datos

### Para validar la estructura, necesito los siguientes scripts:

1. **CREATE TABLE de todas las tablas principales**
   - canchas
   - reservas
   - usuarios
   - deportes
   - sedes
   - pedidos
   - equipos
   - jugadores

2. **ALTER TABLE con todas las FOREIGN KEYS**
   - Relaciones entre tablas

3. **INSERTS de ejemplo** (opcional pero recomendado)
   - Al menos 2-3 registros por tabla para testing

4. **ÍNDICES** (si existen)
   - Índices en columnas de fecha
   - Índices en foreign keys

### Con estos scripts podré:
✅ Verificar que todas las columnas existen  
✅ Confirmar tipos de datos correctos  
✅ Validar relaciones entre tablas  
✅ Asegurar que los valores enumerados son válidos  
✅ Optimizar consultas con índices apropiados  
✅ **Garantizar 0 errores en las consultas SQL**

---

## 📊 Parámetros de Filtrado

Todas las consultas aceptan estos parámetros:
- `$1` → **year** (INTEGER) - Año para filtrar
- `$2` → **month** (INTEGER, opcional) - Mes para filtrar (1-12)

**Nota:** Si month es `null` o `undefined`, se filtra solo por año (datos anuales).

---

## 📊 CONSULTAS SQL DEL DASHBOARD

### Endpoint: `GET /u/admin/estadisticas`
**Archivo:** `OSC-Backend/micro-servicios/user-service/src/models/admin.model.js`

---

### 🔹 1. Reservas Hechas HOY (Creadas Ayer)

**Descripción:** Cuenta las reservas activas creadas en el día anterior

**Consulta SQL:**
```sql
-- Cuenta las reservas activas creadas ayer
SELECT 
  COUNT(*) as total_del_dia, 
  COUNT(CASE WHEN estado_pago IN ('pendiente', 'pagado') THEN 1 END) as reservas_activas
FROM reservas
WHERE DATE(fecha_registro) = CURRENT_DATE - 1;
```

**Tablas utilizadas:**
- **reservas**
  - `fecha_registro` (DATE/TIMESTAMP) - Fecha en que se creó la reserva
  - `estado_pago` (valores: 'pendiente', 'pagado', 'completado', 'cancelado')

**Resultado esperado:**
```json
{
  "total_del_dia": 5,      // Total de reservas creadas ayer
  "reservas_activas": 4     // Reservas activas (pendiente o pagado)
}
```

**Valor usado en dashboard:** `reservas_activas` (solo pendiente y pagado)

---

### 🔹 2. Reservas por DEPORTE (año actual)

**Descripción:** Distribución de reservas agrupadas por deporte (usando tabla deportes)

**Consulta SQL:**
```sql
-- Reservas por DEPORTE (año actual)
SELECT 
  d.nombre_deporte as deporte,
  COUNT(r.id_reserva) as total_reservas
FROM reservas r
INNER JOIN canchas c ON r.id_cancha = c.id_cancha
INNER JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY d.nombre_deporte
ORDER BY total_reservas DESC;
```

**Tablas utilizadas:**
- **reservas**
  - `id_reserva` (PK)
  - `id_cancha` (FK → canchas.id_cancha)
  - `fecha_reserva` (DATE/TIMESTAMP)

- **canchas**
  - `id_cancha` (PK)
  - `id_deporte` (FK → deportes.id_deporte)

- **deportes**
  - `id_deporte` (PK)
  - `nombre_deporte` (VARCHAR)

**Resultado esperado:**
```json
[
  {
    "nombre": "Fútbol",
    "total": 150,
    "porcentaje": 45
  },
  {
    "nombre": "Básquetbol",
    "total": 100,
    "porcentaje": 30
  }
]
```

**Cálculo adicional:** El porcentaje se calcula dividiendo `total_reservas` de cada deporte entre el total general.

---

### 🔹 3. Reservas por MES (año actual - 2026)

**Descripción:** Total de reservas para cada mes del año actual con nombres en español

**Consulta SQL:**
```sql
-- Reservas por MES en español
SELECT 
  EXTRACT(MONTH FROM fecha_reserva) as mes,
  CASE EXTRACT(MONTH FROM fecha_reserva)
    WHEN 1 THEN 'Enero'
    WHEN 2 THEN 'Febrero'
    WHEN 3 THEN 'Marzo'
    WHEN 4 THEN 'Abril'
    WHEN 5 THEN 'Mayo'
    WHEN 6 THEN 'Junio'
    WHEN 7 THEN 'Julio'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Septiembre'
    WHEN 10 THEN 'Octubre'
    WHEN 11 THEN 'Noviembre'
    WHEN 12 THEN 'Diciembre'
  END as nombre_mes,
  COUNT(*) as total_reservas
FROM reservas
WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY EXTRACT(MONTH FROM fecha_reserva)
ORDER BY mes;
```

**Tablas utilizadas:**
- **reservas**
  - `fecha_reserva` (DATE/TIMESTAMP)

**Resultado esperado:**
```json
{
  "mes": 1,
  "nombre_mes": "Enero",
  "total_reservas": 45
}
```

**Procesamiento en backend:**
- Se crea un array de 12 posiciones inicializado en 0
- Se mapean los resultados de la query a índices 0-11 (Enero a Diciembre)
- Si un mes no tiene reservas, queda en 0

**Array final:**
```javascript
[45, 50, 60, 55, 70, 65, 80, 75, 85, 90, 100, 95]
// Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov Dic
```

---

### 🔹 CONSULTAS ADICIONALES DEL DASHBOARD

#### 4. Ingresos del Mes Actual

**Consulta 1: Ingresos por Reservas**
```sql
SELECT COALESCE(SUM(monto_total), 0) as total_reservas
FROM reservas
WHERE fecha_reserva >= $1  -- Primer día del mes
  AND fecha_reserva <= $2  -- Último día del mes
  AND estado_pago IN ('completado', 'pagado')
```

**Consulta 2: Ingresos por Productos**
```sql
SELECT COALESCE(SUM(total), 0) as total_pedidos
FROM pedidos
WHERE fecha_pedido >= $1
  AND fecha_pedido <= $2
  AND estado_pedido IN ('completado', 'entregado')
```

**Resultado:** Suma de ambos totales

---

#### 5. Top 5 Canchas Mejor Valoradas

```sql
SELECT 
  c.id_cancha,
  c.nombre_cancha,
  c.tipo_superficie,
  c.imagen_url,
  COALESCE(AVG(r.estrellas), 0) as rating_promedio,
  COUNT(r.id_rating) as total_ratings
FROM canchas c
LEFT JOIN ratings_canchas r ON c.id_cancha = r.id_cancha 
  AND r.estado = 'activo'
WHERE c.estado = 'Disponible'
GROUP BY c.id_cancha, c.nombre_cancha, c.tipo_superficie, c.imagen_url
ORDER BY rating_promedio DESC, total_ratings DESC
LIMIT 5
```

**Tablas adicionales:**
- **ratings_canchas**
  - `id_rating` (PK)
  - `id_cancha` (FK → canchas.id_cancha)
  - `estrellas` (INTEGER, 1-5)
  - `estado` (valores: 'activo', 'inactivo')

---

#### 6. Últimas 5 Reservas

```sql
SELECT 
  r.id_reserva,
  r.fecha_reserva,
  r.hora_inicio,
  r.duracion_minutos,
  r.monto_total,
  r.estado_pago,
  r.fecha_registro,
  c.nombre_cancha,
  c.tipo_superficie,
  u.name_user as nombre_usuario,
  u.email_user as email_usuario
FROM reservas r
INNER JOIN canchas c ON r.id_cancha = c.id_cancha
INNER JOIN usuarios u ON r.id_usuario = u.uid
ORDER BY r.fecha_registro DESC
LIMIT 5
```

**Columnas adicionales de reservas:**
- `fecha_registro` (TIMESTAMP) - Fecha en que se creó la reserva
- `id_usuario` (VARCHAR/TEXT) - FK que referencia `usuarios.uid`

---

### ⚠️ POSIBLES ERRORES Y CORRECCIONES

#### Error 1: Foreign Key `id_usuario` → `usuarios.uid`

**Problema:** La tabla `reservas` usa `id_usuario` que debería relacionarse con `usuarios.uid` (no con `usuarios.id_user`)

**Verificar:**
```sql
-- Verificar tipo de dato y relación
SELECT 
  r.id_usuario,
  u.uid,
  u.id_user,
  u.name_user
FROM reservas r
LEFT JOIN usuarios u ON r.id_usuario = u.uid
LIMIT 5;
```

**Si falla:** Verificar si la columna correcta es `id_user` en lugar de `uid`:
```sql
-- Alternativa si la relación es con id_user
INNER JOIN usuarios u ON r.id_usuario = u.id_user
```

---

#### Error 2: Columna `tipo_superficie` como "Deporte"

**Problema:** Se usa `canchas.tipo_superficie` para representar el deporte, pero podría haber una tabla `deportes` separada.

**Verificar:**
```sql
-- Verificar si existe relación con tabla deportes
SELECT 
  c.id_cancha,
  c.nombre_cancha,
  c.tipo_superficie,
  c.id_deporte,
  d.nombre_deporte
FROM canchas c
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
LIMIT 5;
```

**Si existe `deportes` table:** Cambiar la consulta de "Reservas por DEPORTE" a:
```sql
SELECT 
  d.nombre_deporte as deporte,
  COUNT(r.id_reserva) as total_reservas
FROM reservas r
INNER JOIN canchas c ON r.id_cancha = c.id_cancha
LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
WHERE EXTRACT(YEAR FROM r.fecha_reserva) = 2025
GROUP BY d.nombre_deporte
ORDER BY total_reservas DESC
```

---

#### Error 3: Valores de `estado_pago`

**Valores usados en código:**
- `'pendiente'`
- `'completado'`
- `'pagado'`
- `'cancelado'`

**Verificar valores reales en BD:**
```sql
SELECT DISTINCT estado_pago, COUNT(*) 
FROM reservas 
GROUP BY estado_pago;
```

**Nota:** Podría ser que los valores reales sean con mayúscula inicial: `'Pendiente'`, `'Pagado'`, etc.

---

#### Error 4: Columna `hora_inicio`

**Problema:** Se usa `.substring(0, 5)` asumiendo formato `HH:MM:SS` o TIME

**Verificar tipo de dato:**
```sql
SELECT 
  hora_inicio,
  pg_typeof(hora_inicio) as tipo_dato
FROM reservas
LIMIT 1;
```

**Si es TIME:** Está bien  
**Si es VARCHAR/TEXT:** Verificar formato  
**Si es TIMESTAMP:** Cambiar a `TO_CHAR(hora_inicio, 'HH24:MI')`

---

### 📋 RESUMEN DE TABLAS PARA DASHBOARD

```
reservas
├── id_reserva (PK)
├── id_cancha (FK → canchas.id_cancha)
├── id_usuario (FK → usuarios.uid o usuarios.id_user?)
├── fecha_reserva (DATE/TIMESTAMP)
├── fecha_registro (TIMESTAMP) - Fecha de creación
├── hora_inicio (TIME/VARCHAR)
├── duracion_minutos (INTEGER)
├── monto_total (DECIMAL/NUMERIC)
└── estado_pago (VARCHAR: 'pendiente', 'completado', 'pagado', 'cancelado')

canchas
├── id_cancha (PK)
├── nombre_cancha (VARCHAR)
├── tipo_superficie (VARCHAR) - Usado como "deporte"
├── id_deporte (FK → deportes.id_deporte, opcional)
├── imagen_url (TEXT/VARCHAR)
└── estado (VARCHAR: 'Disponible', 'Mantenimiento')

usuarios
├── id_user (PK, INTEGER?)
├── uid (VARCHAR) - Firebase UID
├── name_user (VARCHAR)
└── email_user (VARCHAR)

ratings_canchas
├── id_rating (PK)
├── id_cancha (FK → canchas.id_cancha)
├── estrellas (INTEGER: 1-5)
└── estado (VARCHAR: 'activo', 'inactivo')

pedidos
├── id_pedido (PK)
├── id_usuario (FK → usuarios.id_user)
├── fecha_pedido (DATE/TIMESTAMP)
├── total (DECIMAL/NUMERIC)
└── estado_pedido (VARCHAR: 'completado', 'entregado', 'cancelado')
```

---

### 🔧 SCRIPTS RECOMENDADOS PARA PGADMIN

#### 1. Verificar estructura de reservas
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reservas'
ORDER BY ordinal_position;
```

#### 2. Verificar foreign keys de reservas
```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'reservas';
```

#### 3. Verificar datos de ejemplo
```sql
-- Verificar que haya reservas de hoy
SELECT * FROM reservas 
WHERE fecha_reserva::date = CURRENT_DATE
LIMIT 10;

-- Verificar que haya reservas del año 2025
SELECT 
  EXTRACT(YEAR FROM fecha_reserva) as año,
  EXTRACT(MONTH FROM fecha_reserva) as mes,
  COUNT(*) as total
FROM reservas
WHERE EXTRACT(YEAR FROM fecha_reserva) = 2025
GROUP BY año, mes
ORDER BY mes;

-- Verificar relación con usuarios
SELECT 
  r.id_reserva,
  r.id_usuario,
  u.uid,
  u.name_user
FROM reservas r
LEFT JOIN usuarios u ON r.id_usuario = u.uid
LIMIT 10;
```

---

**Fin del documento**
