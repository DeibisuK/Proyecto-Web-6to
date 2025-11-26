# 📊 Estructura de Datos: Jugadores, Equipos e Inscripciones

## 🏗️ Arquitectura de Tablas

### 1️⃣ **Tabla `usuarios`**
**Propósito**: Usuarios registrados en la plataforma (pueden ser clientes, admins o jugadores)

```sql
CREATE TABLE usuarios (
  id_user INTEGER PRIMARY KEY,           -- PK: ID único del usuario
  uid TEXT UNIQUE NOT NULL,              -- Firebase UID (string largo)
  name_user VARCHAR(25),                 -- Nombre del usuario
  email_user VARCHAR(100),               -- Email
  id_rol INTEGER,                        -- FK a roles (1=Admin, 2=Cliente, 3=Árbitro)
  fecha_registro DATE,
  estado VARCHAR(50)
);
```

**Datos importantes**:
- `id_user` = ID numérico (para relaciones de BD)
- `uid` = ID de Firebase (para autenticación)
- Un usuario puede ser jugador de uno o varios equipos

---

### 2️⃣ **Tabla `equipos`**
**Propósito**: Equipos creados por usuarios

```sql
CREATE TABLE equipos (
  id_equipo SERIAL PRIMARY KEY,
  nombre_equipo VARCHAR(100) NOT NULL,
  id_deporte INTEGER,                    -- FK a deportes
  logo_url TEXT,
  descripcion TEXT,
  creado_por INTEGER,                    -- FK a usuarios.id_user
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'activo'
);
```

**Datos importantes**:
- Cada equipo pertenece a un deporte específico
- `creado_por` es el dueño/capitán del equipo
- Un equipo puede tener varios jugadores

---

### 3️⃣ **Tabla `jugadores`** ⭐ (LA MÁS IMPORTANTE)
**Propósito**: **Vincular usuarios con equipos** y almacenar datos deportivos

```sql
CREATE TABLE jugadores (
  id_jugador SERIAL PRIMARY KEY,
  id_equipo INTEGER NOT NULL,            -- FK a equipos
  id_usuario INTEGER,                    -- FK a usuarios.id_user (OPCIONAL, puede ser NULL)
  nombre_completo VARCHAR(255) NOT NULL, -- Puede ser un usuario registrado o no
  numero_dorsal INTEGER,                 -- 🔢 NÚMERO EN LA CAMISETA
  posicion VARCHAR(50),                  -- ⚽ POSICIÓN: "Delantero", "Base", "Defensa", etc.
  es_capitan BOOLEAN DEFAULT false,      -- 👑 Si es capitán del equipo
  estado VARCHAR(20) DEFAULT 'activo',   -- 'activo', 'lesionado', 'suspendido', 'inactivo'
  fecha_registro TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_user)  -- ✅ Apunta a id_user, NO id_usuario
);
```

**Características clave**:
✅ **`id_usuario` puede ser NULL**: Puedes agregar jugadores que NO tienen cuenta en la plataforma
✅ **`numero_dorsal`**: Número que lleva en la camiseta (1-99 típicamente)
✅ **`posicion`**: Rol en el deporte (universal para todos los deportes)
✅ **`nombre_completo`**: Se usa siempre (venga de `usuarios.name_user` o sea manual)

**Ejemplos de datos**:
```javascript
// Jugador registrado en la plataforma
{
  id_jugador: 1,
  id_equipo: 21,
  id_usuario: 15,                    // Usuario con cuenta
  nombre_completo: "Cliente Sanyi",  // Copiado de usuarios.name_user
  numero_dorsal: 10,
  posicion: "Delantero",
  es_capitan: true,
  estado: "activo"
}

// Jugador NO registrado (invitado)
{
  id_jugador: 2,
  id_equipo: 21,
  id_usuario: NULL,                  // No tiene cuenta
  nombre_completo: "Juan Pérez",     // Nombre manual
  numero_dorsal: 7,
  posicion: "Defensa",
  es_capitan: false,
  estado: "activo"
}
```

---

### 4️⃣ **Tabla `inscripciones_torneo`**
**Propósito**: Registro de equipos en torneos

```sql
CREATE TABLE inscripciones_torneo (
  id_inscripcion SERIAL PRIMARY KEY,
  id_torneo INTEGER NOT NULL,            -- FK a torneos
  id_equipo INTEGER NOT NULL,            -- FK a equipos
  id_usuario INTEGER,                    -- Usuario que inscribió (dueño del equipo)
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  aprobado BOOLEAN DEFAULT false,        -- Aprobación del admin
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
  
  FOREIGN KEY (id_torneo) REFERENCES torneos(id_torneo),
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_user)
);
```

