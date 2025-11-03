import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Servicio puente para permitir navegación desde componentes React
 */
@Injectable({
  providedIn: 'root'
})
export class RouterBridgeService {
  constructor(private router: Router) {}

  getRouter() {
    return this.router;
  }

  navigate(path: string | any[], extras?: any) {
    if (typeof path === 'string') {
      return this.router.navigateByUrl(path);
    }
    return this.router.navigate(path, extras);
  }
}

// Singleton global para acceder desde React
let routerInstance: Router | null = null;

export function setRouterInstance(router: Router) {
  routerInstance = router;
}

export function getRouterInstance(): Router {
  if (!routerInstance) {
    throw new Error('Router no ha sido inicializado.');
  }
  return routerInstance;
}

export function navigateFromReact(path: string | any[], extras?: any) {
  const router = getRouterInstance();
  if (typeof path === 'string') {
    return router.navigateByUrl(path);
  }
  return router.navigate(path, extras);
}
