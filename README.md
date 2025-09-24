# Proyecto OSC

Este repositorio contiene dos aplicaciones:
- **OSC-Frontend**: Aplicación web desarrollada con Angular.
- **OSC-Backend**: API desarrollada con Node.js y Express.

## Requisitos previos

- Node.js (versión recomendada LTS)
- npm (gestor de paquetes)
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

1. Clona el repositorio y accede a la carpeta principal.
2. Instala las dependencias del frontend:
   ```bash
   cd OSC-Frontend
   npm install
   ```
3. Instala las dependencias del backend:
   ```bash
   cd ../OSC-Backend
   npm install
   ```

## Inicialización del proyecto

### Backend

Para iniciar el servidor backend:
```bash
cd OSC-Backend
npm start
```
El backend estará disponible en `http://localhost:3000` (puerto por defecto).

### Frontend

Para iniciar el servidor frontend:
```bash
cd OSC-Frontend
npm start
```
El frontend estará disponible en `http://localhost:4200`.

## Scripts útiles

- **Frontend**
  - `npm start`: Inicia el servidor de desarrollo Angular.
  - `npm run build`: Compila el proyecto para producción.
  - `npm test`: Ejecuta pruebas unitarias.

- **Backend**
  - `npm start`: Inicia el servidor Express.

## Estructura del proyecto

```
OSC-Frontend/
  ├── src/
  ├── angular.json
  ├── package.json
OSC-Backend/
  ├── server.js
  ├── package.json
```

## Pruebas

Para ejecutar las pruebas unitarias del frontend:
```bash
cd OSC-Frontend
npm test
```

## Recursos

- [Angular](https://angular.dev)
- [Express](https://expressjs.com/)

---

Modifica este archivo según las necesidades de tu equipo o proyecto.