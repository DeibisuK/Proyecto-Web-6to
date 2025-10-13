# Proyecto OSC (Orosports Club)

Este es el repositorio principal del proyecto Orosports Club, una plataforma web completa para la gestión de un club deportivo y centro de servicios deportivos.

El proyecto está dividido en dos componentes principales:
- **`OSC-Backend`**: Una API RESTful construida con Node.js y Express, siguiendo una arquitectura de microservicios.
- **`OSC-Frontend-Angular`**: Una aplicación de cliente desarrollada con Angular 20.3.0 para la interacción de los usuarios.

---

## Backend: API de Microservicios

La API está diseñada como un conjunto de microservicios independientes que se comunican entre sí a través de un API Gateway.

### Microservicios:
- **API Gateway**: Punto de entrada único para todas las peticiones (Puerto 3000).
- **User Service**: Autenticación, gestión de usuarios y roles (Puerto 3001).
- **Products Service**: Catálogo de productos deportivos, categorías y deportes (Puerto 3002).
- **Buy Service**: Lógica de carrito de compras y procesamiento de pedidos (Puerto 3003).
- **Court Service**: Gestión y reserva de canchas deportivas (Puerto 3004).
- **Match Service**: Organización de partidos, equipos y estadísticas (Puerto 3005).

### Tecnologías Backend:
- Node.js con Express
- PostgreSQL como base de datos
- JWT para autenticación
- CORS habilitado
- dotenv para variables de entorno

Para obtener instrucciones detalladas sobre cómo configurar y ejecutar el backend, consulta el archivo [`README.md`](OSC-Backend/README.md) dentro de la carpeta `OSC-Backend`.

➡️ **[Instrucciones del Backend](./OSC-Backend/README.md)**

---

## 🚀 Inicio Rápido (Todo Automático)

### Opción 1: Inicio Completo (Backend + Frontend)

```bash
# En la raíz del proyecto
npm start
```

Este comando hace **TODO automáticamente**:
1. ✅ **Detecta archivos `.env` faltantes** y ejecuta la configuración automática
2. ✅ **Instala dependencias** de todos los microservicios del backend
3. ✅ **Inicia todos los microservicios** (puertos 3000-3005)
4. ✅ **Inicia el frontend Angular** en http://localhost:4200

### Opción 2: Solo Backend

```bash
npm run start:backend
```

Ejecuta solo los microservicios del backend con configuración automática de `.env`.

### Opción 3: Solo Frontend

```bash
npm run start:frontend
```

Inicia únicamente la aplicación Angular.

### Opción 4: Configurar Variables de Entorno Manualmente

```bash
npm run setup:env
```

Ejecuta el asistente interactivo de configuración de variables de entorno.

---

## 📋 Primera Vez en el Proyecto

Si es la **primera vez** que ejecutas el proyecto:

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/DeibisuK/Proyecto-Web-6to.git
   cd Proyecto-Web-6to
   ```

2. **Instala Node.js** (versión 18.x o superior)

3. **Configura PostgreSQL**:
   - Crea una base de datos en PostgreSQL
   - Ejecuta los scripts SQL necesarios (si existen)

4. **Inicia el proyecto**:
   ```bash
   npm start
   ```

5. **Sigue las instrucciones** en la terminal:
   - Si faltan archivos `.env`, el script los detectará automáticamente
   - Ingresa las credenciales de tu base de datos DigitalOcean
   - El script creará todos los archivos `.env` necesarios

6. **¡Listo!** El backend estará en `http://localhost:3000` y el frontend en `http://localhost:4200`

---

## ⚙️ Configuración de Variables de Entorno

El proyecto incluye un sistema automatizado para configurar las variables de entorno:

- **Archivos `.env.example`**: Plantillas de configuración (se suben a Git)
- **Archivos `.env`**: Configuración real con credenciales (NO se suben a Git)
- **Script automático**: [`setup-env.js`](OSC-Backend/setup-env.js) configura todo

### Script de Inicio del Backend

El script [`start-backend.js`](start-backend.js) incluye:
- ✅ Detección automática de archivos `.env` faltantes
- ✅ Ejecución del asistente de configuración si es necesario
- ✅ Instalación de dependencias
- ✅ Inicio paralelo de todos los microservicios

Para más información sobre variables de entorno, consulta:
- 📘 [`OSC-Backend/GUIA-RAPIDA.md`](OSC-Backend/GUIA-RAPIDA.md)
- 📗 [`OSC-Backend/ENV-SETUP-GUIDE.md`](OSC-Backend/ENV-SETUP-GUIDE.md)

---

## Frontend: Aplicación Angular

La aplicación principal para los usuarios está desarrollada con Angular 20.3.0 utilizando componentes standalone y arquitectura modular.

### Estructura del Frontend:

#### Módulo Cliente (`/client`):
- **Home**: Página principal con galería interactiva y características principales
- **Shop**: Tienda de productos deportivos con sistema de filtros y carrito
  - Componentes: Productos relacionados, detalle de producto, filtros
  - Servicio: [`ProductoService`](OSC-Frontend-Angular/src/app/client/features/shop/services/producto.service.ts)
- **Reservas**: Sistema de reserva de canchas deportivas
- **Artículos**: Blog con artículos deportivos
  - Páginas individuales: Cancha de fútbol, Estudio deportivo, Instalaciones de pádel
  - Rutas lazy-loaded en [`articulos.routes.ts`](OSC-Frontend-Angular/src/app/client/features/articulos/articulos.routes.ts)
