# Docker Setup para OSC Backend

Este documento explica cómo desplegar la arquitectura de microservicios usando Docker y Docker Compose.

## 📋 Prerrequisitos

- Docker instalado en tu sistema
- Docker Compose instalado
- Archivos `.env` configurados (usa `node setup-env.js` si no los tienes)

## 🏗️ Arquitectura de Contenedores

### Servicios incluidos:
- **api-gateway** (puerto 3000) - Punto de entrada principal
- **user-service** (puerto 3001) - Gestión de usuarios
- **products-service** (puerto 3002) - Gestión de productos
- **buy-service** (puerto 3003) - Gestión de compras
- **court-service** (puerto 3004) - Gestión de canchas
- **match-service** (puerto 3005) - Gestión de partidos
- **cloudinary-service** (puerto 3006) - Servicio de imágenes

### Dockerfiles:
Cada servicio tiene su propio `Dockerfile` optimizado:
- Imagen base: Node.js 18 Alpine (ligera)
- Puerto específico expuesto para cada servicio
- Instalación de dependencias de producción únicamente
- Cache optimizado para builds rápidos
- **Archivo `dotenv.js` copiado localmente** para configuración de entorno

### Red de comunicación:
Todos los servicios están conectados a la red `osc-network` para comunicación interna entre servicios.

### 1. Construir e iniciar todos los servicios

```bash
# Desde el directorio OSC-Backend
cd OSC-Backend

# Construir e iniciar todos los servicios
docker-compose up --build
```

### 2. Iniciar en segundo plano (detached)

```bash
# Iniciar servicios en background
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 3. Iniciar servicios individuales

```bash
# Solo API Gateway
docker-compose up api-gateway

# Múltiples servicios
docker-compose up api-gateway user-service products-service
```

## 🏗️ Arquitectura de Contenedores

### Servicios incluidos:
- **api-gateway** (puerto 3000) - Punto de entrada principal
- **user-service** (puerto 3001) - Gestión de usuarios
- **products-service** (puerto 3002) - Gestión de productos
- **buy-service** (puerto 3003) - Gestión de compras
- **court-service** (puerto 3004) - Gestión de canchas
- **match-service** (puerto 3005) - Gestión de partidos
- **cloudinary-service** (puerto 3006) - Servicio de imágenes

### Red de comunicación:
Todos los servicios están conectados a la red `osc-network` para comunicación interna.

## 🔧 Configuración de Variables de Entorno

### Archivos de entorno:
- **`.env`** (raíz) - Variables comunes (DB, Google Credentials)
- **`micro-servicios/{servicio}/.env`** - Variables específicas de cada servicio

### Variables importantes:
- `DB_HOST`: URL de la base de datos PostgreSQL
- `DB_PORT`: Puerto de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `GOOGLE_APPLICATION_CREDENTIALS`: Ruta al archivo JSON de Firebase

## 📊 Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs api-gateway

# Ejecutar comandos en un contenedor
docker-compose exec api-gateway sh

# Reconstruir un servicio específico
docker-compose up --build api-gateway

# Limpiar contenedores e imágenes
docker-compose down --volumes --rmi all

# Ver uso de recursos
docker stats
```

## 🌐 Acceso a los Servicios

- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001 (acceso interno)
- **Products Service**: http://localhost:3002 (acceso interno)
- **Buy Service**: http://localhost:3003 (acceso interno)
- **Court Service**: http://localhost:3004 (acceso interno)
- **Match Service**: http://localhost:3005 (acceso interno)
- **Cloudinary Service**: http://localhost:3006 (acceso interno)

## 🚀 Despliegue en Producción

### Usando Docker Compose en servidor:

```bash
# En el servidor
git clone <tu-repo>
cd OSC-Backend
docker-compose -f docker-compose.yml up -d --build
```

### Consideraciones para producción:
- Configurar variables de entorno de producción
- Usar secrets para contraseñas sensibles
- Configurar reverse proxy (nginx) para el puerto 3000
- Configurar SSL/TLS
- Configurar monitoreo y logging
- Configurar backup de base de datos

## 🔍 Troubleshooting

### Problemas comunes:

1. **Puerto ya en uso**: Cambia los puertos en `docker-compose.yml`
2. **Error de conexión a DB**: Verifica las variables de entorno de DB
3. **Servicio no inicia**: Revisa logs con `docker-compose logs <servicio>`
4. **Dependencias faltantes**: Asegúrate de que todos los `.env` estén configurados

### Debug:
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Acceder a un contenedor
docker-compose exec api-gateway sh

# Ver variables de entorno en contenedor
docker-compose exec api-gateway env
```

## 📝 Notas

- Los archivos `.env` no se incluyen en las imágenes Docker por seguridad
- Cada servicio se reconstruye automáticamente cuando cambias su código
- La red `osc-network` permite comunicación interna entre servicios
- El API Gateway es el único servicio expuesto externamente