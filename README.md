# Proyecto OSC (Orosports Club)

Este es el repositorio principal del proyecto Orosports Club, una plataforma web completa para la gestión de un club deportivo y centro de servicios deportivos.

El proyecto está dividido en dos componentes principales:
- **`OSC-Backend`**: Una API RESTful construida con Node.js y Express, siguiendo una arquitectura de microservicios.
- **`osc-frontend`**: Una aplicación de cliente desarrollada con Angular 20.3.4 para la interacción de los usuarios.

---

## Backend: API de Microservicios

La API está diseñada como un conjunto de microservicios independientes que se comunican entre sí a través de un API Gateway.

### Microservicios:
- **API Gateway**: Punto de entrada único para todas las peticiones (Puerto 3000).
- **User Service**: Autenticación, gestión de usuarios y roles (Puerto 3001).
- **Products Service**: Catálogo de productos deportivos, categorías y deportes (Puerto 3002).
- **Buy Service**: Lógica de carrito de compras, procesamiento de pedidos e inscripciones a torneos (Puerto 3003).
- **Court Service**: Gestión y reserva de canchas deportivas, gestión de torneos (Puerto 3004).
- **Match Service**: Organización de partidos, equipos, árbitros y estadísticas (Puerto 3005).
- **Cloudinary Service**: Gestión de imágenes y archivos multimedia (Puerto 3006).
- **Subscription Service**: Sistema de suscripciones premium con Firebase Custom Claims (Puerto 3007).

### Tecnologías Backend:
- Node.js con Express
- PostgreSQL como base de datos (DigitalOcean)
- Firebase Admin SDK para autenticación y Custom Claims
- JWT para autenticación
- CORS habilitado
- dotenv para variables de entorno
- Cloudinary para gestión de imágenes
- http-proxy-middleware para el API Gateway

Para obtener instrucciones detalladas sobre cómo configurar y ejecutar el backend, consulta el archivo [`README.md`](OSC-Backend/README.md) dentro de la carpeta `OSC-Backend`.

➡️ **[Instrucciones del Backend](./OSC-Backend/README.md)**

---

## 🚀 Inicio Rápido (Todo Automático)

### Opción 1: Solo Backend (Recomendado)

```bash
# En la raíz del proyecto
npm start
```

Este comando hace **TODO automáticamente**:
1. ✅ **Detecta archivos `.env` faltantes** y ejecuta la configuración automática
2. ✅ **Instala dependencias** de todos los microservicios del backend
3. ✅ **Inicia todos los microservicios** (puertos 3000-3007)

Luego, **en otra terminal**, inicia el frontend:

```bash
cd osc-frontend
npm install
ng serve --open
```

### Opción 2: Backend y Frontend en Paralelo

```bash
# Inicia backend y frontend simultáneamente
npm run start
```

⚠️ **Nota:** Esta opción solo funciona bien si los `.env` ya están configurados.

### Opción 3: Iniciar Solo Backend

```bash
npm run backend
```

Ejecuta solo los microservicios del backend con configuración automática de `.env`.

### Opción 4: Iniciar Solo Frontend

```bash
npm run frontend
```

Inicia únicamente la aplicación Angular (después de instalar dependencias).

### Opción 5: Configurar Variables de Entorno Manualmente

Si necesitas reconfigurar o configurar por primera vez:

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

4. **Inicia el backend**:
   ```bash
   npm start
   ```

5. **Sigue las instrucciones** en la terminal:
   - Si faltan archivos `.env`, el script los detectará automáticamente
   - Ingresa las credenciales de tu base de datos DigitalOcean
   - El script creará todos los archivos `.env` necesarios
   - Espera a que todos los servicios se inicien

6. **En otra terminal, inicia el frontend**:
   ```bash
   cd osc-frontend
   npm install
   ng serve --open
   ```

7. **¡Listo!** El backend estará en `http://localhost:3000` y el frontend en `http://localhost:4200`

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
- 📘 [`OSC-Backend/docs/ENV-SETUP-GUIDE.md`](OSC-Backend/docs/ENV-SETUP-GUIDE.md)

---

## Frontend: Aplicación Angular

La aplicación principal para los usuarios está desarrollada con Angular 20.3.4 utilizando componentes standalone y arquitectura modular.

### Estructura del Frontend:

