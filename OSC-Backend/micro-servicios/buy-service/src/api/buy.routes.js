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
    updateOrderStatus,
    getAllPedidos,
    getVentasStats
} from '../controllers/pedidos.controller.js';

const router = Router();

// Rutas del carrito
router.get('/cart/:uid', getCart);
router.post('/cart/:uid/items', addItemToCart);
router.put('/cart/items/:id_item', updateItemInCart);
router.delete('/cart/items/:id_item', removeItemFromCart);
router.delete('/cart/:uid', clearCart);

// Rutas de pedidos (cliente)
router.post('/orders/user/:uid', createOrderFromCart);
router.get('/orders/user/:uid', getOrders);
router.get('/orders/:id_pedido', getOrder);
router.put('/orders/:id_pedido/status', updateOrderStatus);

// Rutas de pedidos (admin)
router.get('/admin/pedidos', getAllPedidos);
router.get('/admin/ventas/stats', getVentasStats);

export default router;
