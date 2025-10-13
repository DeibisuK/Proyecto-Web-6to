# Orosports Club - API de Microservicios

Esta es la API de**📖 Documentación:**

- 📘 **[GUIA-RAPIDA.md](./GUIA-RAPIDA.md)** - Tu configuración actual (DigitalOcean) con ejemplos
- 📗 **[ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md)** - Guía completa con mejores prácticas y teoría
- 📙 **[.env-quick-ref.md](./.env-quick-ref.md)** - Referencia rápida de comandos y troubleshooting

**⚠️ IMPORTANTE:**d para el proyecto Orosports Club, construida con una arquitectura de microservicios utilizando Node.js, Express y PostgreSQL.

## Arquitectura

La API está dividida en varios microservicios, cada uno responsable de una parte específica de la lógica de negocio. Un API Gateway actúa como punto de entrada único para todas las peticiones de los clientes, enrutándolas al servicio correspondiente.

- **API Gateway**: Punto de entrada que redirige las peticiones a los demás servicios.
- **User Service**: Gestiona usuarios y roles.
- **Products Service**: Gestiona productos, categorías, deportes e imágenes de productos.
- **Buy Service**: Gestiona el carrito de compras y el proceso de pedidos.
- **Court Service**: Gestiona las canchas y las reservas.
- **Match Service**: Gestiona partidos, equipos, árbitros y estadísticas.

## Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- [PostgreSQL](https://www.postgresql.org/) como base de datos.
- Un cliente de base de datos como [DBeaver](https://dbeaver.io/) o [pgAdmin](https://www.pgadmin.org/).

## 🚀 Configuración Rápida

### 1. Base de Datos
- Crea una base de datos en PostgreSQL
- Ejecuta los scripts SQL necesarios para crear las tablas

### 2. Variables de Entorno (MUY IMPORTANTE)

**⚡ Opción Rápida - Script Automático (Recomendado):**

```bash
# Desde la carpeta OSC-Backend
node setup-env.js
```

El script te guiará en la configuración de:
- ✅ Conexión a base de datos
- ✅ Secreto JWT (lo genera automáticamente si lo deseas)
- ✅ Creación de archivos .env para todos los servicios

**📋 Opción Manual:**

Si prefieres hacerlo manualmente, copia los archivos `.env.example` a `.env` en cada servicio:

```bash
cd OSC-Backend

# Copiar plantillas
cp api-gateway/.env.example api-gateway/.env
cp user-service/.env.example user-service/.env
cp products-service/.env.example products-service/.env
cp buy-service/.env.example buy-service/.env
cp court-service/.env.example court-service/.env
cp match-service/.env.example match-service/.env

# Luego edita cada .env con tus valores reales
```

**📖 Documentación:**

- 📘 **[ESTRUCTURA-ENV.md](./ESTRUCTURA-ENV.md)** - Tu configuración actual (DigitalOcean)
- � **[ENV-SETUP-GUIDE.md](./ENV-SETUP-GUIDE.md)** - Guía completa con mejores prácticas
- 📙 **[.env-quick-ref.md](./.env-quick-ref.md)** - Referencia rápida de comandos

**⚠️ IMPORTANTE:**
- NUNCA subas archivos `.env` a GitHub (ya están en `.gitignore`)
- Los archivos `.env.example` SÍ se deben subir (son plantillas sin datos sensibles)
- Todos los servicios comparten la misma base de datos PostgreSQL en DigitalOcean
- Cada servicio usa un puerto diferente pero la misma configuración de BD

## Instalación y Ejecución

Para cada microservicio (incluyendo el `api-gateway`), sigue estos pasos:

1.  **Navega al directorio del servicio**:
    ```bash
    cd RUTA_DEL_PROYECTO/OSC-Backend/nombre-del-servicio
    ```

2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
    *Nota: Para los servicios `buy-service`, `court-service` y `match-service` que usan `uuid`, puede que necesites instalarlo manualmente si no se añadió al `package.json`: `npm install uuid`.*

3.  **Inicia el servicio en modo de desarrollo** (se reinicia automáticamente con los cambios):
    ```bash
    npm run dev
    ```
    O para producción:
    ```bash
    npm start
    ```

4.  Repite estos pasos para todos los microservicios que necesites tener en funcionamiento. Para que la aplicación funcione completamente, todos los servicios deben estar corriendo simultáneamente.

---

¡Con esto, la API de Orosports Club estará lista para recibir peticiones!