#### Módulo Cliente (`/client`):
- **Home**: Página principal con galería interactiva y características principales
- **Shop**: Tienda de productos deportivos con sistema de filtros y carrito
  - Componentes: Productos relacionados, detalle de producto, filtros
  - Servicio: `ProductoService`
  - Carrito integrado en navbar (componente React)
  - Sistema de pedidos y seguimiento
- **Reservas**: Sistema completo de gestión deportiva
  - Reserva de canchas deportivas
  - Gestión de equipos (crear, editar, listar)
  - Dashboard de torneos con estadísticas
  - Clasificaciones y tabla de posiciones
  - Historial de partidos
  - Inscripciones a torneos
- **Sedes**: Listado y detalle de sedes deportivas
- **Artículos**: Blog con artículos deportivos
  - Páginas individuales: Cancha de fútbol, Estudio deportivo, Instalaciones de pádel
  - Rutas lazy-loaded
- **Contacto**: Formulario de contacto con validación
- **Suscripciones**: Sistema Premium
  - Planes de suscripción (mensual/anual)
  - Gestión de suscripción actual
  - Verificación mediante Firebase Custom Claims
- **Información**:
  - Nosotros: Historia, Misión/Visión, Equipo
  - Legal: Términos y Condiciones, Política de Privacidad
  - Puntos de Lealtad
- **Perfil de Usuario**:
  - Ver y editar perfil
  - Métodos de pago
  - Mis pedidos y seguimiento

#### Módulo Administrador (`/admin`):
- **Dashboard**: Panel de control administrativo
- **Gestión de Productos**: CRUD completo de productos
- **Gestión de Canchas**: Administración de canchas deportivas
- **Gestión de Anuncios**: Sistema de anuncios
- **Gestión de Sedes**: Administración de sedes
- **Gestión de Equipos**: Administración de equipos deportivos
- **Gestión de Usuarios**: Administración de usuarios y roles

#### Módulo de Autenticación (`/auth`):
- **Login**: Sistema de autenticación con Firebase
  - Login con email/password
  - Registro de nuevos usuarios
  - Google Sign-In
- **Recuperar Password**: Recuperación de contraseña con Firebase

#### Módulo de Autenticación (`/auth`):
- **Login**: Sistema de autenticación con Firebase
  - Login con email/password
  - Registro de nuevos usuarios
  - Google Sign-In
- **Recuperar Password**: Recuperación de contraseña con Firebase

#### Componentes Core:
- **Navbar**: Navegación principal con dropdowns, menú móvil y carrito integrado (React)
- **Footer**: Enlaces rápidos y redes sociales
- **Guards**: 
  - `authGuard`: Protege rutas que requieren autenticación
  - `subscriptionGuard`: Protege rutas que requieren suscripción premium
  - `premiumGuard`: Combinación de auth + suscripción
  - `adminGuard`: Protege rutas administrativas

### Características Principales:

1. **Arquitectura Standalone**: Todos los componentes utilizan la nueva arquitectura standalone de Angular 20
2. **Lazy Loading**: Rutas con carga diferida para optimizar el rendimiento
3. **Responsive Design**: Diseño adaptativo para dispositivos móviles y desktop
4. **Integración React**: Soporte para componentes React dentro de Angular
   - Carrito de compras en React
   - Wrapper para integración bidireccional
5. **Servicios Compartidos**: 
   - `ProductoService`: Gestión de productos y carrito
   - `AuthService`: Autenticación con Firebase
   - `SubscriptionService`: Gestión de suscripciones premium
   - `TorneosService`: Gestión de torneos
   - `InscripcionesService`: Inscripciones a torneos
   - `PartidosService`: Gestión de partidos
6. **Modelos TypeScript**: Interfaces fuertemente tipadas para Producto, Torneo, Partido, Inscripción, etc.
7. **Estilos Modernos**: TailwindCSS 4.1.16 con componentes personalizados
8. **Sistema de Rutas**: Configuración modular con lazy loading
9. **Firebase Integration**: 
   - Autenticación con Firebase Auth
   - Custom Claims para roles y suscripciones
   - Firebase Admin SDK en backend
10. **Sistema de Suscripciones**: 
    - Planes premium (mensual/anual)
    - Guards basados en Custom Claims
    - Sincronización automática con PostgreSQL

### 🔗 Integración con React (Experimental)

El proyecto incluye capacidades para integrar componentes React dentro de Angular, permitiendo aprovechar lo mejor de ambos frameworks.

