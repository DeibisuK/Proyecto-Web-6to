# 📦 Guía: Usar Dependencias de React en tu Proyecto Angular+React

## ✅ Respuesta Corta
**SÍ, puedes usar cualquier librería de React** en tus componentes `.tsx` dentro del proyecto Angular. Funcionan exactamente igual que en un proyecto React puro.

---

## 🎯 Cómo Funciona

### 1️⃣ Instalar la Librería
```bash
npm install nombre-libreria
npm install --save-dev @types/nombre-libreria  # Si tiene tipos TypeScript
```

### 2️⃣ Importar en tu Componente React
```tsx
import React from 'react';
import { AlgoDeLibreria } from 'nombre-libreria';

const MiComponente: React.FC = () => {
  return <AlgoDeLibreria />;
};

export default MiComponente;
```

### 3️⃣ Usar en Angular (igual que siempre)
```typescript
import MiComponente from '../react-components/MiComponente';

// Luego en el template:
<app-react-wrapper 
  [component]="miComponente" 
  [props]="{}" 
/>
```

---

## 📚 Librerías Populares que Puedes Usar

### 🎨 UI/Componentes
- **react-icons** - Iconos (Material, FontAwesome, etc.)
- **@mui/material** - Material UI
- **antd** - Ant Design
- **react-bootstrap** - Bootstrap para React
- **chakra-ui** - Chakra UI

### 📊 Gráficos y Visualización
- **recharts** - Gráficos responsivos
- **chart.js + react-chartjs-2** - Charts interactivos
- **victory** - Gráficos para datos
- **react-vis** - Visualización de datos

### 📝 Formularios
- **react-hook-form** - Formularios con validación
- **formik** - Manejo de formularios
- **yup** - Validación de schemas

### 🎭 Animaciones
- **framer-motion** - Animaciones fluidas
- **react-spring** - Animaciones basadas en física
- **gsap** - GreenSock Animation Platform

### 📅 Fechas y Tiempo
- **date-fns** - Utilidades de fechas
- **moment** - Manipulación de fechas
- **react-datepicker** - Selector de fechas

### 🌐 HTTP y Estado
- **axios** - Cliente HTTP
- **react-query** - Manejo de datos del servidor
- **zustand** - State management simple
- **redux + react-redux** - State management robusto

### 🎪 Otros
- **react-slick** - Carruseles
- **react-dropzone** - Drag & drop de archivos
- **react-table** - Tablas avanzadas
- **react-toastify** - Notificaciones toast

---

## 💡 Ejemplo Completo: react-icons

### Paso 1: Instalar
```bash
npm install react-icons
```

### Paso 2: Crear Componente React
```tsx
// src/app/react-components/IconButton.tsx
import React from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

interface IconButtonProps {
  type: 'cart' | 'heart';
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ type, onClick }) => {
  const Icon = type === 'cart' ? FaShoppingCart : FaHeart;
  
  return (
    <button onClick={onClick} style={{ padding: '10px 20px' }}>
      <Icon size={24} /> {type === 'cart' ? 'Comprar' : 'Favorito'}
    </button>
  );
};

export default IconButton;
```

### Paso 3: Usar en Angular
```typescript
// En tu componente Angular
import IconButton from '../react-components/IconButton';

export class MiComponente {
  iconButtonComponent = IconButton;
}
```

```html
<!-- En tu template -->
<app-react-wrapper
  [component]="iconButtonComponent"
  [props]="{ type: 'cart' }"
/>
```

---

## ⚠️ Consideraciones Importantes

### ✅ LO QUE SÍ FUNCIONA
- ✅ Cualquier librería de UI de React
- ✅ Librerías de utilidades (lodash, date-fns, etc.)
- ✅ Hooks personalizados de React
- ✅ Context API de React
- ✅ Librerías de estado (Redux, Zustand, etc.)
- ✅ Librerías de animación
- ✅ Librerías de gráficos