**Características**:
- Un equipo se inscribe como conjunto (con sus jugadores ya cargados)
- NO se agregan datos adicionales de jugadores aquí
- Los jugadores ya están en `jugadores` con su dorsal y posición

---

## 🔄 Flujo de Trabajo: Crear Equipo y Participar en Torneo

### **Paso 1: Crear Equipo**
```javascript
POST /m/admin/equipos
{
  "nombre_equipo": "Los Tigres",
  "id_deporte": 1,  // Fútbol
  "descripcion": "Equipo de la universidad"
}
// Respuesta: { id_equipo: 21 }
```

### **Paso 2: Agregar Jugadores al Equipo**
```javascript
// Agregar jugador registrado
POST /m/admin/equipos/21/jugadores
{
  "id_usuario": 15,              // ✅ Enviar id_user (INTEGER), NO uid (STRING)
  "nombre_completo": "Cliente Sanyi",
  "numero_dorsal": 10,
  "posicion": "Delantero",
  "es_capitan": true
}

// Agregar jugador NO registrado
POST /m/admin/equipos/21/jugadores
{
  "id_usuario": null,            // NULL porque no tiene cuenta
  "nombre_completo": "Juan Pérez",
  "numero_dorsal": 7,
  "posicion": "Defensa",
  "es_capitan": false
}
```

### **Paso 3: Inscribir Equipo en Torneo**
```javascript
POST /m/torneos/123/inscripcion
{
  "id_equipo": 21
}
```

**Ahora el equipo está inscrito CON todos sus jugadores** (que ya tienen dorsal y posición asignados).

---

## ❓ Preguntas Frecuentes

### ¿Dónde se guardan el dorsal y la posición?
**Respuesta**: En la tabla `jugadores`. Se asignan cuando agregas jugadores al equipo, **ANTES** de inscribirse a un torneo.

### ¿Puedo cambiar el dorsal o posición después?
**Sí**, con:
```javascript
PUT /m/admin/equipos/21/jugadores/1
{
  "numero_dorsal": 11,
  "posicion": "Mediocampista"
}
```

### ¿Qué pasa si un jugador no tiene cuenta?
**No hay problema**. Dejas `id_usuario: null` y pones el nombre manualmente en `nombre_completo`.

### ¿Cómo diferencio usuarios registrados de no registrados?
```javascript
// Jugador registrado: id_usuario !== null
// Jugador invitado: id_usuario === null
```

### ¿Puedo agregar jugadores después de inscribirse?
**Depende de las reglas del torneo**. Generalmente:
- ✅ Antes de que empiece el torneo
- ❌ Una vez iniciado (a menos que el admin lo permita)

---

## 🐛 Errores Comunes

### ❌ Error: `invalid input syntax for type integer: "fwBQBDdliSNB3caJdQqGcwQGbdC2"`
**Causa**: Estás enviando `uid` (Firebase string) en lugar de `id_user` (PostgreSQL integer)

**Solución**:
```javascript
// ❌ INCORRECTO
{ id_usuario: "fwBQBDdliSNB3caJdQqGcwQGbdC2" }  // UID de Firebase

// ✅ CORRECTO
{ id_usuario: 15 }  // id_user de usuarios
```

### ❌ Error: `column u.id_usuario does not exist`
**Causa**: La tabla `usuarios` tiene `id_user`, no `id_usuario`

**Solución**: Ya corregido en el backend (`jugadores.model.js`)

---

## 📝 Resumen Final

| Tabla | Propósito | Datos Clave |
|-------|-----------|-------------|
| **usuarios** | Usuarios de la plataforma | `id_user`, `uid`, `name_user` |
| **equipos** | Equipos creados | `id_equipo`, `nombre_equipo`, `id_deporte` |
| **jugadores** | Vínculo usuario-equipo + datos deportivos | `numero_dorsal`, `posicion`, `es_capitan` |
| **inscripciones_torneo** | Equipos inscritos en torneos | `id_torneo`, `id_equipo`, `aprobado` |

**Orden de creación**:
1. Usuario crea equipo → `equipos`
2. Usuario agrega jugadores → `jugadores` (con dorsal y posición)
3. Usuario inscribe equipo a torneo → `inscripciones_torneo`
4. Los jugadores YA tienen sus datos asignados ✅
