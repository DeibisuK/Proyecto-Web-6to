import { Injectable, signal } from '@angular/core';
import { Productos } from '@shared/models/index';

/**
 * Interfaz para entrada de caché
 */
interface CacheEntry {
  data: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: Productos[];
  };
  timestamp: number;
  cacheKey: string;
}

/**
 * Servicio para cachear resultados de búsqueda de productos
 * Reduce llamadas al backend y mejora el rendimiento
 */
@Injectable({
  providedIn: 'root'
})
export class ProductosCacheService {

  /**
   * Mapa de caché: clave → entrada
   */
  private cache = new Map<string, CacheEntry>();

  /**
   * Tiempo de vida del caché en milisegundos (5 minutos)
   */
  private readonly TTL = 5 * 60 * 1000;

  /**
   * Máximo número de entradas en caché
   */
  private readonly MAX_ENTRIES = 50;

  /**
   * Signal para estadísticas de caché
   */
  stats = signal({
    hits: 0,
    misses: 0,
    size: 0
  });

  /**
   * Genera una clave única para los filtros
   */
  private generarClave(filtros: any): string {
    return JSON.stringify({
      categorias: filtros.categorias?.sort() || [],
      marcas: filtros.marcas?.sort() || [],
      deportes: filtros.deportes?.sort() || [],
      colores: filtros.colores?.sort() || [],
      tallas: filtros.tallas?.sort() || [],
      is_new: filtros.is_new,
      q: filtros.q,
      sort: filtros.sort,
      precioMin: filtros.precioMin,
      precioMax: filtros.precioMax,
      page: filtros.page,
      per_page: filtros.per_page
    });
  }

  /**
   * Obtiene datos del caché si existen y no han expirado
   */
  get(filtros: any): CacheEntry['data'] | null {
    const key = this.generarClave(filtros);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.update(s => ({ ...s, misses: s.misses + 1 }));
      return null;
    }

    // Verificar si ha expirado
    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      this.stats.update(s => ({
        ...s,
        misses: s.misses + 1,
        size: this.cache.size
      }));
      return null;
    }

    this.stats.update(s => ({ ...s, hits: s.hits + 1 }));
    return entry.data;
  }

  /**
   * Guarda datos en el caché
   */
  set(filtros: any, data: CacheEntry['data']): void {
    const key = this.generarClave(filtros);

    // Si se excede el límite, eliminar la entrada más antigua
    if (this.cache.size >= this.MAX_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      cacheKey: key
    });

    this.stats.update(s => ({ ...s, size: this.cache.size }));
  }

  /**
   * Invalida el caché completamente
   */
  invalidar(): void {
    this.cache.clear();
    this.stats.update(s => ({ ...s, size: 0 }));
  }

  /**
   * Invalida entradas relacionadas con ciertos filtros
   */
  invalidarParcial(filtrosAfectados: string[]): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      // Si la clave contiene alguno de los filtros afectados, marcarla para eliminar
      if (filtrosAfectados.some(filtro => key.includes(filtro))) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.update(s => ({ ...s, size: this.cache.size }));
  }

  /**
   * Obtiene el porcentaje de aciertos del caché
   */
  get hitRate(): number {
    const total = this.stats().hits + this.stats().misses;
    return total > 0 ? (this.stats().hits / total) * 100 : 0;
  }
}