### ❌ LO QUE DEBES EVITAR
- ❌ **react-router-dom** - Usa el Router de Angular en su lugar
- ❌ Librerías que modifican el routing
- ❌ Librerías que necesitan configuración global en el index.html de React

### 🤔 CASOS ESPECIALES

#### React Router
**NO uses** `react-router-dom`. En su lugar:
- Para navegación: Usa `Router` de Angular
- Para pasar rutas: Pasa callbacks desde Angular a React

```typescript
// En Angular
navbarProps = {
  onNavigate: (path: string) => {
    this.router.navigate([path]); // ✅ Angular Router
  }
};
```

#### Redux/Estado Global
Puedes usar Redux, pero:
- **Opción 1**: Cada componente React tiene su propio store
- **Opción 2**: Comparte estado mediante props desde Angular
- **Opción 3**: Usa servicios de Angular como fuente de verdad

```typescript
// Mejor enfoque: Angular como fuente de verdad
export class MiServicio {
  private products = signal([]);
  
  getProducts() {
    return this.products();
  }
}

// Pasar a React como props
[props]="{ products: productService.getProducts() }"
```

---

## 🎯 Ejemplo Real del Proyecto

### ProductCard.tsx (usa react-icons)
```tsx
import React from 'react';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import { MdSportsSoccer } from 'react-icons/md';

// ✅ Usamos múltiples iconos de diferentes paquetes
const ProductCard: React.FC = () => {
  return (
    <div>
      <MdSportsSoccer size={100} />
      <FaStar color="#FFD700" />
      <button><FaShoppingCart /> Comprar</button>
      <button><FaHeart /> Favorito</button>
    </div>
  );
};
```

### Resultado
✅ Los iconos funcionan perfectamente
✅ Angular recibe eventos cuando haces clic
✅ Puedes actualizar props desde Angular

---

## 🚀 Tips y Best Practices

### 1. Instala los Tipos TypeScript
```bash
npm install libreria
npm install --save-dev @types/libreria
```

### 2. Verifica la Compatibilidad
- Usa librerías que funcionen con React 18+
- Revisa si necesitan configuración especial

### 3. Tamaño del Bundle
- Usa imports específicos para reducir el bundle:
  ```tsx
  // ❌ Malo: importa todo
  import * as Icons from 'react-icons/fa';
  
  // ✅ Bueno: importa solo lo que necesitas
  import { FaShoppingCart, FaHeart } from 'react-icons/fa';
  ```

### 4. Compartir Librerías entre Componentes
```tsx
// utils/icons.ts
export { FaShoppingCart, FaHeart } from 'react-icons/fa';
export { MdSportsSoccer } from 'react-icons/md';

// En componentes
import { FaShoppingCart } from '../utils/icons';
```

---

## 📝 Checklist de Integración

- [ ] Instalar la librería: `npm install libreria`
- [ ] Instalar tipos si existen: `npm install --save-dev @types/libreria`
- [ ] Importar en tu componente React (.tsx)
- [ ] Verificar que no interfiera con el routing de Angular
- [ ] Probar que los eventos se comuniquen correctamente
- [ ] Revisar el tamaño del bundle (si es crítico)

---

## 🎓 Resumen

### ¿Puedes usar librerías de React?
**SÍ, absolutamente todas las librerías de React funcionan.**

### ¿Cómo las instalas?
**Igual que en cualquier proyecto React: `npm install nombre-libreria`**

### ¿Hay restricciones?
**Solo evita librerías de routing (usa Angular Router en su lugar)**

### ¿Funciona igual que en React puro?
**Sí, exactamente igual. Los componentes .tsx no saben que están en un proyecto Angular.**

---

## 📚 Recursos

- [react-icons](https://react-icons.github.io/react-icons/) - Biblioteca de iconos
- [Material UI](https://mui.com/) - Componentes Material Design
- [Recharts](https://recharts.org/) - Gráficos responsivos
- [Framer Motion](https://www.framer.com/motion/) - Animaciones
- [React Hook Form](https://react-hook-form.com/) - Formularios

---

**¡Experimenta y usa todas las librerías que necesites! 🚀**
