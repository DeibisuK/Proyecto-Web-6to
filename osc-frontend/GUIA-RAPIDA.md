# 🎯 Guía Rápida - Nueva Estructura Angular 20

## 📦 Importaciones con Path Aliases

Ahora puedes usar path aliases para importaciones más limpias:

### ✅ Ejemplos de Uso

```typescript
// ============================================
// ANTES (Rutas relativas complicadas)
// ============================================
import { Usuario } from '../../../core/models/usuario.model';
import { CanchasService } from '../../../core/services/canchas.service';

// ============================================
// AHORA (Path aliases limpios)
// ============================================
import { Usuario } from '@shared/models/usuario.model';
import { CanchasService } from '@shared/services/canchas.service';

// O usando barrel exports:
import { Usuario, Cancha, Sede } from '@shared/models';
import { CanchasService, SedeService } from '@shared/services';
```

## 🗂️ Dónde Crear Cada Tipo de Archivo

### 📋 Modelos/Interfaces
**Ubicación:** `src/app/shared/models/`

```typescript
// src/app/shared/models/producto.model.ts
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

// Luego agregar al barrel export en:
// src/app/shared/models/index.ts
export * from './producto.model';
```

### 🔧 Servicios de Negocio
**Ubicación:** `src/app/shared/services/`

```typescript
// src/app/shared/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  constructor(private http: HttpClient) {}
  
  getProductos() {
    return this.http.get('/api/productos');
  }
}

// Agregar al barrel export en:
// src/app/shared/services/index.ts
export * from './producto.service';
```

### 🎨 Componentes Reutilizables
**Ubicación:** `src/app/shared/components/`

```typescript
// src/app/shared/components/boton-personalizado/boton-personalizado.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-boton-personalizado',
  standalone: true,
  template: `<button [class]="clase">{{ texto }}</button>`
})
export class BotonPersonalizado {
  @Input() texto!: string;
  @Input() clase = 'btn-primary';
}
```

### 🎯 Páginas del Admin
**Ubicación:** `src/app/features/admin/pages/`

```typescript
// src/app/features/admin/pages/nueva-pagina/nueva-pagina.ts
import { Component } from '@angular/core';
import { ProductoService } from '@shared/services';

@Component({
  selector: 'app-nueva-pagina',
  standalone: true,
  templateUrl: './nueva-pagina.html'
})
export class NuevaPagina {
  constructor(private productoService: ProductoService) {}
}

// Luego agregar la ruta en:
// src/app/features/admin/admin.routes.ts
{
  path: 'nueva-pagina',
  component: NuevaPagina,
  title: 'Nueva Página'
}
```

### 👤 Páginas del Cliente
**Ubicación:** `src/app/features/client/pages/`

```typescript
// src/app/features/client/pages/nueva-seccion/nueva-seccion.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-nueva-seccion',
  standalone: true,
  templateUrl: './nueva-seccion.html'
})
export class NuevaSeccion {}

// Agregar ruta en:
// src/app/features/client/cliente.routes.ts
{
  path: 'nueva-seccion',
  component: NuevaSeccion
}
```

### 🔐 Guards
**Ubicación:** `src/app/core/guards/`

```typescript
// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const roleGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.hasRole('admin')) {
    return true;
  }
  return router.parseUrl('/login');
};
```

### 🔄 Interceptors
**Ubicación:** `src/app/core/interceptors/`

```typescript
// src/app/core/interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Request:', req.url);
  return next(req);
};
```

### 📝 Pipes
**Ubicación:** `src/app/shared/pipes/`

```typescript
// src/app/shared/pipes/formato-moneda.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoMoneda',
  standalone: true
})
export class FormatoMonedaPipe implements PipeTransform {
  transform(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
```

### 🎨 Directivas
**Ubicación:** `src/app/shared/directives/`

```typescript
// src/app/shared/directives/highlight.directive.ts
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  constructor(private el: ElementRef) {}
  
  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

## 🛤️ Agregar Nuevas Rutas

### Ruta en Admin
```typescript
// src/app/features/admin/admin.routes.ts
export const adminRoutes: Routes = [
  // ... rutas existentes
  {
    path: 'mi-nueva-ruta',
    component: MiNuevoComponente,
    title: 'Mi Nueva Ruta'
  }
];
```

### Ruta en Cliente
```typescript
// src/app/features/client/cliente.routes.ts
export const clienteRoutes: Routes = [
  // ... rutas existentes
  {
    path: 'mi-pagina',
    component: MiPagina
  }
];
```

### Ruta con Lazy Loading (Recomendado para features grandes)
```typescript
// src/app/app.routes.ts
{
  path: 'tienda',
  loadChildren: () => import('./features/tienda/tienda.routes')
    .then(m => m.tiendaRoutes)
}
```

## 🔧 Servicios Singleton vs Business Services

### ✅ Core Services (Singleton)
**Solo para:** Auth, Config, Notifications globales
```typescript
// src/app/core/services/config.service.ts
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config = { apiUrl: 'https://api.example.com' };
  
  getConfig() {
    return this.config;
  }
}
```

### ✅ Shared Services (Business Logic)
**Para:** CRUD, lógica de dominio, HTTP calls
```typescript
// src/app/shared/services/cliente.service.ts
@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private http: HttpClient) {}
  
  getClientes() {
    return this.http.get<Cliente[]>('/api/clientes');
  }
}
```

## 📊 Estructura de un Feature Completo

```
features/
  └── mi-feature/
      ├── mi-feature.routes.ts      # Rutas del feature
      ├── layout/                    # Layout específico (opcional)
      │   └── mi-layout/
      ├── components/                # Componentes del feature
      │   ├── header/
      │   └── sidebar/
      └── pages/                     # Páginas del feature
          ├── lista/
          ├── detalle/
          └── formulario/
```

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)
- ✅ Usar path aliases (`@shared/`, `@core/`, etc.)
- ✅ Componentes standalone en Angular 20
- ✅ Barrel exports para grupos de archivos relacionados
- ✅ Nombres descriptivos y consistentes
- ✅ Un componente por archivo
- ✅ Servicios en `providedIn: 'root'`

### ❌ DON'T (No hacer)
- ❌ Rutas relativas largas (`../../../`)
- ❌ Lógica de negocio en componentes
- ❌ Componentes en `core/`
- ❌ Servicios específicos de feature en `shared/`
- ❌ Modelos duplicados en múltiples lugares

## 🚀 Comandos Útiles

```bash
# Generar un nuevo componente en shared
ng generate component shared/components/mi-componente --standalone

# Generar un servicio en shared
ng generate service shared/services/mi-servicio

# Generar un guard en core
ng generate guard core/guards/mi-guard --functional

# Generar una página en admin
ng generate component features/admin/pages/mi-pagina --standalone

# Generar una página en client
ng generate component features/client/pages/mi-pagina --standalone

# Generar un pipe
ng generate pipe shared/pipes/mi-pipe --standalone

# Generar una directiva
ng generate directive shared/directives/mi-directiva --standalone
```

## 📚 Recursos

- [Angular 20 Documentation](https://angular.dev)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

---

**¿Preguntas?** Consulta `ESTRUCTURA-ANGULAR-20.md` para más detalles sobre la arquitectura.
