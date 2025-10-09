import { Router } from 'express';
import {
    getCart,
    addItemToCart,
    updateItemInCart,
    removeItemFromCart,
    clearCart
} from '../controllers/buy.controller.js';
import {
    createOrderFromCart,
    getOrders,
    getOrder,
    updateOrderStatus
} from '../controllers/pedidos.controller.js';

const router = Router();

// Rutas del carrito
router.get('/cart/:id_usuario', getCart);
router.post('/cart/:id_usuario/items', addItemToCart);
router.put('/cart/items/:id_item', updateItemInCart);
router.delete('/cart/items/:id_item', removeItemFromCart);
router.delete('/cart/:id_usuario', clearCart);

// Rutas de pedidos
router.post('/orders/user/:id_usuario', createOrderFromCart);
router.get('/orders/user/:id_usuario', getOrders);
router.get('/orders/:id_pedido', getOrder);
router.put('/orders/:id_pedido/status', updateOrderStatus);

export default router;
