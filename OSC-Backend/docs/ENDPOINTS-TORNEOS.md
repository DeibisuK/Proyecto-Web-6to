# Endpoints del Backend - Dashboard de Torneos

## Resumen de Implementación

Se han creado **10 endpoints** distribuidos en 3 microservicios para soportar la funcionalidad completa del dashboard de torneos.

---

## 📊 Court Service - Torneos

**Base URL:** `http://localhost:PORT/c/client`

### 1. Obtener Estadísticas del Usuario
```
GET /torneos/estadisticas-usuario
```
**Autenticación:** Requerida (JWT Token)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "inscripcionesActivas": 3,
    "proximosPartidos": 5,
    "torneosGanados": 2,
    "victorias": 12
  }
}
```

### 2. Obtener Torneos Públicos
```
GET /torneos/publicos?deporte=1&estado=inscripcion_abierta&busqueda=futbol&ordenar=fecha_desc
```
**Autenticación:** No requerida

**Query Parameters:**
- `deporte` (number, opcional): ID del deporte
- `estado` (string, opcional): inscripcion_abierta | en_curso | finalizado
- `busqueda` (string, opcional): Búsqueda por nombre o descripción
- `fecha` (date, opcional): Fecha mínima de inicio
- `ordenar` (string, opcional): fecha_asc | fecha_desc | nombre | popularidad

**Respuesta:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id_torneo": 1,
      "nombre": "Copa Primavera 2024",
      "descripcion": "Torneo de fútbol...",
      "fecha_inicio": "2024-03-15T00:00:00.000Z",
      "fecha_fin": "2024-04-15T00:00:00.000Z",
      "max_equipos": 16,
      "premio": "500.00",
      "estado": "inscripcion_abierta",
      "url_imagen": "https://...",
      "costo_inscripcion": "50.00",
      "nombre_deporte": "Fútbol",
      "deporte_imagen": "https://...",
      "id_deporte": 1,
      "equipos_inscritos": 8,
      "estado_calculado": "próximo"
    }
  ]
}
```

### 3. Obtener Partidos de un Torneo
```
GET /torneos/:id/partidos
```
**Autenticación:** No requerida

**Respuesta:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id_partido": 1,
      "id_torneo": 1,
      "fecha_hora": "2024-03-20T15:00:00.000Z",
      "estado_partido": "programado",
      "goles_local": null,
      "goles_visitante": null,
      "fase": "grupos",
      "numero_jornada": 1,
      "equipo_local_id": 5,
      "equipo_local_nombre": "Los Tigres",
      "equipo_local_logo": "https://...",
      "equipo_visitante_id": 8,
      "equipo_visitante_nombre": "Las Águilas",
      "equipo_visitante_logo": "https://...",
      "nombre_cancha": "Cancha Principal",
      "nombre_sede": "Complejo Deportivo Norte",
      "sede_direccion": "Av. Principal 123",
      "arbitro_nombre": "Juan Pérez"
    }
  ]
}
```

### 4. Obtener Clasificación/Tabla de Posiciones
```
GET /torneos/:id/clasificacion
```
**Autenticación:** No requerida

**Respuesta:**
```json
{
  "success": true,
  "count": 16,
  "data": [
    {
      "id_equipo": 5,
      "nombre_equipo": "Los Tigres",
      "logo_url": "https://...",
      "nombre_grupo": "Grupo A",
      "partidos_jugados": 3,
      "victorias": 2,
      "empates": 1,
      "derrotas": 0,
      "goles_favor": 8,
      "goles_contra": 3,
      "diferencia_goles": 5,
      "puntos": 7
    }
  ]
}
```

---

## 🎫 Buy Service - Inscripciones

**Base URL:** `http://localhost:PORT/b/client`

### 5. Obtener Inscripciones del Usuario
```
GET /inscripciones/usuario/:uid
```
**Autenticación:** Requerida (JWT Token)

**Parámetros:**
- `uid` (path): Firebase UID del usuario

