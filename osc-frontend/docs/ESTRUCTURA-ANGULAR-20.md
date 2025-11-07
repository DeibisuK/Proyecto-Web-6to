# 📁 Nueva Estructura del Proyecto Frontend - Angular 20

## ✅ Reestructuración Completada

Se ha reorganizado el proyecto siguiendo las mejores prácticas de Angular 20, mejorando la separación de responsabilidades y la escalabilidad.

## 🗂️ Nueva Estructura

```
src/app/
├── core/                              # ⚙️ Singleton services, guards, interceptors
│   ├── guards/                        # Guards de autenticación
│   │   └── auth.guard.ts
│   ├── interceptors/                  # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   └── cache.interceptors.ts
│   └── services/                      # Solo servicios singleton
│       ├── auth.service.ts           # ✅ Autenticación
│       └── notification.service.ts   # ✅ Notificaciones globales
│
├── shared/                            # 🔄 Compartido en toda la aplicación
│   ├── components/                    # Componentes reutilizables
│   │   ├── anuncio/
│   │   ├── footer/
│   │   ├── navbar/
│   │   ├── scroll-top/
│   │   ├── mini-map/
│   │   ├── react-wrapper/
│   │   ├── carrito/                  # React component
│   │   ├── notifications/            # React component
│   │   └── pruebas/
│   │
│   ├── models/                        # 📋 Todos los modelos/interfaces
│   │   ├── index.ts                  # Barrel export
│   │   ├── anuncio.model.ts
│   │   ├── canchas.model.ts
│   │   ├── cart.model.ts
│   │   ├── categoria.model.ts
│   │   ├── contacto.model.ts
│   │   ├── deporte.model.ts
│   │   ├── equipo.model.ts
│   │   ├── marca.model.ts
│   │   ├── metodo-pago.model.ts
│   │   ├── order.model.ts
│   │   ├── partido.model.ts
│   │   ├── usuario.model.ts
│   │   ├── article.model.ts
│   │   ├── contact.model.ts
│   │   ├── product.model.ts
│   │   └── reservation.model.ts
│   │
│   ├── services/                      # 🔧 Servicios de lógica de negocio
│   │   ├── index.ts                  # Barrel export
│   │   ├── articles.service.ts
│   │   ├── canchas.service.ts
│   │   ├── carrito-bridge.service.ts
│   │   ├── categoria.service.ts
│   │   ├── contacto.service.ts
│   │   ├── deportes.service.ts
│   │   ├── equipo.service.ts
│   │   ├── marca.service.ts
│   │   ├── metodo-pago.service.ts
│   │   ├── order.service.ts
│   │   ├── router-bridge.service.ts
│   │   ├── scroll.service.ts
│   │   ├── sede.service.ts
│   │   └── user-api.service.ts
│   │
│   ├── directives/                    # Directivas compartidas
│   ├── pipes/                         # Pipes compartidos
│   └── utils/                         # Funciones de utilidad
│
├── features/                          # 🎯 Módulos por características
│   │
│   ├── admin/                         # 👨‍💼 Feature de administración
│   │   ├── admin.routes.ts           # Rutas del admin
│   │   │
│   │   ├── layout/                   # Layout del admin
│   │   │   └── admin-layout/
│   │   │       ├── admin-layout.ts
│   │   │       ├── admin-layout.html
│   │   │       └── admin-layout.css
│   │   │
│   │   ├── components/               # Componentes específicos del admin
│   │   │   ├── header/
│   │   │   └── navbar/
│   │   │
│   │   └── pages/                    # Páginas del admin
│   │       ├── dashboard/
│   │       ├── productos/
│   │       ├── canchas/
│   │       │   ├── list-cancha/
│   │       │   └── crear-cancha/
│   │       ├── sedes/
│   │       │   ├── list-sede/
│   │       │   └── crear-sede/
│   │       ├── equipos/
│   │       ├── usuarios/
│   │       └── anuncios/
│   │
│   ├── client/                        # 👤 Feature de clientes
│   │   ├── cliente.routes.ts         # Rutas del cliente
│   │   │
│   │   ├── layout/                   # Layout del cliente
│   │   │   └── client-layout/
│   │   │       ├── client-layout.ts
│   │   │       ├── client-layout.html
│   │   │       └── client-layout.css
│   │   │
│   │   ├── components/               # Componentes específicos del cliente
│   │   │
│   │   └── pages/                    # Páginas del cliente
│   │       ├── home/
│   │       ├── shop/
│   │       │   ├── components/
│   │       │   └── pages/
│   │       ├── reservas/
│   │       │   └── components/
│   │       ├── sedes/
│   │       ├── articulos/
│   │       ├── informacion/
│   │       │   ├── nosotros/
│   │       │   ├── legal/
│   │       │   └── puntos-lealtad/
│   │       ├── contact/
│   │       └── user-profile/
│   │           ├── perfil/
│   │           └── metodos-pago/
│   │
│   └── auth/                          # 🔐 Feature de autenticación
│       ├── login/
│       │   ├── login.ts
│       │   ├── login.html
│       │   └── login.css
│       └── recuperar-password/
│           ├── recuperar-password.ts
│           ├── recuperar-password.html
│           └── recuperar-password.css
│
├── app.config.ts                      # Configuración de la aplicación
├── app.routes.ts                      # Rutas principales
└── app.component.ts                   # Componente raíz
```

