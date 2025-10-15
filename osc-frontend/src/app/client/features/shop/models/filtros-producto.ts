export interface FiltrosProducto {
    categoria?: string[];
    deporte?: string;
    precioMin?: number;
    precioMax?: number;
    tallas?: string[];
    marca?: string[];
    color?: string[];
    ordenamiento?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre';
    pagina?: number;
    porPagina?: number;
}
