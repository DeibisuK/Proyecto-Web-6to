export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    caracteristicas: string[];
    precio: number;
    precioAnterior?: number;
    imagen: string;
    categoria: string;
    deporte: string;
    marca: string;
    color: string;
    tallas: string[];
    stock: number;
    descuento?: number;
    nuevo?: boolean;
    oferta?: boolean;
}
