# 💳 API de Métodos de Pago - Documentación

## 📋 Índice
- [Configuración Inicial](#configuración-inicial)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Endpoints de la API](#endpoints-de-la-api)
- [Seguridad y Encriptación](#seguridad-y-encriptación)
- [Uso desde el Frontend](#uso-desde-el-frontend)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🔧 Configuración Inicial

### 1. Crear la tabla en PostgreSQL

Ejecuta el script SQL ubicado en:
```bash
OSC-Backend/user-service/sql/metodos_pago.sql
```

O ejecuta directamente:
```sql
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL,
    numero_tarjeta TEXT NOT NULL,
    fecha_expiracion VARCHAR(10) NOT NULL,
    cvv TEXT NOT NULL,
    banco VARCHAR(100),
    tipo_tarjeta VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metodos_pago_usuario ON metodos_pago(firebase_uid);
```

### 2. Configurar variable de entorno

Agrega al archivo `.env` del user-service:
```env
ENCRYPTION_KEY=clave-super-secreta-32-chars!!
```

⚠️ **IMPORTANTE**: La clave DEBE tener exactamente 32 caracteres para AES-256.

### 3. Iniciar el servicio

```bash
cd OSC-Backend/user-service
npm start
```

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `metodos_pago`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_metodo_pago` | SERIAL | ID único (Primary Key) |
| `firebase_uid` | VARCHAR(255) | UID del usuario en Firebase |
| `numero_tarjeta` | TEXT | Número de tarjeta **ENCRIPTADO** |
| `fecha_expiracion` | VARCHAR(10) | Formato MM/YY o MM/YYYY |
| `cvv` | TEXT | CVV **ENCRIPTADO** |
| `banco` | VARCHAR(100) | Banco detectado (Visa, Mastercard, etc.) |
| `tipo_tarjeta` | VARCHAR(100) | Tipo de tarjeta |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `fecha_actualizacion` | TIMESTAMP | Fecha de última actualización |

---

## 🌐 Endpoints de la API

**Base URL**: `http://localhost:3001/metodos-pago`

### 1. **Listar métodos de pago de un usuario**

```http
GET /metodos-pago/user/:firebase_uid
```

**Ejemplo de respuesta:**
```json
[
  {
    "id_metodo_pago": 1,
    "firebase_uid": "abc123xyz",
    "numero_tarjeta": "****1234",
    "fecha_expiracion": "12/25",
    "cvv": "***",
    "banco": "Visa",
    "tipo_tarjeta": "Visa",
    "fecha_creacion": "2025-01-15T10:30:00Z"
  }
]
```

---

### 2. **Obtener un método de pago por ID**

```http
GET /metodos-pago/:id?firebase_uid=abc123xyz
```

**Query Parameters:**
- `firebase_uid` (requerido): Para validar propiedad

**Ejemplo de respuesta:**
```json
{
  "id_metodo_pago": 1,
  "numero_tarjeta": "****1234",
  "fecha_expiracion": "12/25",
  "cvv": "***",
  "banco": "Visa",
  "tipo_tarjeta": "Visa"
}
```

---

### 3. **Crear un método de pago**

```http
POST /metodos-pago
```

**Body (JSON):**
```json
{
  "firebase_uid": "abc123xyz",
  "numero_tarjeta": "4111111111111111",
  "fecha_expiracion": "12/25",
  "cvv": "123"
}
```

**Validaciones automáticas:**
- ✅ Número de tarjeta: 13-19 dígitos
- ✅ CVV: 3-4 dígitos
- ✅ Fecha: Formato MM/YY o MM/YYYY
- ✅ Detección automática de banco y tipo

**Respuesta exitosa (201):**
```json
{
  "message": "Método de pago creado correctamente",
  "metodo": {
    "id_metodo_pago": 1,
    "numero_tarjeta": "****1111",
    "fecha_expiracion": "12/25",
    "cvv": "***",
    "banco": "Visa",
    "tipo_tarjeta": "Visa"
  }
}
```

---

### 4. **Actualizar un método de pago**

```http
PUT /metodos-pago/:id
```

**Body (JSON):**
```json
{
  "firebase_uid": "abc123xyz",
  "numero_tarjeta": "5500000000000004",
  "fecha_expiracion": "06/26",
  "cvv": "456"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Método de pago actualizado correctamente",
  "metodo": {
    "id_metodo_pago": 1,
    "numero_tarjeta": "****0004",
    "banco": "Mastercard",
    "tipo_tarjeta": "Mastercard"
  }
}
```

---

### 5. **Eliminar un método de pago**

```http
DELETE /metodos-pago/:id?firebase_uid=abc123xyz
```

**Query Parameters:**
- `firebase_uid` (requerido): Para validar propiedad

**Respuesta exitosa (200):**
```json
{
  "message": "Método de pago eliminado correctamente"
}
```

---

## 🔐 Seguridad y Encriptación

### ¿Qué se encripta?
- ✅ Número de tarjeta completo
- ✅ CVV

### ¿Qué NO se encripta?
- ❌ Fecha de expiración (no es sensible)
- ❌ Banco detectado
- ❌ Tipo de tarjeta

### Algoritmo de encriptación
- **AES-256-CBC**: Estándar de la industria
- **IV aleatorio**: Cada valor tiene un IV único
- **Formato**: `iv:datosEncriptados`

### Flujo de seguridad

1. **Frontend → API**: Datos en texto plano (HTTPS)
2. **API → Base de datos**: Datos encriptados
3. **Base de datos → API**: Datos encriptados
4. **API → Frontend**: Datos enmascarados (****1234)

---

## 💻 Uso desde el Frontend

### Obtener Firebase UID del usuario autenticado

```typescript
// En tu servicio de autenticación (auth.service.ts)
import { Auth, user } from '@angular/fire/auth';

export class AuthService {
  user$ = user(this.auth);
  
  get currentUser() {
    return this.auth.currentUser;
  }
  
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }
}
```

### Servicio de Métodos de Pago (Angular)

```typescript
// metodo-pago.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3001/metodos-pago';
  
  // Listar métodos de pago del usuario actual
  getMetodosPago() {
    const uid = this.authService.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/user/${uid}`);
  }
  
  // Crear método de pago
  createMetodoPago(data: any) {
    const uid = this.authService.getCurrentUserId();
    return this.http.post(this.apiUrl, {
      firebase_uid: uid,
      ...data
    });
  }
  
  // Actualizar método de pago
  updateMetodoPago(id: number, data: any) {
    const uid = this.authService.getCurrentUserId();
    return this.http.put(`${this.apiUrl}/${id}`, {
      firebase_uid: uid,
      ...data
    });
  }
  
  // Eliminar método de pago
  deleteMetodoPago(id: number) {
    const uid = this.authService.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/${id}?firebase_uid=${uid}`);
  }
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Listar tarjetas en el perfil

```typescript
// perfil.component.ts
export class PerfilComponent implements OnInit {
  metodosPago: any[] = [];
  
  ngOnInit() {
    this.metodoPagoService.getMetodosPago().subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
      },
      error: (error) => {
        console.error('Error al cargar métodos de pago:', error);
      }
    });
  }
}
```

### Ejemplo 2: Agregar nueva tarjeta

```typescript
// agregar-tarjeta.component.ts
agregarTarjeta() {
  const nuevaTarjeta = {
    numero_tarjeta: '4111111111111111',
    fecha_expiracion: '12/25',
    cvv: '123'
  };
  
  this.metodoPagoService.createMetodoPago(nuevaTarjeta).subscribe({
    next: (response) => {
      console.log('Tarjeta agregada:', response);
      this.notificationService.success('Tarjeta agregada correctamente');
    },
    error: (error) => {
      console.error('Error:', error);
      this.notificationService.error(error.error.error);
    }
  });
}
```

### Ejemplo 3: Eliminar tarjeta

```typescript
eliminarTarjeta(id: number) {
  if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
    this.metodoPagoService.deleteMetodoPago(id).subscribe({
      next: () => {
        this.metodosPago = this.metodosPago.filter(m => m.id_metodo_pago !== id);
        this.notificationService.success('Tarjeta eliminada');
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}
```

---

## 🎯 Bancos y Tarjetas Detectadas Automáticamente

| Primer(os) Dígito(s) | Banco/Tipo |
|---------------------|------------|
| 4 | Visa |
| 5, 2221-2720 | Mastercard |
| 34, 37 | American Express |
| 6011, 644-649, 65 | Discover |
| 30, 36, 38 | Diners Club |
| 35 | JCB |
| 1 | Tarjeta de Crédito |
| 7 | Tarjeta de Débito |
| 0 | Tarjeta Prepago |

---

## ✅ Checklist de Implementación

- [x] Tabla creada en PostgreSQL
- [x] Variable `ENCRYPTION_KEY` configurada en `.env`
- [x] Modelo con encriptación/desencriptación
- [x] Service layer
- [x] Controller con validaciones
- [x] Routes configuradas en `app.js`
- [x] Detección automática de banco
- [x] Enmascaramiento de datos sensibles
- [ ] Pruebas con Postman/Thunder Client
- [ ] Integración con frontend Angular

---

## 🔍 Cómo Funciona el Firebase UID

1. **Usuario inicia sesión** → Firebase Auth genera un `uid` único
2. **Frontend obtiene el uid** → `authService.currentUser.uid`
3. **Frontend envía el uid** → En cada request a la API
4. **API valida propiedad** → Solo el dueño puede ver/editar/eliminar sus tarjetas
5. **Base de datos filtra** → `WHERE firebase_uid = $1`

**Flujo completo:**
```
Usuario → Login Firebase → UID generado → Guardado en frontend
                                             ↓
                                    Enviado en requests
                                             ↓
                                    Backend valida ownership
                                             ↓
                                    Base de datos filtra por UID
```

---

## 🚨 Notas de Seguridad

⚠️ **NUNCA exponer**:
- Número de tarjeta completo en respuestas
- CVV en respuestas (ni siquiera enmascarado)
- Clave de encriptación (`ENCRYPTION_KEY`)

✅ **Siempre validar**:
- Propiedad del método de pago (`firebase_uid`)
- Formato de tarjeta (13-19 dígitos)
- Formato de CVV (3-4 dígitos)
- Fecha de expiración válida

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que la tabla esté creada
2. Verifica que `ENCRYPTION_KEY` esté configurada (32 caracteres)
3. Verifica que el servicio esté corriendo
4. Revisa los logs del servidor

**Puerto del servicio**: `3001` (user-service)
