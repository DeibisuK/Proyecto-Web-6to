import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';
import { Subscription } from 'rxjs';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  @Input() mode: 'sidebar' | 'page' | 'mini' = 'sidebar';
  @Input() showCloseButton: boolean = true;
  @Output() closeCart = new EventEmitter<void>();

  cartItems: CartItem[] = [];
  total: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    // Suscribirse a los cambios del carrito
    this.subscriptions.add(
      this.carritoService.items$.subscribe(items => {
        this.cartItems = items;
      })
    );

    this.subscriptions.add(
      this.carritoService.total$.subscribe(total => {
        this.total = total;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get totalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.cantidad, 0);
  }

  get subtotal(): number {
    return this.total / 1.15; // Subtotal sin IVA
  }

  get iva(): number {
    return this.total - this.subtotal; // IVA calculado
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity <= 0) {
      this.carritoService.eliminarProducto(item.producto.id);
      return;
    }

    if (newQuantity > item.producto.stock) {
      newQuantity = item.producto.stock;
    }

    this.carritoService.actualizarCantidad(item.producto.id, newQuantity);
  }

  removeItem(item: CartItem) {
    this.carritoService.eliminarProducto(item.producto.id);
  }

  clearCart() {
    this.carritoService.limpiarCarrito();
  }

  increaseQuantity(item: CartItem) {
    if (item.cantidad < item.producto.stock) {
      this.carritoService.actualizarCantidad(item.producto.id, item.cantidad + 1);
    }
  }

  decreaseQuantity(item: CartItem) {
    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(item.producto.id, item.cantidad - 1);
    } else {
      this.carritoService.eliminarProducto(item.producto.id);
    }
  }

  checkout() {
    // Lógica para proceder al checkout para un futuro, ya mucho
    console.log('Procediendo al checkout...');
    alert('Funcionalidad a agregar para otro dia');
  }

  continueShopping() {
    // Lógica para continuar comprando
    console.log('Continuando con las compras...');
  }

  onCloseCart() {
    this.closeCart.emit();
  }
}
