import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getCarritoServiceInstance } from '../../services/carrito-bridge.service';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descuento?: number;
  imagen: string;
  stock: number;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartProps {
  mode?: 'sidebar' | 'page' | 'mini';
  onClose?: () => void;
}

const Cart: React.FC<CartProps> = ({ mode = 'sidebar', onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const carritoService = getCarritoServiceInstance();

      // Suscribirse a los cambios del carrito
      const itemsSubscription = carritoService.items$.subscribe((items) => {
        setCartItems(items);
      });

      const totalSubscription = carritoService.total$.subscribe((total) => {
        setTotal(total);
      });

      setIsInitialized(true);

      // Cleanup al desmontar
      return () => {
        itemsSubscription.unsubscribe();
        totalSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error al inicializar el carrito:', error);
      setIsInitialized(true);
      return () => {};
    }
  }, []);

  // Memoizar cálculos para evitar re-cálculos innecesarios
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => total / 1.15, [total]);
  const iva = useMemo(() => total - subtotal, [total, subtotal]);

  // Memoizar handlers para evitar re-creaciones
  const handleUpdateQuantity = useCallback((item: CartItem, newQuantity: number) => {
    try {
      const carritoService = getCarritoServiceInstance();
      const quantity = parseInt(newQuantity.toString());

      if (quantity <= 0) {
        carritoService.eliminarProducto(item.producto.id);
        return;
      }

      if (quantity > item.producto.stock) {
        carritoService.actualizarCantidad(item.producto.id, item.producto.stock);
        return;
      }

      carritoService.actualizarCantidad(item.producto.id, quantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  }, []);

  const handleRemoveItem = useCallback((item: CartItem) => {
    try {
      const carritoService = getCarritoServiceInstance();
      carritoService.eliminarProducto(item.producto.id);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  }, []);

  const handleIncreaseQuantity = useCallback((item: CartItem) => {
    if (item.cantidad < item.producto.stock) {
      handleUpdateQuantity(item, item.cantidad + 1);
    }
  }, [handleUpdateQuantity]);

  const handleDecreaseQuantity = useCallback((item: CartItem) => {
    if (item.cantidad > 1) {
      handleUpdateQuantity(item, item.cantidad - 1);
    } else {
      handleRemoveItem(item);
    }
  }, [handleUpdateQuantity, handleRemoveItem]);

  const handleClearCart = useCallback(() => {
    try {
      const carritoService = getCarritoServiceInstance();
      carritoService.limpiarCarrito();
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    }
  }, []);

  const handleCheckout = useCallback(() => {
    alert('Funcionalidad a agregar para otro dia');
  }, []);

  const handleContinueShopping = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const getItemPrice = useCallback((item: CartItem) => {
    return item.producto.descuento
      ? item.producto.precio * (1 - item.producto.descuento / 100)
      : item.producto.precio;
  }, []);

  const formatPrice = useCallback((price: number) => {
    return price.toFixed(2);
  }, []);

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className={`carrito-container ${mode}`}>
        <div className="carrito-header">
          <div className="header-content">
            <h2 className="carrito-title">
              <span className="material-icons">shopping_cart</span>
              Carrito de Compras
            </h2>
          </div>
        </div>
        <div className="carrito-content">
          <div className="empty-cart">
            <p>Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  // Vista Mini (para header/navbar)
  if (mode === 'mini' && cartItems.length > 0) {
    return (
      <div className="mini-cart">
        <div className="mini-header">
          <span className="mini-title">{totalItems} producto(s)</span>
          <span className="mini-total">${formatPrice(total)}</span>
        </div>
        <div className="mini-items">
          {cartItems.slice(0, 3).map((item) => (
            <div key={item.producto.id} className="mini-item">
              <img
                src={item.producto.imagen}
                alt={item.producto.nombre}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
                }}
              />
              <div className="mini-item-info">
                <span className="mini-item-name">{item.producto.nombre}</span>
                <span className="mini-item-price">
                  ${formatPrice(item.producto.precio)} x {item.cantidad}
                </span>
              </div>
            </div>
          ))}
          {cartItems.length > 3 && (
            <div className="mini-more">
              <span>+{cartItems.length - 3} más...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`carrito-container ${mode}`}>
      {/* Header del Carrito */}
      {mode !== 'mini' && (
        <div className="carrito-header">
          <div className="header-content">
            <h2 className="carrito-title">
              <span className="material-icons">shopping_cart</span>
              Carrito de Compras
              {totalItems > 0 && <span className="item-count">({totalItems})</span>}
            </h2>
            <button className="close-btn" onClick={handleClose}>
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido del Carrito */}
      <div className="carrito-content">
        {/* Carrito Vacío */}
        {cartItems.length === 0 && (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <span className="material-icons">shopping_cart</span>
            </div>
            <h3>Tu carrito está vacío</h3>
            <p>¡Agrega algunos productos para comenzar!</p>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continuar Comprando
            </button>
          </div>
        )}

        {/* Lista de Productos */}
        {cartItems.length > 0 && (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.producto.id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  <div className="item-details">
                    <h4 className="item-name">{item.producto.nombre}</h4>
                    <p className="item-category">{item.producto.categoria}</p>
                    <div className="item-price">${formatPrice(item.producto.precio)}</div>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => handleDecreaseQuantity(item)}>
                        <span className="material-icons">remove</span>
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={item.cantidad}
                        onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value) || 0)}
                        min="1"
                        max={item.producto.stock}
                      />
                      <button className="qty-btn" onClick={() => handleIncreaseQuantity(item)}>
                        <span className="material-icons">add</span>
                      </button>
                    </div>

                    <div className="item-total">
                      <strong>${formatPrice(getItemPrice(item) * item.cantidad)}</strong>
                    </div>

                    <button className="remove-btn" onClick={() => handleRemoveItem(item)}>
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del Carrito */}
            {mode !== 'mini' && (
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>IVA (15%):</span>
                  <span>${formatPrice(iva)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>
                    <strong>Total:</strong>
                  </span>
                  <span>
                    <strong>${formatPrice(total)}</strong>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer del Carrito */}
      {cartItems.length > 0 && (
        <div className="carrito-footer">
          <div className="footer-actions">
            {mode !== 'mini' && (
              <button className="clear-cart-btn" onClick={handleClearCart}>
                <span className="material-icons">delete_sweep</span>
                Vaciar Carrito
              </button>
            )}

            <div className="primary-actions">
              {mode === 'page' && (
                <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                  Continuar Comprando
                </button>
              )}
              <button className="checkout-btn" onClick={handleCheckout}>
                <span className="material-icons">payment</span>
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
