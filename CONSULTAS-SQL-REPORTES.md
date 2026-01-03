# Documentación de Consultas SQL - Sistema de Reportes

## 📋 Índice
1. [Categoría: CANCHAS](#categoría-canchas)
2. [Categoría: INGRESOS](#categoría-ingresos)
3. [Categoría: EQUIPOS](#categoría-equipos)
4. [Categoría: RESERVAS](#categoría-reservas)
5. [Categoría: TORNEOS](#categoría-torneos)
6. [Resumen de Tablas Utilizadas](#resumen-de-tablas-utilizadas)


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