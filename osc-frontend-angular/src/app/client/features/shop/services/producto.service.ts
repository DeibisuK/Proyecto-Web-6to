import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../models/producto';
import { FiltrosProducto } from '../models/filtros-producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // Datos para probar
  private productosDemo: Producto[] = [
    {
      id: '1',
      nombre: 'Camiseta Deportiva Pro',
      descripcion: 'Camiseta transpirable de alto rendimiento',
      caracteristicas: ['Material transpirable', 'Secado rápido', 'Tejido ligero'],
      precio: 29.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Camiseta+Nike',
      categoria: 'ropa',
      deporte: 'futbol',
      marca: 'Nike',
      color: 'blanco',
      tallas: ['S', 'M', 'L', 'XL'],
      stock: 15,
      descuento: 0,
      nuevo: true
    },
    {
      id: '2',
      nombre: 'Balón de Fútbol Pro',
      descripcion: 'Balón oficial de competición',
      caracteristicas: ['Cuero sintético', 'Cosido a máquina', 'Tamaño oficial'],
      precio: 49.99,
      precioAnterior: 59.99,
      imagen: 'https://placehold.co/300x300/e4e4e4/111111.webp?text=Balon+Adidas',
      categoria: 'equipamiento',
      deporte: 'futbol',
      marca: 'Adidas',
      color: 'blanco',
      tallas: ['5'],
      stock: 20,
      descuento: 10,
      oferta: true
    },
    {
      id: '3',
      nombre: 'Raqueta de Tenis Pro',
      descripcion: 'Raqueta profesional de alto rendimiento',
      caracteristicas: ['Fibra de carbono', 'Control preciso', 'Peso ligero'],
      precio: 159.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Raqueta+Wilson',
      categoria: 'equipamiento',
      deporte: 'tenis',
      marca: 'Wilson',
      color: 'negro',
      tallas: ['standard'],
      stock: 8,
      descuento: 0,
      nuevo: true
    },
    {
      id: '4',
      nombre: 'Shorts de Tenis Premium',
      descripcion: 'Shorts deportivos con bolsillos para pelotas',
      caracteristicas: ['Tejido elástico', 'Bolsillos profundos', 'Anti-humedad'],
      precio: 34.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Shorts+Nike',
      categoria: 'ropa',
      deporte: 'tenis',
      marca: 'Nike',
      color: 'azul',
      tallas: ['S', 'M', 'L'],
      stock: 25,
      descuento: 0
    },
    {
      id: '5',
      nombre: 'Zapatillas de Pádel Elite',
      descripcion: 'Máximo agarre y estabilidad',
      caracteristicas: ['Suela especial', 'Refuerzo lateral', 'Sistema de amortiguación'],
      precio: 89.99,
      precioAnterior: 119.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Zapatillas+Asics',
      categoria: 'calzado',
      deporte: 'padel',
      marca: 'Asics',
      color: 'amarillo',
      tallas: ['40', '41', '42', '43', '44'],
      stock: 12,
      descuento: 25,
      oferta: true
    },
    {
      id: '6',
      nombre: 'Pala de Pádel Carbono',
      descripcion: 'Pala profesional de alto rendimiento',
      caracteristicas: ['100% Carbono', 'Balance medio', 'Forma diamante'],
      precio: 299.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Pala+Bullpadel',
      categoria: 'equipamiento',
      deporte: 'padel',
      marca: 'Bullpadel',
      color: 'rojo',
      tallas: ['standard'],
      stock: 5,
      descuento: 0,
      nuevo: true
    },
    {
      id: '7',
      nombre: 'Medias de Fútbol Pro',
      descripcion: 'Medias oficiales de competición',
      caracteristicas: ['Compresión graduada', 'Anti-ampollas', 'Tejido técnico'],
      precio: 14.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Medias+Puma',
      categoria: 'ropa',
      deporte: 'futbol',
      marca: 'Puma',
      color: 'negro',
      tallas: ['36-39', '40-43', '44-47'],
      stock: 50,
      descuento: 0
    },
    {
      id: '8',
      nombre: 'Pelota de Tenis Pack',
      descripcion: 'Pack de 3 pelotas oficiales',
      caracteristicas: ['Aprobadas ITF', 'Alta durabilidad', 'Núcleo HD'],
      precio: 9.99,
      imagen: 'https://placehold.co/300x300/e4e4e4/111111.webp?text=Pelotas+Penn',
      categoria: 'equipamiento',
      deporte: 'tenis',
      marca: 'Penn',
      color: 'amarillo',
      tallas: ['standard'],
      stock: 100,
      descuento: 0
    },
    {
      id: '9',
      nombre: 'Guantes de Portero',
      descripcion: 'Guantes profesionales con protección',
      caracteristicas: ['Grip avanzado', 'Protección dedos', 'Material impermeable'],
      precio: 45.99,
      precioAnterior: 59.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Guantes+Reusch',
      categoria: 'equipamiento',
      deporte: 'futbol',
      marca: 'Reusch',
      color: 'verde',
      tallas: ['8', '9', '10'],
      stock: 15,
      descuento: 20,
      oferta: true
    },
    {
      id: '10',
      nombre: 'Bolsa de Pádel Premium',
      descripcion: 'Bolsa espaciosa con compartimentos',
      caracteristicas: ['Múltiples bolsillos', 'Material resistente', 'Correa ajustable'],
      precio: 69.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Bolsa+Head',
      categoria: 'accesorios',
      deporte: 'padel',
      marca: 'Head',
      color: 'azul',
      tallas: ['standard'],
      stock: 10,
      descuento: 0
    },
    {
      id: '11',
      nombre: 'Muñequeras Tenis Pro',
      descripcion: 'Pack de 2 muñequeras absorbentes',
      caracteristicas: ['Alta absorción', 'Ajuste cómodo', 'Secado rápido'],
      precio: 12.99,
      imagen: 'https://placehold.co/300x300/e4e4e4/111111.webp?text=Muñequeras+Babolat',
      categoria: 'accesorios',
      deporte: 'tenis',
      marca: 'Babolat',
      color: 'negro',
      tallas: ['standard'],
      stock: 30,
      descuento: 0
    },
    {
      id: '12',
      nombre: 'Botines de Fútbol Speed',
      descripcion: 'Botines para máxima velocidad',
      caracteristicas: ['Suela FG', 'Ultra ligeros', 'Ajuste dinámico'],
      precio: 179.99,
      precioAnterior: 199.99,
      imagen: 'https://placehold.co/300x400/e4e4e4/111111.webp?text=Botines+Puma',
      categoria: 'calzado',
      deporte: 'futbol',
      marca: 'Puma',
      color: 'naranja',
      tallas: ['39', '40', '41', '42', '43', '44'],
      stock: 8,
      descuento: 10,
      oferta: true
    }
  ];

  getProductosFiltrados(filtros: FiltrosProducto): Producto[] {
    let productos = [...this.productosDemo];

    if (filtros.deporte && filtros.deporte !== 'todos') {
      productos = productos.filter(p => p.deporte === filtros.deporte);
    }

    if (filtros.marca?.length) {
      productos = productos.filter(p => filtros.marca!.includes(p.marca));
    }

    if (typeof filtros.precioMin === 'number' && filtros.precioMin > 0) {
      productos = productos.filter(p => p.precio >= filtros.precioMin!);
    }

    if (typeof filtros.precioMax === 'number' && filtros.precioMax < Infinity) {
      productos = productos.filter(p => p.precio <= filtros.precioMax!);
    }

    if (filtros.tallas?.length) {
      productos = productos.filter(p => 
        p.tallas.some(t => filtros.tallas!.includes(t))
      );
    }

    if (filtros.color?.length) {
      productos = productos.filter(p => filtros.color!.includes(p.color));
    }

    return productos;
  }

  getProductosPorDeporte(deporte: string): Observable<Producto[]> {
    return of(this.productosDemo.filter(p => p.deporte === deporte));
  }

  getProductoPorId(id: string): Producto | undefined {
    return this.productosDemo.find(p => p.id === id);
  }

  getProductos(): Observable<Producto[]> {
    return of(this.productosDemo);
  }
}