## 🔄 Cambios Principales

### 1. **Organización por Características (Features)**
- ✅ Toda la funcionalidad del admin está en `features/admin/`
- ✅ Toda la funcionalidad del cliente está en `features/client/`
- ✅ Autenticación separada en `features/auth/`

### 2. **Core - Solo Singleton Services**
- ✅ `auth.service.ts` - Servicio de autenticación
- ✅ `notification.service.ts` - Servicio de notificaciones
- ✅ Guards e interceptors permanecen en core

### 3. **Shared - Todo lo Compartido**
- ✅ Todos los modelos consolidados en `shared/models/`
- ✅ Servicios de negocio en `shared/services/`
- ✅ Componentes reutilizables en `shared/components/`
- ✅ Componentes React movidos a `shared/components/`

### 4. **Barrel Exports**
- ✅ `shared/models/index.ts` - Exporta todos los modelos
- ✅ `shared/services/index.ts` - Exporta todos los servicios

## 📝 Guía de Importación

### Antes:
```typescript
import { Usuario } from './core/models/usuario.model';
import { CanchasService } from './core/services/canchas.service';
```

### Ahora:
```typescript
// Importar desde barrel exports
import { Usuario, Cancha, Sede } from '@app/shared/models';
import { CanchasService, SedeService } from '@app/shared/services';

// O importar directamente
import { Usuario } from '@app/shared/models/usuario.model';
import { CanchasService } from '@app/shared/services/canchas.service';
```

## 🎯 Beneficios de la Nueva Estructura

1. **Separación Clara de Responsabilidades**
   - Core: Solo servicios singleton y configuración
   - Shared: Todo lo reutilizable
   - Features: Funcionalidad específica por módulo

2. **Escalabilidad**
   - Fácil agregar nuevas features sin afectar las existentes
   - Cada feature es autocontenida

3. **Mantenibilidad**
   - Código organizado por dominio/funcionalidad
   - Fácil encontrar y modificar componentes

4. **Lazy Loading Ready**
   - Estructura preparada para carga diferida de módulos
   - Cada feature puede cargarse bajo demanda

5. **Testing**
   - Más fácil hacer pruebas unitarias
   - Dependencias claramente definidas

## 🚀 Próximos Pasos Recomendados

1. **Configurar Path Aliases en tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

2. **Implementar Lazy Loading**
```typescript
// En app.routes.ts
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
}
```

3. **Crear Shared Module (Opcional)**
```typescript
// shared/shared.module.ts para componentes, directives y pipes
```

4. **Agregar Environment-specific Services**
```typescript
// core/config/
```

## 📚 Convenciones

- **Components**: PascalCase (HomeComponent)
- **Services**: PascalCase con suffix Service (UserService)
- **Models**: PascalCase (Usuario, Cancha)
- **Routes**: camelCase (adminRoutes, clienteRoutes)
- **Folders**: kebab-case (user-profile, crear-cancha)

## ⚠️ Notas Importantes

- Los modelos `Sede` en `sede.model.ts` estaban duplicados en `canchas.model.ts`, se comentó la exportación duplicada
- Se eliminaron las carpetas `client/shared` (duplicación)
- Se eliminó `core/models` y `core/react-components`
- Componentes React ahora están en `shared/components/`

---

**Fecha de reestructuración:** Noviembre 3, 2025
**Versión de Angular:** 20
**Estado:** ✅ Completado sin errores
