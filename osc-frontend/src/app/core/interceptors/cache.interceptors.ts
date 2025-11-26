import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { expiresAt: number; response: HttpResponse<unknown> }>();
const TTL = 1000 * 60 * 10; // 10 minutes

// ⚠️ WHITELIST: URLs que NO deben ser cacheadas
const NO_CACHE_PATTERNS = [
  '/productos/',
  '/cart',           // Carrito de compras
  '/orders',         // Pedidos
  '/user',           // Datos de usuario
  '/auth',           // Autenticación
  '/payment',        // Pagos
  '/checkout',       // Checkout
  '/s',              // Suscripciones
  '/c/admin/torneos', // Torneos
  '/m/client/equipos', // Partidos
  '/jugadores',      // Jugadores de equipos
  '/equipos',        // Equipos
];

export const CacheInterceptors: HttpInterceptorFn = (req, next) => {
  // Verificar si la URL está en la whitelist de no-cache
  const shouldNotCache = NO_CACHE_PATTERNS.some(pattern => req.url.includes(pattern));

  if (shouldNotCache) {
    // console.log('🚫 [CACHE] No cacheando:', req.url);
    return next(req); // Pasar la petición sin cachear
  }

  // Solo cachear peticiones GET
  if (req.method !== 'GET') {
    return next(req);
  }

  const cacheKey = JSON.stringify({
    url: req.url,
    method: req.method,
    headers: req.headers.keys().reduce((acc, key) => {
      acc[key] = req.headers.get(key);
      return acc;
    }, {} as Record<string, string | null>),
    body: req.body,
  });

  const cacheResponse = cache.get(cacheKey);
  if (cacheResponse) {
    if (cacheResponse.expiresAt > Date.now()) {
      console.log('✅ [CACHE] Usando caché para:', req.url);
      return of(cacheResponse.response);
    } else {
      cache.delete(cacheKey);
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log('💾 [CACHE] Guardando en caché:', req.url);
        cache.set(cacheKey, { expiresAt: Date.now() + TTL, response: event });
      }
    })
  );
};