#### Características de Integración React:
- ✅ Componentes React en archivos `.tsx`
- ✅ Props y eventos entre Angular y React
- ✅ Soporte para hooks de React
- ✅ Compartir estado entre frameworks
- ✅ Uso de cualquier librería del ecosistema React
- ✅ TypeScript completo en componentes React
- ✅ Carrito de compras implementado en React

#### Componentes React Implementados:
- **Carrito de Compras**: Modal interactivo integrado en el navbar
  - Gestión de productos
  - Actualización en tiempo real
  - Integración con el servicio Angular de productos

---

## 🎯 Funcionalidades Principales Implementadas

### Sistema de Torneos 🏆
- **Dashboard de Torneos**: Estadísticas del usuario en tiempo real
- **Listado de Torneos**: Filtrado por deporte y estado
- **Inscripciones**: Crear y gestionar inscripciones a torneos
- **Clasificaciones**: Tablas de posiciones y estadísticas
- **Partidos**: Detalle completo con eventos, alineaciones y estadísticas
- **8 Endpoints RESTful** en 3 microservicios
- **3 Servicios Angular** con 25+ métodos auxiliares
- **18 Interfaces TypeScript** fuertemente tipadas

### Sistema de Suscripciones Premium 💳
- **Planes de Suscripción**: Mensual ($9.99) y Anual ($99.99)
- **Firebase Custom Claims**: Verificación en tiempo real
- **Guards de Protección**: Rutas premium protegidas
- **Sincronización Automática**: PostgreSQL ↔ Firebase
- **Gestión de Suscripciones**: Activar, cancelar, renovar
- **Acceso a Funciones Premium**: Torneos, estadísticas avanzadas
- Ver: [`OSC-Backend/micro-servicios/subscription-service/README.md`](OSC-Backend/micro-servicios/subscription-service/README.md)

### Sistema de Tienda 🛒
- **Catálogo de Productos**: Con filtros y búsqueda
- **Carrito de Compras**: Componente React integrado
- **Procesamiento de Pedidos**: Sistema completo de checkout
- **Seguimiento de Pedidos**: Historial y estados
- **Gestión de Imágenes**: Integración con Cloudinary

### Sistema de Reservas 📅
- **Reserva de Canchas**: Sistema de disponibilidad
- **Gestión de Equipos**: Crear y administrar equipos
- **Historial de Reservas**: Seguimiento completo
- **Sedes Múltiples**: Selección de sede y cancha

### Sistema de Administración 👨‍💼
- **Dashboard Administrativo**: Panel de control
- **Gestión de Productos**: CRUD completo
- **Gestión de Canchas**: Administración de disponibilidad
- **Gestión de Usuarios**: Roles y permisos
- **Gestión de Sedes**: Configuración de ubicaciones

---

## 📚 Documentación Completa

### Backend
- 📘 [README Backend](./OSC-Backend/README.md) - Guía principal del backend
- 📗 [Configuración de Variables de Entorno](./OSC-Backend/docs/ENV-SETUP-GUIDE.md)
- 📙 [Endpoints de Torneos](./OSC-Backend/docs/ENDPOINTS-TORNEOS.md)
- 📕 [Sistema de Suscripciones](./OSC-Backend/micro-servicios/subscription-service/README.md)

### Frontend
- 📘 [Estructura Angular 20](./osc-frontend/docs/ESTRUCTURA-ANGULAR-20.md)
- 📗 [Integración Backend-Frontend](./osc-frontend/docs/INTEGRACION-BACKEND-FRONTEND.md)
- 📙 [Guía de Suscripciones](./osc-frontend/docs/GUIA-SUSCRIPCIONES.md)
- 📕 [Sistema de Modales](./osc-frontend/docs/GUIA-MODALES.md)
- 📓 [Sistema de Opciones y Categorías](./osc-frontend/docs/SISTEMA-OPCIONES-CATEGORIAS.md)
- 📔 [Plan de Modernización Tienda](./osc-frontend/docs/PLAN-MODERNIZACION-TIENDA.md)

---

## 🛠️ Instalación y Configuración

### Instalación y Ejecución (Angular)

