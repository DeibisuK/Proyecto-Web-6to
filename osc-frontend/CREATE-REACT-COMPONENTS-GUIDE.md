# 🎨 Guía Completa: Crear e Integrar Componentes React en Angular

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Crear un Componente React Básico](#crear-un-componente-react-básico)
4. [Integrar en Angular](#integrar-en-angular)
5. [Comunicación Bidireccional](#comunicación-bidireccional)
6. [Componentes Avanzados](#componentes-avanzados)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Esta guía te enseñará paso a paso cómo crear componentes React y usarlos dentro de tu aplicación Angular.

### ¿Qué necesitas saber antes?
- ✅ Conocimientos básicos de React (JSX, props, state)
- ✅ Conocimientos básicos de Angular (componentes, templates)
- ✅ TypeScript básico

---

## 📁 Estructura del Proyecto

### Organización Recomendada
```
src/app/
├── react-components/           # 📂 Todos tus componentes React aquí
│   ├── Button.tsx
│   ├── Counter.tsx
│   ├── UserCard.tsx
│   ├── Navbar.tsx
│   └── ProductCard.tsx
├── shared/
│   └── react-wrapper/          # 🔧 El wrapper que conecta React con Angular
│       └── react-wrapper.component.ts
├── pages/                      # 🅰️ Tus componentes Angular que usan React
│   ├── demo/
│   └── navbar-page/
└── app.routes.ts
```

### Reglas de Organización
1. **Componentes React** → Siempre en `react-components/`
2. **Extensión** → Siempre `.tsx` (no `.ts`)
3. **Nombres** → PascalCase (ej: `UserCard.tsx`)
4. **Export** → Siempre `export default`

---

## 🔨 Crear un Componente React Básico

### Paso 1: Crear el archivo .tsx

#### Plantilla Básica
```tsx
// src/app/react-components/MiComponente.tsx
import React from 'react';

interface MiComponenteProps {
  // Define tus props aquí
  titulo: string;
  onEvent?: (data: any) => void;  // ⚠️ Importante para Angular
}

const MiComponente: React.FC<MiComponenteProps> = ({ titulo, onEvent }) => {
  return (
    <div>
      <h2>{titulo}</h2>
    </div>
  );
};

export default MiComponente;  // ⚠️ Siempre export default
```

### Paso 2: Ejemplo Completo - Botón Simple

```tsx
// src/app/react-components/SimpleButton.tsx
import React from 'react';

interface SimpleButtonProps {
  label: string;
  color?: string;
  onClick?: () => void;
  onEvent?: (data: any) => void;  // Canal de comunicación con Angular
}

const SimpleButton: React.FC<SimpleButtonProps> = ({ 
  label, 
  color = 'blue', 
  onClick,
  onEvent 
}) => {
  const handleClick = () => {
    console.log('Botón clickeado:', label);
    
    // Ejecutar callback local si existe
    if (onClick) {
      onClick();
    }

    // Notificar a Angular
    if (onEvent) {
      onEvent({
        type: 'button-click',
        label,
        timestamp: new Date().toISOString()
      });
    }
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: color,
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  };

  return (
    <button 
      style={buttonStyle} 
      onClick={handleClick}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      {label}
    </button>
  );
};

export default SimpleButton;
```

### Paso 3: Ejemplo con State - Contador

```tsx
// src/app/react-components/SimpleCounter.tsx
import React, { useState } from 'react';

interface SimpleCounterProps {
  initialValue?: number;
  max?: number;
  min?: number;
  onEvent?: (data: any) => void;
}

const SimpleCounter: React.FC<SimpleCounterProps> = ({ 
  initialValue = 0,
  max = 100,
  min = 0,
  onEvent 
}) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    if (count < max) {
      const newValue = count + 1;
      setCount(newValue);
      notifyChange('increment', newValue);
    }
  };

  const decrement = () => {
    if (count > min) {
      const newValue = count - 1;
      setCount(newValue);
      notifyChange('decrement', newValue);
    }
  };

  const reset = () => {
    setCount(initialValue);
    notifyChange('reset', initialValue);
  };

  const notifyChange = (action: string, value: number) => {
    if (onEvent) {
      onEvent({
        type: 'counter-change',
        action,
        value,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #4CAF50', 
      borderRadius: '10px',
      textAlign: 'center',
      maxWidth: '300px'
    }}>
      <h3>Contador React</h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
        {count}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        <button onClick={decrement} disabled={count <= min}>
          ➖ Menos
        </button>
        <button onClick={reset}>
          🔄 Reset
        </button>
        <button onClick={increment} disabled={count >= max}>
          ➕ Más
        </button>
      </div>
    </div>
  );
};

export default SimpleCounter;
```

---

## 🔗 Integrar en Angular

### Paso 1: Importar el Componente React

```typescript
// src/app/mi-pagina/mi-pagina.component.ts
import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../shared/react-wrapper/react-wrapper.component';

// 1️⃣ Importar el componente React
import SimpleButton from '../react-components/SimpleButton';
import SimpleCounter from '../react-components/SimpleCounter';

@Component({
  selector: 'app-mi-pagina',
  standalone: true,
  imports: [ReactWrapperComponent],  // 2️⃣ Importar el wrapper
  template: `
    <div class="container">
      <h1>Mi Página con React</h1>
      
      <!-- 3️⃣ Usar el componente React -->
      <app-react-wrapper
        [component]="simpleButtonComponent"
        [props]="{ label: 'Click Me!', color: '#2196F3' }"
        (reactEvent)="handleReactEvent($event)"
      />
      
      <app-react-wrapper
        [component]="simpleCounterComponent"
        [props]="{ initialValue: 5, min: 0, max: 20 }"
        (reactEvent)="handleReactEvent($event)"
      />
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class MiPaginaComponent {
  // 4️⃣ Crear referencias a los componentes React
  simpleButtonComponent = SimpleButton;
  simpleCounterComponent = SimpleCounter;

  // 5️⃣ Manejar eventos desde React
  handleReactEvent(event: any) {
    console.log('Evento desde React:', event);
    // Aquí puedes hacer lo que quieras con el evento
  }
}
```

### Paso 2: Agregar la Ruta

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MiPaginaComponent } from './mi-pagina/mi-pagina.component';

export const routes: Routes = [
  { path: 'mi-pagina', component: MiPaginaComponent }
];
```

---

## 🔄 Comunicación Bidireccional

### De Angular → React (Props)

```typescript
// Angular Component
import { Component, signal } from '@angular/core';

export class MiComponente {
  // Usar signals para props reactivas
  buttonProps = signal({
    label: 'Click Me',
    color: '#4CAF50'
  });

  // Método para cambiar las props
  cambiarColor() {
    this.buttonProps.update(props => ({
      ...props,
      color: '#f44336'
    }));
  }
}
```

```html
<!-- Template Angular -->
<app-react-wrapper
  [component]="buttonComponent"
  [props]="buttonProps()"  <!-- ⚠️ Nota los paréntesis -->
/>

<button (click)="cambiarColor()">Cambiar Color</button>
```

### De React → Angular (Events)

```tsx
// React Component
const MiComponente: React.FC<Props> = ({ onEvent }) => {
  const handleAction = () => {
    // Enviar datos a Angular
    if (onEvent) {
      onEvent({
        type: 'accion-importante',
        data: { mensaje: 'Algo sucedió' },
        timestamp: new Date().toISOString()
      });
    }
  };

  return <button onClick={handleAction}>Hacer algo</button>;
};
```

```typescript
// Angular Component
handleReactEvent(event: any) {
  if (event.type === 'accion-importante') {
    console.log('Mensaje desde React:', event.data.mensaje);
    // Hacer algo en Angular...
  }
}
```

---

## 🚀 Componentes Avanzados

### Componente con Formulario

```tsx
// src/app/react-components/LoginForm.tsx
import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (username: string, password: string) => void;
  onEvent?: (data: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onEvent }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!username) newErrors.username = 'El usuario es requerido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      console.log('Login válido:', { username, password });
      
      if (onSubmit) {
        onSubmit(username, password);
      }
      
      if (onEvent) {
        onEvent({
          type: 'login-attempt',
          username,
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const errorStyle: React.CSSProperties = {
    color: '#f44336',
    fontSize: '12px',
    marginBottom: '10px'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', padding: '20px' }}>
      <h2>Login</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.username ? '#f44336' : '#ddd'
          }}
        />
        {errors.username && <div style={errorStyle}>{errors.username}</div>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.password ? '#f44336' : '#ddd'
          }}
        />
        {errors.password && <div style={errorStyle}>{errors.password}</div>}
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Iniciar Sesión
      </button>
    </form>
  );
};

export default LoginForm;
```

### Componente con useEffect

```tsx
// src/app/react-components/DataFetcher.tsx
import React, { useState, useEffect } from 'react';

interface DataFetcherProps {
  url: string;
  onEvent?: (data: any) => void;
}

const DataFetcher: React.FC<DataFetcherProps> = ({ url, onEvent }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        
        if (onEvent) {
          onEvent({
            type: 'data-loaded',
            data: result,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        if (onEvent) {
          onEvent({
            type: 'data-error',
            error: err,
            timestamp: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); // Se ejecuta cuando cambia la URL

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h3>Datos cargados:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DataFetcher;
```

### Componente con Context (Estado Compartido)

```tsx
// src/app/react-components/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  onEvent?: (data: any) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, onEvent }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (onEvent) {
      onEvent({
        type: 'theme-changed',
        theme: newTheme,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Componente que usa el contexto
export const ThemedButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
        padding: '10px 20px',
        border: '1px solid',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}
    </button>
  );
};
```

---

## 💡 Best Practices

### 1. ✅ Siempre Define las Props con TypeScript

```tsx
// ❌ Malo: Sin tipos
const MiComponente = ({ nombre, edad }) => { ... }

// ✅ Bueno: Con tipos
interface MiComponenteProps {
  nombre: string;
  edad: number;
  activo?: boolean;  // Opcional
  onEvent?: (data: any) => void;
}

const MiComponente: React.FC<MiComponenteProps> = ({ nombre, edad, activo = true }) => { ... }
```

### 2. ✅ Incluye onEvent en TODOS los Componentes

```tsx
interface Props {
  // ... otras props
  onEvent?: (data: any) => void;  // ⚠️ Importante para Angular
}
```

### 3. ✅ Usa export default

```tsx
// ❌ Malo
export const MiComponente = () => { ... }

// ✅ Bueno
const MiComponente = () => { ... }
export default MiComponente;
```

### 4. ✅ Estilos Inline o CSS-in-JS

```tsx
// Opción 1: Inline styles
const buttonStyle: React.CSSProperties = {
  backgroundColor: 'blue',
  color: 'white'
};

// Opción 2: Styled components (si instalas la librería)
// npm install styled-components @types/styled-components
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: blue;
  color: white;
  padding: 10px 20px;
  
  &:hover {
    background-color: darkblue;
  }
`;
```

### 5. ✅ Maneja Valores por Defecto

```tsx
const MiComponente: React.FC<Props> = ({ 
  color = 'blue',      // Valor por defecto
  size = 'medium',
  onEvent 
}) => {
  // ...
}
```

### 6. ✅ Organiza los Imports

```tsx
// 1. React y hooks
import React, { useState, useEffect } from 'react';

// 2. Librerías externas
import { FaIcon } from 'react-icons/fa';
import axios from 'axios';

// 3. Tipos e interfaces
interface MiComponenteProps {
  // ...
}

// 4. Componente
const MiComponente: React.FC<MiComponenteProps> = () => {
  // ...
}

// 5. Export
export default MiComponente;
```

### 7. ✅ Nombra Eventos Descriptivamente

```tsx
if (onEvent) {
  onEvent({
    type: 'product-added-to-cart',  // ✅ Descriptivo
    // type: 'action',              // ❌ Muy genérico
    product: { id: 1, name: 'Producto' },
    timestamp: new Date().toISOString()
  });
}
```

---

## 🎯 Checklist: Crear un Nuevo Componente

```
[ ] 1. Crear archivo .tsx en /react-components/
[ ] 2. Definir interface para las props
[ ] 3. Incluir onEvent?: (data: any) => void
[ ] 4. Crear el componente con React.FC<Props>
[ ] 5. Implementar la lógica y el render
[ ] 6. Agregar export default
[ ] 7. Importar en componente Angular
[ ] 8. Crear referencia en la clase Angular
[ ] 9. Usar con <app-react-wrapper>
[ ] 10. Manejar eventos con (reactEvent)
[ ] 11. Probar y verificar comunicación
```

---

## 📝 Plantilla Rápida

### Componente React Básico
```tsx
import React from 'react';

interface NombreComponenteProps {
  // Props aquí
  onEvent?: (data: any) => void;
}

const NombreComponente: React.FC<NombreComponenteProps> = ({ onEvent }) => {
  return (
    <div>
      {/* Tu código aquí */}
    </div>
  );
};

export default NombreComponente;
```

### Integración en Angular
```typescript
import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../shared/react-wrapper/react-wrapper.component';
import NombreComponente from '../react-components/NombreComponente';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [ReactWrapperComponent],
  template: `
    <app-react-wrapper
      [component]="nombreComponente"
      [props]="{}"
      (reactEvent)="handleEvent($event)"
    />
  `
})
export class MiComponenteAngular {
  nombreComponente = NombreComponente;
  
  handleEvent(event: any) {
    console.log('Evento:', event);
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module './NombreComponente'"
**Solución**: Verifica la ruta del import
```typescript
// ❌ Malo
import MiComponente from './MiComponente';

// ✅ Bueno (ruta relativa correcta)
import MiComponente from '../react-components/MiComponente';
```

### Error: "JSX element implicitly has type 'any'"
**Solución**: Agrega la configuración JSX en `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "jsx": "react"
  }
}
```

### Error: "Module has no default export"
**Solución**: Usa `export default`
```tsx
// ❌ Malo
export const MiComponente = () => { ... }

// ✅ Bueno
const MiComponente = () => { ... }
export default MiComponente;
```

### El componente no se actualiza cuando cambian las props
**Solución**: Usa signals en Angular
```typescript
// ❌ Malo
buttonProps = { label: 'Click' };

// ✅ Bueno
buttonProps = signal({ label: 'Click' });

// En el template
[props]="buttonProps()"  // ⚠️ Nota los paréntesis
```

### Los eventos no llegan a Angular
**Solución**: Verifica que:
1. Incluiste `onEvent` en las props
2. Lo estás llamando correctamente
3. El template tiene `(reactEvent)="..."`

---

## 📚 Recursos Adicionales

- [React Docs](https://react.dev/) - Documentación oficial
- [TypeScript + React](https://react-typescript-cheatsheet.netlify.app/) - Cheatsheet
- [React Hooks](https://react.dev/reference/react) - Referencia de hooks

---

## 🎓 Resumen

### Para crear un componente React:
1. Crea archivo `.tsx` en `react-components/`
2. Define las props con TypeScript
3. Incluye `onEvent` para comunicación
4. Usa `export default`

### Para usarlo en Angular:
1. Importa el componente
2. Crea una referencia en la clase
3. Usa `<app-react-wrapper>`
4. Maneja eventos con `(reactEvent)`

### Comunicación:
- **Angular → React**: Props (usa signals)
- **React → Angular**: onEvent callback

---

**¡Ya estás listo para crear componentes React en Angular! 🚀**
