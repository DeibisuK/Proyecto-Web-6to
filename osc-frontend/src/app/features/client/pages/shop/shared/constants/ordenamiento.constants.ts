/**
 * Tipos de ordenamiento disponibles para productos
 */
export type TipoOrdenamiento =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'relevance';

/**
 * Interfaz para opción de ordenamiento con label y valor
 */
export interface OpcionOrdenamiento {
  valor: TipoOrdenamiento;
  label: string;
  icono: string;
  descripcion?: string;
}

/**
 * Opciones de ordenamiento disponibles en el dropdown
 */
export const OPCIONES_ORDENAMIENTO: OpcionOrdenamiento[] = [
  {
    valor: 'relevance',
    label: 'Más relevante',
    icono: 'fas fa-star',
    descripcion: 'Productos más populares primero'
  },
  {
    valor: 'price_asc',
    label: 'Precio: menor a mayor',
    icono: 'fas fa-arrow-up',
    descripcion: 'Productos más baratos primero'
  },
  {
    valor: 'price_desc',
    label: 'Precio: mayor a menor',
    icono: 'fas fa-arrow-down',
    descripcion: 'Productos más caros primero'
  },
  {
    valor: 'newest',
    label: 'Más recientes',
    icono: 'fas fa-clock',
    descripcion: 'Productos agregados recientemente'
  },
  {
    valor: 'name_asc',
    label: 'Nombre: A-Z',
    icono: 'fas fa-sort-alpha-down',
    descripcion: 'Orden alfabético ascendente'
  },
  {
    valor: 'name_desc',
    label: 'Nombre: Z-A',
    icono: 'fas fa-sort-alpha-up',
    descripcion: 'Orden alfabético descendente'
  }
];

/**
 * Clave para localStorage
 */
export const STORAGE_KEY_ORDENAMIENTO = 'osc-shop-ordenamiento';