1. **Navega a la carpeta del frontend**:
   ```bash
   cd osc-frontend
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
- **PostgreSQL**: Base de datos para el backend (DigitalOcean)
- **Angular CLI**: `npm install -g @angular/cli` (versión 20.x o superior)
- **Firebase Account**: Para autenticación y Custom Claims
- **Cloudinary Account**: Para gestión de imágenes (opcional)
- **Cliente de BD**: DBeaver o pgAdmin (recomendado para gestión de base de datos)

---

## Estructura del Proyecto

```
Proyecto-Web-6to/
├── OSC-Backend/
│   ├── config/
│   │   └── dotenv.js                    # Configuración de variables de entorno
│   ├── docs/
│   │   ├── ENV-SETUP-GUIDE.md          # Guía completa de configuración
│   │   ├── .env-quick-ref.md           # Referencia rápida
│   │   └── ENDPOINTS-TORNEOS.md        # Documentación de endpoints de torneos
│   ├── middleware/
│   │   ├── authenticate.js             # Verificación JWT
│   │   ├── authorizeRole.js            # Verificación de roles
│   │   └── requireSubscription.js      # Verificación de suscripción
│   ├── share/
│   │   └── utils.js                    # Utilidades compartidas
│   ├── micro-servicios/
│   │   ├── api-gateway/                # Puerto 3000 - Punto de entrada
│   │   ├── user-service/               # Puerto 3001 - Usuarios y auth
│   │   ├── products-service/           # Puerto 3002 - Productos
│   │   ├── buy-service/                # Puerto 3003 - Compras e inscripciones
│   │   ├── court-service/              # Puerto 3004 - Canchas y torneos
│   │   ├── match-service/              # Puerto 3005 - Partidos
│   │   ├── cloudinary-service/         # Puerto 3006 - Imágenes
│   │   └── subscription-service/       # Puerto 3007 - Suscripciones
│   ├── .env.example                    # Plantilla de configuración
│   ├── setup-env.js                    # Script de configuración automática
│   └── package.json
├── osc-frontend/
│   ├── docs/
│   │   ├── ESTRUCTURA-ANGULAR-20.md
│   │   ├── GUIA-SUSCRIPCIONES.md
│   │   ├── INTEGRACION-BACKEND-FRONTEND.md
│   │   ├── GUIA-MODALES.md
│   │   └── ...
│   ├── public/
│   │   └── assets/                     # Recursos estáticos
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/            # Guards de autenticación y suscripción
│   │   │   │   ├── services/          # Servicios principales
│   │   │   │   └── interceptors/      # HTTP Interceptors
│   │   │   ├── features/
│   │   │   │   ├── auth/              # Módulo de autenticación
│   │   │   │   ├── client/            # Módulo de cliente
│   │   │   │   │   ├── layout/
│   │   │   │   │   └── pages/
│   │   │   │   │       ├── home/
│   │   │   │   │       ├── shop/
│   │   │   │   │       ├── reservas/
│   │   │   │   │       ├── subscription/
│   │   │   │   │       └── ...
│   │   │   │   └── admin/             # Módulo administrativo
│   │   │   ├── shared/                # Componentes compartidos
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.development.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
├── start-backend.js                    # Script de inicio automático
├── package.json                        # Scripts del proyecto raíz
└── README.md
```

---

## 🔐 Seguridad y Autenticación

### Firebase Authentication
- Login con email/password
- Google Sign-In
- Recuperación de contraseña
- Custom Claims para roles y suscripciones

### JWT Tokens
- Autenticación en backend mediante tokens JWT
- Middleware de verificación en cada microservicio
- Refresh automático de tokens

### Roles de Usuario
- **Admin (rol: 1)**: Acceso completo al panel administrativo
- **Cliente (rol: 2)**: Acceso a funciones de cliente
- **Premium**: Acceso a funciones exclusivas mediante suscripción

### Guards y Middleware
- `authGuard`: Protección de rutas que requieren login
- `adminGuard`: Protección de rutas administrativas
- `subscriptionGuard`: Protección de rutas premium
- `requireSubscription`: Middleware backend para verificar suscripción

---

## 🧪 Testing y Desarrollo

### Backend Testing
```bash
# Probar endpoints con herramientas como Thunder Client o Postman
# Ejemplo de endpoints disponibles:

# Torneos
GET http://localhost:3000/c/client/torneos/publicos
GET http://localhost:3000/c/client/torneos/:id/clasificacion

# Productos
GET http://localhost:3000/p/client/productos
GET http://localhost:3000/p/client/productos/:id

