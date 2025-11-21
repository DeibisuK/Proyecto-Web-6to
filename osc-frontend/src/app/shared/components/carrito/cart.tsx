import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getCarritoServiceInstance } from '@shared/services/index';
import { navigateFromReact } from '@shared/services/index';

/**
 * Interface que representa un item del carrito desde el backend
 * Estructura actualizada con id_variante y datos de la variante
 */
interface CartItemDetail {
  id_item: number;
  id_carrito: number;
  id_variante: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  updated_at: string;

  // Información de la variante (desde JOIN con vista)
  sku: string;
  nombre_producto: string;
  imagen_producto: string;
  color: string | null;
  talla: string | null;
  stock_variante: number;
}

interface CartProps {
  mode?: 'sidebar' | 'page' | 'mini';
  onClose?: () => void;
}

const Cart: React.FC<CartProps> = ({ mode = 'sidebar', onClose }) => {
  const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    try {
      const carritoService = getCarritoServiceInstance();

      const itemsSubscription = carritoService.items$.subscribe((items: CartItemDetail[]) => {
        const itemsArray = Array.isArray(items) ? items : [];
        setCartItems(itemsArray);
      });

      const totalSubscription = carritoService.total$.subscribe((total: number) => {
        setTotal(total);
      });

      setIsInitialized(true);

      return () => {
        itemsSubscription.unsubscribe();
        totalSubscription.unsubscribe();
      };
    } catch (error) {
      setIsInitialized(true);
      return () => {};
    }
  }, []);

  // Memoizar cálculos para evitar re-cálculos innecesarios
  const totalItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => total / 1.15, [total]);
  const iva = useMemo(() => total - subtotal, [total, subtotal]);

  // Memoizar handlers para evitar re-creaciones
  const handleUpdateQuantity = useCallback((item: CartItemDetail, newQuantity: number) => {
    try {
      const carritoService = getCarritoServiceInstance();
      const quantity = parseInt(newQuantity.toString());

      if (quantity <= 0) {
        carritoService.eliminarItem(item.id_item).subscribe();
        return;
      }

      if (quantity > item.stock_variante) {
        carritoService.actualizarCantidad(item.id_item, item.stock_variante).subscribe();
        return;
      }

      carritoService.actualizarCantidad(item.id_item, quantity).subscribe();
    } catch (error) {
      // Error manejado por el servicio con NotificationService
    }
  }, []);

  const handleRemoveItem = useCallback((item: CartItemDetail) => {
    try {
      const carritoService = getCarritoServiceInstance();
      carritoService.eliminarItem(item.id_item).subscribe();
    } catch (error) {
      // Error manejado por el servicio con NotificationService
    }
  }, []);

  const handleIncreaseQuantity = useCallback((itemId: number) => {
    const currentItem = cartItems.find((i: CartItemDetail) => i.id_item === itemId);

    if (!currentItem) {
      return;
    }

    if (!currentItem.stock_variante) {
      handleUpdateQuantity(currentItem, currentItem.cantidad + 1);
      return;
    }

    if (currentItem.cantidad < currentItem.stock_variante) {
      handleUpdateQuantity(currentItem, currentItem.cantidad + 1);
    } else {
      alert(`⚠️ Stock máximo disponible: ${currentItem.stock_variante} unidades`);
    }
  }, [cartItems, handleUpdateQuantity]);

  const handleDecreaseQuantity = useCallback((itemId: number) => {
    const currentItem = cartItems.find((i: CartItemDetail) => i.id_item === itemId);

    if (!currentItem) {
      return;
    }

    if (currentItem.cantidad > 1) {
      handleUpdateQuantity(currentItem, currentItem.cantidad - 1);
    } else {
      handleRemoveItem(currentItem);
    }
  }, [cartItems, handleUpdateQuantity, handleRemoveItem]);

  const handleClearCart = useCallback(() => {
    const confirmacion = confirm('¿Estás seguro de que deseas vaciar el carrito?');
    if (!confirmacion) return;

    try {
      const carritoService = getCarritoServiceInstance();
      carritoService.limpiarCarrito().subscribe();
    } catch (error) {
      // Error manejado por el servicio con NotificationService
    }
  }, []);

  const handleCheckout = useCallback(() => {
    if (mode === 'sidebar') {
      setIsClosing(true);
      setTimeout(() => {
        navigateFromReact('/tienda/checkout');
        if (onClose) onClose();
      }, 300);
    } else {
      navigateFromReact('/tienda/checkout');
      if (onClose) onClose();
    }
  }, [onClose, mode]);

  const handleContinueShopping = useCallback(() => {
    if (mode === 'sidebar') {
      setIsClosing(true);
      setTimeout(() => {
        navigateFromReact('/tienda');
        if (onClose) onClose();
      }, 300);
    } else {
      navigateFromReact('/tienda');
      if (onClose) onClose();
    }
  }, [onClose, mode]);

  const handleClose = useCallback(() => {
    if (mode === 'sidebar') {
      setIsClosing(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    } else {
      if (onClose) onClose();
    }
  }, [onClose, mode]);

  /**
   * Obtiene el precio unitario del item
   * Ya viene calculado desde el backend (precio_unitario)
   */
  const getItemPrice = useCallback((item: CartItemDetail) => {
    return item.precio_unitario;
  }, []);

  /**
   * Formatea el precio con 2 decimales
   */
  const formatPrice = useCallback((price: number) => {
    return price.toFixed(2);
  }, []);

  /**
   * Obtiene la descripción de la variante (Color, Talla, etc.)
   */
  const getVariantDescription = useCallback((item: CartItemDetail) => {
    const parts: string[] = [];
    if (item.color) parts.push(item.color);
    if (item.talla) parts.push(`Talla ${item.talla}`);
    return parts.length > 0 ? parts.join(' • ') : '';
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
            <div key={item.id_item} className="mini-item">
              <img
                src={item.imagen_producto}
                alt={item.nombre_producto}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
                }}
              />
              <div className="mini-item-info">
                <span className="mini-item-name">{item.nombre_producto}</span>
                <span className="mini-item-variant">{getVariantDescription(item)}</span>
                <span className="mini-item-price">
                  ${formatPrice(item.precio_unitario)} x {item.cantidad}
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
    <div className={`carrito-container ${mode} ${isClosing ? 'closing' : ''}`}>
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
                <div key={item.id_item} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.imagen_producto}
                      alt={item.nombre_producto}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  <div className="item-details">
                    <h4 className="item-name">{item.nombre_producto}</h4>
                    <p className="item-variant">{getVariantDescription(item)}</p>
                    {item.sku && <p className="item-sku">SKU: {item.sku}</p>}
                    <div className="item-price">${formatPrice(item.precio_unitario)}</div>
                    {item.stock_variante < 5 && item.stock_variante > 0 && (
                      <p className="stock-warning">⚠️ Solo {item.stock_variante} disponibles</p>
                    )}
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => handleDecreaseQuantity(item.id_item)}>
                        <span className="material-icons">remove</span>
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={item.cantidad}
                        onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value) || 0)}
                        min="1"
                        max={item.stock_variante}
                      />
                      <button className="qty-btn" onClick={() => handleIncreaseQuantity(item.id_item)}>
                        <span className="material-icons">add</span>
                      </button>
                    </div>

                    <div className="item-total">
                      <strong>${formatPrice(item.subtotal)}</strong>
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
