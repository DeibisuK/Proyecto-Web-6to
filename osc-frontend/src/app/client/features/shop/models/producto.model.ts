export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    precioAnterior?: number;
    imagen: string;
    deporte: string;
    marca: string;
    color: string;
    tallas: string[];
    caracteristicas?: string[];
    nuevo?: boolean;
    oferta?: boolean;
}