**Respuesta:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id_inscripcion": 10,
      "id_torneo": 1,
      "id_equipo": 5,
      "fecha_inscripcion": "2024-02-15T10:30:00.000Z",
      "estado_inscripcion": "confirmada",
      "monto_pagado": "50.00",
      "torneo_nombre": "Copa Primavera 2024",
      "torneo_descripcion": "...",
      "fecha_inicio": "2024-03-15T00:00:00.000Z",
      "fecha_fin": "2024-04-15T00:00:00.000Z",
      "torneo_estado": "en_curso",
      "torneo_imagen": "https://...",
      "premio": "500.00",
      "max_equipos": 16,
      "costo_inscripcion": "50.00",
      "nombre_deporte": "Fútbol",
      "deporte_imagen": "https://...",
      "nombre_equipo": "Los Tigres",
      "equipo_logo": "https://...",
      "nombre_grupo": "Grupo A",
      "partidos_jugados": 3,
      "partidos_pendientes": 2,
      "proximo_partido": {
        "id_partido": 15,
        "fecha_hora": "2024-03-25T16:00:00.000Z",
        "rival": "Las Águilas",
        "rival_logo": "https://...",
        "es_local": true
      },
      "equipos_inscritos": 14
    }
  ]
}
```

### 6. Crear Nueva Inscripción
```
POST /inscripciones/crear
```
**Autenticación:** Requerida (JWT Token + Role 2 - Cliente)

**Body:**
```json
{
  "id_torneo": 1,
  "id_equipo": 5,
  "jugadores": [
    {
      "nombre": "Carlos",
      "apellido": "García",
      "numero_camiseta": 10,
      "posicion": "delantero"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción creada exitosamente",
  "data": {
    "id_inscripcion": 20,
    "id_torneo": 1,
    "id_equipo": 5,
    "fecha_inscripcion": "2024-03-10T14:22:00.000Z",
    "estado": "pendiente",
    "monto_pagado": "0.00"
  }
}
```

**Validaciones:**
- El equipo debe pertenecer al usuario autenticado
- El torneo debe estar en estado "inscripcion_abierta"
- No debe exceder el máximo de equipos
- No debe existir una inscripción previa del mismo equipo

### 7. Cancelar Inscripción
```
DELETE /inscripciones/:id
```
**Autenticación:** Requerida (JWT Token + Role 2 - Cliente)

**Parámetros:**
- `id` (path): ID de la inscripción

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción cancelada exitosamente"
}
```

**Validaciones:**
- La inscripción debe pertenecer al usuario autenticado
- El torneo no debe haber comenzado o finalizado
- Debe faltar al menos 24 horas para el inicio del torneo

---

## ⚽ Match Service - Partidos

**Base URL:** `http://localhost:PORT/m/client`

### 8. Obtener Detalle Completo del Partido
```
GET /partidos/:id/detalle
```
**Autenticación:** Requerida (JWT Token)

**Parámetros:**
- `id` (path): ID del partido

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "partido": {
      "id_partido": 15,
      "id_torneo": 1,
      "fecha_hora": "2024-03-20T15:00:00.000Z",
      "estado_partido": "finalizado",
      "goles_local": 3,
      "goles_visitante": 2,
      "penales_local": null,
      "penales_visitante": null,
      "fase": "grupos",
      "numero_jornada": 2,
      "torneo_nombre": "Copa Primavera 2024",
      "nombre_deporte": "Fútbol",
      "equipo_local_id": 5,
      "equipo_local_nombre": "Los Tigres",
      "equipo_local_logo": "https://...",
      "equipo_visitante_id": 8,
      "equipo_visitante_nombre": "Las Águilas",
      "equipo_visitante_logo": "https://...",
      "nombre_cancha": "Cancha Principal",
      "nombre_sede": "Complejo Deportivo Norte",
      "sede_direccion": "Av. Principal 123",
      "id_arbitro": 2,
      "arbitro_nombre": "Juan Pérez"
    },
    "eventos": [
      {
        "id_evento": 1,
        "tipo_evento": "gol",
        "minuto": 15,
        "descripcion": "Gol de cabeza",
        "id_equipo": 5,
        "nombre_equipo": "Los Tigres",
        "id_jugador": 25,
        "jugador_nombre": "Carlos García",
        "numero_camiseta": 10
      },
      {
        "id_evento": 2,
        "tipo_evento": "tarjeta_amarilla",
        "minuto": 32,
        "descripcion": "Falta táctica",
        "id_equipo": 8,
        "nombre_equipo": "Las Águilas",
        "id_jugador": 42,
        "jugador_nombre": "Luis Rodríguez",
        "numero_camiseta": 7
      }
    ],
    "alineaciones": {
      "local": [
        {
          "id_alineacion": 50,
          "id_equipo": 5,
          "nombre_equipo": "Los Tigres",
          "id_jugador": 25,
          "jugador_nombre": "Carlos García",
          "numero_camiseta": 10,
          "posicion": "delantero",
          "es_titular": true,
          "minutos_jugados": 90
        }
      ],
      "visitante": [
        {
          "id_alineacion": 60,
          "id_equipo": 8,
          "nombre_equipo": "Las Águilas",
          "id_jugador": 42,
          "jugador_nombre": "Luis Rodríguez",
          "numero_camiseta": 7,
          "posicion": "mediocampista",
          "es_titular": true,
          "minutos_jugados": 90
        }
      ]
    },
    "estadisticas": {
      "local": {
        "goles": 3,
        "tarjetas_amarillas": 1,
        "tarjetas_rojas": 0,
        "goleadores": [
          {
            "jugador": "Carlos García",
            "numero": 10,
            "minuto": 15
          },
          {
            "jugador": "Miguel Torres",
            "numero": 9,
            "minuto": 45
          },
          {
            "jugador": "Carlos García",
            "numero": 10,
            "minuto": 78
          }
        ]
      },
      "visitante": {
        "goles": 2,
        "tarjetas_amarillas": 2,
        "tarjetas_rojas": 0,
        "goleadores": [
          {
            "jugador": "Luis Rodríguez",
            "numero": 7,
            "minuto": 28
          },
          {
            "jugador": "Pedro Sánchez",
            "numero": 11,
            "minuto": 67
          }
        ]
      }
    }
  }
}
```

---

## 🔐 Autenticación

Los endpoints marcados con "Autenticación: Requerida" necesitan el header:

```
Authorization: Bearer <JWT_TOKEN>
```

El token JWT debe contener:
- `uid`: Firebase UID del usuario
- `rol`: 1 (Admin) o 2 (Cliente)

---

## 🚀 Uso desde el API Gateway

Todos los endpoints están disponibles a través del API Gateway con prefijos:

- **Torneos (Court Service):** `/c/client/...`
- **Inscripciones (Buy Service):** `/b/client/...`
- **Partidos (Match Service):** `/m/client/...`

**Ejemplo:**
```
GET http://localhost:3000/c/client/torneos/publicos?deporte=1
GET http://localhost:3000/b/client/inscripciones/usuario/abc123xyz
GET http://localhost:3000/m/client/partidos/15/detalle
```

---

## 📋 Archivos Creados

### Court Service (Torneos)
1. ✅ `src/api/client/torneo.client.routes.js`
2. ✅ `src/controllers/torneo.controller.js`
3. ✅ `src/services/torneo.service.js`
4. ✅ `src/app.js` (actualizado)

### Buy Service (Inscripciones)
5. ✅ `src/api/inscripcion.routes.js`
6. ✅ `src/controllers/inscripcion.controller.js`
7. ✅ `src/services/inscripcion.service.js`
8. ✅ `src/app.js` (actualizado)

### Match Service (Partidos)
9. ✅ `src/api/client/partido.client.routes.js` (actualizado)
10. ✅ `src/controllers/partido.controller.js` (actualizado)
11. ✅ `src/services/partido.service.js` (actualizado)

---

## ⚠️ Próximos Pasos

1. **Configurar variables de entorno** para las conexiones a la base de datos
2. **Probar endpoints** con Postman/Thunder Client
3. **Crear servicios Angular** en el frontend
4. **Implementar manejo de errores** más robusto
5. **Agregar validaciones adicionales** según reglas de negocio
6. **Documentar con Swagger/OpenAPI** para mejor visualización

---

## 🔧 Estructura de Base de Datos Utilizada

Tablas principales:
- `torneos`
- `torneos_partidos`
- `inscripciones_torneo`
- `equipos`
- `deportes`
- `jugadores`
- `alineaciones`
- `eventos_arbitro`
- `grupos_torneo`
- `canchas`
- `sedes`
- `arbitros`

Todas las consultas SQL están optimizadas con JOINs apropiados y cálculos eficientes.
