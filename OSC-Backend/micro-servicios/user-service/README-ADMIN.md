# Admin Routes - User Service

## 📋 Descripción

Las rutas de administración han sido movidas del API Gateway al User Service y reestructuradas siguiendo el patrón MVC (Model-View-Controller).

## 🏗️ Estructura de Archivos

```
user-service/src/
├── api/
│   └── admin.routes.js          # Rutas HTTP con middlewares
├── controllers/
│   └── admin.controller.js      # Controladores HTTP
├── services/
│   └── admin.service.js         # Lógica de negocio
└── models/
    └── admin.model.js           # Acceso a base de datos
```

## 🔐 Seguridad

Todas las rutas de admin requieren:
1. **Autenticación**: Token JWT de Firebase válido
2. **Autorización**: Rol de Admin (id_rol = 1)

Los middlewares aplicados son:
- `authenticate()` - Verifica token de Firebase
- `authorizeRole(1)` - Verifica que el usuario tenga rol de admin

## 🌐 Endpoints

### 1. GET /admin/all-users

Obtiene todos los usuarios combinando datos de Firebase Authentication y la base de datos PostgreSQL.

**URL**: `http://localhost:3001/admin/all-users` (directo) o `http://localhost:3000/u/admin/all-users` (vía gateway)

**Headers requeridos**:
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

**Respuesta exitosa (200)**:
```json
{
  "total": 15,
  "firebaseCount": 12,
  "dbCount": 13,
  "users": [
    {
      "uid": "firebase-uid-123",
      "email": "usuario@ejemplo.com",
      "displayName": "Juan Pérez",
      "photoURL": "https://...",
      "emailVerified": true,
      "disabled": false,
      "customClaims": {
        "role": "Admin",
        "id_rol": 1
      },
      "providerData": [...],
      "metadata": {
        "creationTime": "2024-01-01T00:00:00Z",
        "lastSignInTime": "2024-12-01T10:30:00Z"
      },
      "id_user": 5,
      "nombre": "Juan",
      "apellido": "Pérez",
      "id_rol": 1,
      "rol_nombre": "Admin",
      "source": "firebase+db"
    },
    {
      "uid": null,
      "email": "solo_bd@ejemplo.com",
      "displayName": "María García",
      "photoURL": null,
      "emailVerified": false,
      "disabled": false,
      "customClaims": {},
      "providerData": [],
      "metadata": {
        "creationTime": "2024-02-15T00:00:00Z",
        "lastSignInTime": null
      },
      "id_user": 8,
      "nombre": "María",
      "apellido": "García",
      "id_rol": 2,
      "rol_nombre": "Cliente",
      "source": "db-only"
    }
  ]
}
```

**Posibles valores de `source`**:
- `firebase+db`: Usuario existe en Firebase y en BD
- `firebase-only`: Usuario solo en Firebase (sin registro en BD)
- `db-only`: Usuario solo en BD (sin cuenta Firebase)

### 2. POST /admin/assign-role

Asigna un rol a un usuario y sincroniza los custom claims de Firebase.

**URL**: `http://localhost:3001/admin/assign-role` (directo) o `http://localhost:3000/u/admin/assign-role` (vía gateway)

