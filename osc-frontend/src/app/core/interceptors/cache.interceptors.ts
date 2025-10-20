import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { expiresAt: number; response: HttpResponse<unknown> }>();
const TTL = 1000 * 60 * 10; // 10 minutes

export const CacheInterceptors: HttpInterceptorFn = (req, next) => {
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
      return of(cacheResponse.response);
    } else {
      cache.delete(cacheKey);
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, { expiresAt: Date.now() + TTL, response: event });
      }
    })
  );
};
