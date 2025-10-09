# Orosports Club - API de Microservicios

Esta es la API de backend para el proyecto Orosports Club, construida con una arquitectura de microservicios utilizando Node.js, Express y PostgreSQL.

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

## Configuración del Entorno

1.  **Base de Datos**:
    - Crea una base de datos en PostgreSQL.
    - Ejecuta los scripts SQL necesarios para crear las tablas (puedes generarlos o solicitarlos si no los tienes).

2.  **Variables de Entorno**:
    - En la raíz de **cada microservicio** (`user-service`, `products-service`, etc.), crea un archivo `.env`.
    - Copia y pega el siguiente contenido en cada archivo `.env`, reemplazando los valores con tu configuración local.

    ```env
    # Configuración de la Base de Datos
    DB_USER=tu_usuario_de_bd
    DB_HOST=tu_host_de_bd
    DB_DATABASE=tu_nombre_de_bd
    DB_PASSWORD=tu_contraseña_de_bd
    DB_PORT=tu_puerto_de_bd

    # Puertos de los Microservicios
    API_GATEWAY_PORT=3000
    USER_SERVICE_PORT=3001
    PRODUCTS_SERVICE_PORT=3002
    BUY_SERVICE_PORT=3003
    COURT_SERVICE_PORT=3004
    MATCH_SERVICE_PORT=3005

    # Secret para JWT (en user-service)
    JWT_SECRET=tu_secreto_para_jwt
    ```

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