**Headers requeridos**:
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "uid": "firebase-uid-123",
  "id_rol": 2
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "uid": "firebase-uid-123",
  "updated": {
    "uid": "firebase-uid-123",
    "nombre": "Juan",
    "email": "usuario@ejemplo.com",
    "id_rol": 2
  },
  "claimsSynced": true,
  "claimWarning": null
}
```

**Errores posibles**:

- **400 Bad Request** - Parámetros inválidos
```json
{
  "error": "invalid_payload",
  "message": "uid y id_rol son requeridos"
}
```

- **401 Unauthorized** - Token faltante o inválido
```json
{
  "error": "missing_token",
  "message": "Missing or invalid Authorization header"
}
```

- **403 Forbidden** - Usuario no tiene rol de admin
```json
{
  "error": "forbidden",
  "message": "Insufficient role"
}
```

- **404 Not Found** - Usuario no existe en BD
```json
{
  "error": "user_not_found",
  "message": "Usuario no encontrado en la base de datos"
}
```

- **500 Internal Server Error** - Error del servidor
```json
{
  "error": "internal_error",
  "message": "Descripción del error"
}
```

## 🧪 Pruebas

### Requisitos previos:
1. User service corriendo en puerto 3001
2. Token de Firebase válido de un usuario admin
3. Variables de entorno configuradas:
   - `GOOGLE_APPLICATION_CREDENTIALS` - Ruta al archivo de credenciales de Firebase
   - `DATABASE_URL` o configuración de PostgreSQL

### PowerShell - Obtener todos los usuarios

```powershell
$token = "TU_FIREBASE_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:3001/admin/all-users" -Method GET -Headers $headers
Write-Output "Total usuarios: $($response.total)"
Write-Output "Firebase: $($response.firebaseCount)"
Write-Output "Base de datos: $($response.dbCount)"
$response.users | Select-Object uid, email, displayName, id_rol, rol_nombre, source | Format-Table
```

### PowerShell - Asignar rol

```powershell
$token = "TU_FIREBASE_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    uid = "firebase-uid-del-usuario"
    id_rol = 2
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/admin/assign-role" -Method POST -Headers $headers -Body $body
Write-Output $response
```

### cURL - Obtener todos los usuarios

```bash
curl -X GET "http://localhost:3001/admin/all-users" \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### cURL - Asignar rol

```bash
curl -X POST "http://localhost:3001/admin/assign-role" \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "firebase-uid-del-usuario",
    "id_rol": 2
  }'
```

## 🔄 Flujo de Datos

### GET /admin/all-users

```
Cliente → API Gateway (opcional) → User Service
                                    ↓
                    [authenticate middleware]
                                    ↓
                    [authorizeRole(1) middleware]
                                    ↓
                         AdminController
                                    ↓
                          AdminService
                         ↙          ↘
                Firebase Auth    PostgreSQL
                (listUsers)      (usuarios table)
                         ↘          ↙
                      Combinar datos
                                    ↓
                         Respuesta JSON
```

### POST /admin/assign-role

```
Cliente → API Gateway (opcional) → User Service
                                    ↓
                    [authenticate middleware]
                                    ↓
                    [authorizeRole(1) middleware]
                                    ↓
                         AdminController
                                    ↓
                          AdminService
                                    ↓
                    1. Actualizar rol en BD
                                    ↓
                    2. Obtener nombre del rol
                                    ↓
              3. Sincronizar Firebase Custom Claims
                                    ↓
                         Respuesta JSON
```

## 📝 Notas Importantes

1. **Firebase Custom Claims**: Los custom claims se sincronizan automáticamente al asignar roles. El usuario deberá refrescar su token para ver los cambios.

2. **Usuarios sin uid**: Los usuarios que solo existen en la BD (sin cuenta Firebase) no pueden autenticarse pero aparecen en la lista de usuarios.

3. **Logs**: Todos los servicios imprimen logs detallados con emojis para facilitar el debugging:
   - ✅ Operación exitosa
   - ❌ Error
   - ⚠️ Advertencia
   - 📊 Información

4. **Errores de Firebase**: Si Firebase Admin no está configurado o falla, el servicio continúa funcionando pero con funcionalidad reducida (solo usuarios de BD).

## 🔧 Migración desde API Gateway

### Cambios realizados:

1. **Eliminado**: `OSC-Backend/micro-servicios/api-gateway/src/routes/admin.routes.js`
2. **Creado**: 
   - `user-service/src/models/admin.model.js`
   - `user-service/src/services/admin.service.js`
   - `user-service/src/controllers/admin.controller.js`
   - `user-service/src/api/admin.routes.js`

3. **Actualizado**: 
   - `user-service/src/app.js` - Agregada ruta `/admin`
   - `api-gateway/src/app.js` - Eliminada importación de adminRoutes

### URLs antiguas vs nuevas:

| Antes | Ahora |
|-------|-------|
| `http://localhost:3000/admin/all-users` | `http://localhost:3000/u/admin/all-users` |
| `http://localhost:3000/admin/assign-role` | `http://localhost:3000/u/admin/assign-role` |

**Nota**: Las URLs directas al user-service también funcionan: `http://localhost:3001/admin/*`
