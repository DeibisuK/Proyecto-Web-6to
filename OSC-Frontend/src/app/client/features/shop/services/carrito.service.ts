import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items = new BehaviorSubject<ItemCarrito[]>([]);
  private total = new BehaviorSubject<number>(0);

  items$ = this.items.asObservable();
  total$ = this.total.asObservable();

  constructor() {}

  agregarProducto(producto: Producto, cantidad: number = 1) {
    const itemsActuales = this.items.value;
    const itemExistente = itemsActuales.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Actualizar cantidad si el producto ya está en el carrito
      itemExistente.cantidad += cantidad;
      this.items.next([...itemsActuales]);
    } else {
      // Agregar nuevo item al carrito
      this.items.next([...itemsActuales, { producto, cantidad }]);
    }

    this.actualizarTotal();
  }

  eliminarProducto(productoId: string) {
    const itemsActuales = this.items.value;
    const nuevosItems = itemsActuales.filter(item => item.producto.id !== productoId);
    this.items.next(nuevosItems);
    this.actualizarTotal();
  }

  actualizarCantidad(productoId: string, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    const itemsActuales = this.items.value;
    const item = itemsActuales.find(item => item.producto.id === productoId);
    
    if (item) {
      item.cantidad = cantidad;
      this.items.next([...itemsActuales]);
      this.actualizarTotal();
    }
  }

  limpiarCarrito() {
    this.items.next([]);
    this.total.next(0);
  }

  private actualizarTotal() {
    const total = this.items.value.reduce((sum, item) => {
      const precio = item.producto.descuento 
        ? item.producto.precio * (1 - item.producto.descuento / 100)
        : item.producto.precio;
      return sum + (precio * item.cantidad);
    }, 0);
    this.total.next(total);
  }

  obtenerCantidadTotal(): Observable<number> {
    return new BehaviorSubject(
      this.items.value.reduce((sum, item) => sum + item.cantidad, 0)
    ).asObservable();
  }
}