- **Contacto**: Formulario de contacto con validación
- **Información**:
  - Nosotros: Historia, Misión/Visión, Equipo
  - Legal: Términos y Condiciones, Política de Privacidad
  - Puntos de Lealtad

#### Módulo Administrador (`/admin`):
- **Canchas**: Gestión de canchas (en desarrollo)
- **Anuncios**: Gestión de anuncios (en desarrollo)
- **Sedes**: Gestión de sedes (en desarrollo)

#### Módulo de Acceso (`/acceso`):
- **Login**: Sistema de autenticación con formularios de login y registro
- **Recuperar Password**: Recuperación de contraseña

#### Componentes Core:
- **Navbar**: Navegación principal con dropdowns y menú móvil
- **Footer**: Enlaces rápidos y redes sociales
- **Anuncio**: Sistema de anuncios (componente base)

### Características Principales:

1. **Arquitectura Standalone**: Todos los componentes utilizan la nueva arquitectura standalone de Angular
2. **Lazy Loading**: Rutas con carga diferida para optimizar el rendimiento
3. **Responsive Design**: Diseño adaptativo para dispositivos móviles y desktop
4. **Servicios Compartidos**: 
   - [`ProductoService`](OSC-Frontend-Angular/src/app/client/features/shop/services/producto.service.ts): Gestión de productos
   - [`ArticlesService`](OSC-Frontend-Angular/src/app/client/shared/services/articles.service.ts): Gestión de artículos
5. **Modelos TypeScript**: Interfaces para Producto, Article, TeamMember, Valor
6. **Estilos Modernos**: CSS con animaciones, transiciones y efectos hover
7. **Sistema de Rutas**: Configuración en [`cliente.routes.ts`](OSC-Frontend-Angular/src/app/client/cliente.routes.ts)

### 🔗 Integración con React (Experimental)

El proyecto incluye capacidades para integrar componentes React dentro de Angular, permitiendo aprovechar lo mejor de ambos frameworks.

#### Guías de Desarrollo React:
📚 **[Guía: Crear Componentes React en Angular](./OSC-Frontend-Angular/CREATE-REACT-COMPONENTS-GUIDE.md)**
- Cómo crear componentes React (.tsx)
- Integración con Angular mediante wrapper
- Comunicación bidireccional entre frameworks
- Componentes avanzados y best practices
- Troubleshooting común

📦 **[Guía: Usar Dependencias de React](./OSC-Frontend-Angular/REACT-DEPENDENCIES-GUIDE.md)**
- Instalación de librerías React (react-icons, Material UI, etc.)
- Ejemplos con librerías populares (recharts, framer-motion, react-hook-form)
- Integración de state management (zustand, redux)
- Componentes de UI y animaciones

#### Características de Integración React:
- ✅ Componentes React en archivos `.tsx`
- ✅ Props y eventos entre Angular y React
- ✅ Soporte para hooks de React
- ✅ Compartir estado entre frameworks
- ✅ Uso de cualquier librería del ecosistema React
- ✅ TypeScript completo en componentes React

### Instalación y Ejecución (Angular)

1. **Navega a la carpeta del frontend**:
   ```bash
   cd OSC-Frontend-Angular
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm start
   ```
   La aplicación estará disponible en `http://localhost:4200`.

4. **Otros comandos disponibles**:
   ```bash
   npm run build         # Compilar para producción
   npm run watch         # Compilar en modo desarrollo con observación
   npm test             # Ejecutar tests unitarios
   ```

---

## Prerrequisitos Generales

- **Node.js**: Versión 18.x o superior
- **npm**: Gestor de paquetes de Node.js
- **PostgreSQL**: Base de datos para el backend (versión compatible con pg)
- **Angular CLI**: `npm install -g @angular/cli` (versión 20.x o superior)
- **Cliente de BD**: DBeaver o pgAdmin (recomendado para gestión de base de datos)

---

## Estructura del Proyecto

```
Proyecto-Web-6to/
├── OSC-Backend/
│   ├── api-gateway/
│   ├── buy-service/
│   ├── court-service/
│   ├── match-service/
│   ├── products-service/
│   ├── user-service/
│   └── README.md
├── OSC-Frontend-Angular/
│   ├── src/
│   │   ├── app/
│   │   │   ├── acceso/
│   │   │   ├── admin/
│   │   │   ├── client/
│   │   │   └── core/
│   │   │       └── react-components/      # 📂 Componentes React
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   ├── CREATE-REACT-COMPONENTS-GUIDE.md  # 📚 Guía React
│   ├── REACT-DEPENDENCIES-GUIDE.md       # 📦 Guía Dependencias
│   └── README.md
├── start-backend.js
├── package.json
└── README.md
```

---

## Notas del Proyecto

**OSC Sport Center** es un proyecto académico desarrollado por:
- Gary Barreiro (Frontend Developer) - gbarreiro2@utmachala.edu.ec
- Jhon Cruz (Full Stack Developer) - jcruz21@utmachala.edu.ec
- Javier Cellan (Backend Developer) - jcellan2@utmachala.edu.ec

Para la **Universidad Técnica de Machala**.

### Propósito:
- Simular operaciones de reserva de canchas deportivas
- Simular operaciones de compra en tienda deportiva
- Sistema de puntos de lealtad (demostrativo)
- **Nota importante**: No se procesan pagos reales ni se entregan productos físicos

---

Este proyecto es parte de un desarrollo académico y está en constante evolución.
