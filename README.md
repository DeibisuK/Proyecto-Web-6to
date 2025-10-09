# Proyecto OSC (Orosports Club)

Este es el repositorio principal del proyecto Orosports Club, una plataforma web completa para la gestión de un club deportivo.

El proyecto está dividido en tres componentes principales:
- **`OSC-Backend`**: Una API RESTful construida con Node.js y Express, siguiendo una arquitectura de microservicios.
- **`OSC-Frontend-Angular`**: Una aplicación de cliente desarrollada con Angular para la interacción de los usuarios.
- **`OSC-Frontend-React`**: (Opcional/Alternativo) Una versión del frontend desarrollada con React.

---

## Backend: API de Microservicios

La API está diseñada como un conjunto de microservicios independientes que se comunican entre sí a través de un API Gateway.

### Microservicios:
- **API Gateway**: Punto de entrada único para todas las peticiones.
- **User Service**: Autenticación, gestión de usuarios y roles.
- **Products Service**: Catálogo de productos, categorías y deportes.
- **Buy Service**: Lógica de carrito de compras y procesamiento de pedidos.
- **Court Service**: Gestión y reserva de canchas.
- **Match Service**: Organización de partidos, equipos y estadísticas.

Para obtener instrucciones detalladas sobre cómo configurar y ejecutar el backend, consulta el archivo `README.md` dentro de la carpeta `OSC-Backend`.

➡️ **[Instrucciones del Backend](./OSC-Backend/README.md)**

---

## Frontend: Aplicaciones de Cliente

### Angular

La aplicación principal para los usuarios está desarrollada con Angular.

#### Instalación y Ejecución (Angular)

1.  **Navega a la carpeta del frontend**:
    ```bash
    cd OSC-Frontend-Angular
    ```
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Inicia el servidor de desarrollo**:
    ```bash
    npm start
    ```
    La aplicación estará disponible en `http://localhost:4200`.

---

## Prerrequisitos Generales

- **Node.js**: Versión 18.x o superior.
- **npm**: Gestor de paquetes de Node.js.
- **PostgreSQL**: Base de datos para el backend.
- **Angular CLI**: `npm install -g @angular/cli` (si vas a trabajar con el frontend de Angular).

---

Este proyecto es parte de un desarrollo académico y está en constante evolución.
