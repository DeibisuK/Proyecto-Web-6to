# 🔐 Guía de Configuración de Variables de Entorno

## ⚠️ Problema: ¿Por qué NO subir archivos .env a GitHub?

Los archivos `.env` contienen información **sensible** como:
- 🔑 Contraseñas de bases de datos
- 🔐 Claves secretas de JWT
- 🌐 URLs de servicios externos
- 📧 Credenciales de APIs

**Si se suben a GitHub, cualquiera puede:**
- Acceder a tu base de datos
- Hackear tu aplicación
- Robar información de usuarios
- Usar tus servicios de pago

## ✅ Solución: Archivos .env.example

### ¿Qué es un .env.example?

Es una **plantilla** de tu archivo `.env` con valores de ejemplo (NO REALES):

```env
# ❌ NO SUBIR - .env (archivo real con datos sensibles)
DB_PASSWORD=MiPasswordSuperSecreto123!

# ✅ SÍ SUBIR - .env.example (plantilla sin datos reales)
DB_PASSWORD=your_db_password
```

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)

#### Para Linux/Mac:
```bash
cd OSC-Backend
chmod +x setup-env.sh
./setup-env.sh
```

#### Para Windows/Cualquier OS:
```bash
cd OSC-Backend
node setup-env.js
```

El script te pedirá:
1. Datos de conexión a base de datos
2. Secreto JWT (o lo genera automáticamente)
3. Creará todos los archivos `.env` automáticamente

### Opción 2: Manual

1. **Copia los archivos .env.example a .env en cada servicio:**

```bash
cd OSC-Backend

# API Gateway
cp api-gateway/.env.example api-gateway/.env

# User Service
cp user-service/.env.example user-service/.env

# Products Service
cp products-service/.env.example products-service/.env

# Buy Service
cp buy-service/.env.example buy-service/.env

# Court Service
cp court-service/.env.example court-service/.env

# Match Service
cp match-service/.env.example match-service/.env
```

2. **Edita cada archivo .env** con tus valores reales:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_real
DB_PASSWORD=tu_password_real
DB_NAME=osc_database
JWT_SECRET=genera_un_secret_largo_y_aleatorio
```

## 📋 Estructura de Puertos

Cada microservicio usa un puerto diferente:

| Servicio | Puerto | Variables Únicas |
|----------|--------|------------------|
| API Gateway | 3000 | URLs de otros servicios |
| User Service | 3001 | - |
| Products Service | 3002 | - |
| Buy Service | 3003 | - |
| Court Service | 3004 | - |
| Match Service | 3005 | - |

## 🔧 Variables de Entorno Comunes

Todos los servicios comparten estas variables (excepto el puerto):

```env
# Puerto del servicio (ÚNICO para cada uno)
PORT=300X

# Base de Datos (IGUAL para todos)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=osc_database

# JWT (IGUAL para todos - importante para validación)
JWT_SECRET=tu_secret_compartido
JWT_EXPIRATION=24h

# Entorno
NODE_ENV=development
```

## 🎯 Mejores Prácticas

### 1. .gitignore configurado ✅

Asegúrate que tu `.gitignore` incluya:

```gitignore
# Variables de entorno
.env
.env.local
.env.*.local

# Mantener ejemplos
!.env.example
```

### 2. JWT_SECRET

**❌ NO uses:**
```env
JWT_SECRET=123456
JWT_SECRET=secret
JWT_SECRET=mi_clave
```

**✅ SÍ usa (genera uno aleatorio):**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Diferentes Entornos

Puedes crear múltiples archivos para diferentes ambientes:

```
.env.development    # Desarrollo local
.env.testing        # Pruebas
.env.staging        # Pre-producción
.env.production     # Producción
```

### 4. Documentación para el Equipo

En el README del proyecto, siempre incluye:

```markdown
## 🚀 Setup Inicial

1. Clona el repositorio
2. Copia los archivos de entorno:
   - Ejecuta: `node setup-env.js`
   - O manualmente: `cp .env.example .env` en cada servicio
3. Configura tus variables de entorno
4. Ejecuta: `npm install`
5. Inicia: `npm start`
```

## 🌐 Despliegue en Producción

### Variables en Servicios Cloud:

La mayoría de plataformas tienen sistemas para manejar variables de entorno:

#### Heroku
```bash
heroku config:set DB_PASSWORD=valor_real
heroku config:set JWT_SECRET=valor_real
```

#### Vercel / Netlify
- Panel de configuración → Environment Variables

#### Docker
```dockerfile
# docker-compose.yml
environment:
  - DB_PASSWORD=${DB_PASSWORD}
  - JWT_SECRET=${JWT_SECRET}
```

#### AWS / Azure / GCP
- Usa secretos seguros (AWS Secrets Manager, Azure Key Vault, etc.)

## 📝 Checklist antes de Subir a GitHub

- [ ] `.env` está en `.gitignore`
- [ ] `.env.example` existe con valores de ejemplo
- [ ] No hay contraseñas reales en `.env.example`
- [ ] README documenta cómo configurar el proyecto
- [ ] Script de setup disponible (opcional pero recomendado)
- [ ] Verificar que `.env` no se haya subido:
  ```bash
  git status
  # No debe aparecer .env en la lista
  ```

## 🆘 Si Ya Subiste un .env por Error

1. **Cambia TODAS las contraseñas inmediatamente**
2. **Genera nuevos secretos JWT**
3. **Elimina el archivo del historial de Git:**

```bash
# Eliminar del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ruta/al/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Push forzado
git push origin --force --all
```

4. **Considera el repositorio comprometido** - Cambia todas las credenciales

## 📚 Recursos Adicionales

- [12 Factor App - Config](https://12factor.net/config)
- [dotenv NPM package](https://www.npmjs.com/package/dotenv)
- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Última actualización:** Octubre 2025  
**Autor:** Equipo OSC Backend