# Suscripciones
GET http://localhost:3000/client/suscripciones/estado
POST http://localhost:3000/client/suscripciones/simular-pago
```

### Frontend Testing
```bash
cd osc-frontend
npm test              # Ejecutar tests unitarios
npm run test:watch    # Tests en modo watch
```

---

## 🚀 Despliegue

### Variables de Entorno Necesarias

#### Backend (.env)
```env
# Base de Datos PostgreSQL (DigitalOcean)
DB_HOST=your-db-host
DB_PORT=25060
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Puertos de Microservicios
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
PRODUCTS_SERVICE_PORT=3002
BUY_SERVICE_PORT=3003
COURT_SERVICE_PORT=3004
MATCH_SERVICE_PORT=3005
CLOUDINARY_SERVICE_PORT=3006
SUBSCRIPTION_SERVICE_PORT=3007

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-gateway-url',
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  }
};
```

---

## 📊 Estado del Proyecto

### Completado ✅
- [x] Arquitectura de microservicios (8 servicios)
- [x] Sistema de autenticación con Firebase
- [x] Sistema de suscripciones premium
- [x] CRUD de productos
- [x] Sistema de carrito y compras
- [x] Sistema de reservas de canchas
- [x] Dashboard de torneos con estadísticas
- [x] Sistema de inscripciones a torneos
- [x] Clasificaciones y tablas de posiciones
- [x] Detalle de partidos con eventos
- [x] Gestión de equipos
- [x] Panel administrativo
- [x] Integración React en Angular
- [x] Guards de protección de rutas
- [x] Middleware de autenticación y autorización
- [x] Gestión de imágenes con Cloudinary
- [x] Sistema de sedes

### En Desarrollo 🚧
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat en vivo para torneos
- [ ] Estadísticas avanzadas con gráficos
- [ ] Sistema de recompensas y logros

### Progreso General
**Backend**: 95% completado  
**Frontend**: 85% completado  
**Integración**: 90% completada  
**Documentación**: 80% completada

---

## 🐛 Solución de Problemas

### Error: "Firebase not configured"
**Solución**: Verificar que `GOOGLE_APPLICATION_CREDENTIALS` esté configurado correctamente en el archivo `.env`

### Error: "Cannot connect to database"
**Solución**: 
1. Verificar credenciales de DigitalOcean en `.env`
2. Verificar que la IP esté en la whitelist de DigitalOcean
3. Verificar que PostgreSQL esté corriendo

### Error: "Port already in use"
**Solución**: Cambiar el puerto en el archivo `.env` del servicio correspondiente o detener el proceso que está usando el puerto

### Guards no permiten acceso
**Solución**:
1. Verificar que el token JWT sea válido
2. Forzar refresh del token: `auth.currentUser.getIdToken(true)`
3. Verificar Custom Claims en la consola de Firebase

### Frontend no se conecta al backend
**Solución**:
1. Verificar que `environment.apiUrl` apunte a `http://localhost:3000`
2. Verificar que el API Gateway esté corriendo
3. Verificar configuración de CORS en el backend

---

## 👥 Equipo de Desarrollo

**OSC Sport Center** es un proyecto académico desarrollado por:
- **Gary Barreiro** - Frontend Developer - gbarreiro2@utmachala.edu.ec
- **Jhon Cruz** - Full Stack Developer - jcruz21@utmachala.edu.ec
- **Javier Cellan** - Backend Developer - jcellan2@utmachala.edu.ec

Para la **Universidad Técnica de Machala**.

---

## 📝 Propósito del Proyecto

Este proyecto es una plataforma completa de gestión deportiva que incluye:
- ✅ Sistema de reserva de canchas deportivas
- ✅ Tienda de productos deportivos en línea
- ✅ Gestión de torneos y competiciones
- ✅ Sistema de suscripciones premium
- ✅ Panel administrativo completo
- ✅ Sistema de puntos de lealtad
- ✅ Gestión de equipos y jugadores

**⚠️ Nota importante**: Este es un proyecto académico demostrativo. No se procesan pagos reales ni se entregan productos físicos.

---

## 📄 Licencia

Este proyecto es parte de un desarrollo académico para la Universidad Técnica de Machala.

---

## 🤝 Contribuciones

Este es un proyecto académico cerrado. No se aceptan contribuciones externas en este momento.

---

## 📞 Contacto

Para consultas sobre el proyecto:
- **Email**: gbarreiro2@utmachala.edu.ec, jcruz21@utmachala.edu.ec, jcellan2@utmachala.edu.ec
- **Universidad**: Universidad Técnica de Machala
- **Año**: 2025

---

## 🎓 Agradecimientos

Agradecemos a la Universidad Técnica de Machala y a nuestros docentes por el apoyo y guía durante el desarrollo de este proyecto.

---

**Desarrollado con ❤️ por el equipo de Orosports Club**

*Última actualización: Noviembre 2025*
