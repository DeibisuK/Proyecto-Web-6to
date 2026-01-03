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

// Rutas del carrito (cliente)
router.get('/client/cart/:uid', getCart);
router.post('/client/cart/:uid/items', addItemToCart);
router.put('/client/cart/items/:id_item', updateItemInCart);
router.delete('/client/cart/items/:id_item', removeItemFromCart);
router.delete('/client/cart/:uid', clearCart);

// Rutas de pedidos (cliente)
router.post('/client/orders/user/:uid', createOrderFromCart);
router.get('/client/orders/user/:uid', getOrders);
router.get('/client/orders/:id_pedido', getOrder);
router.put('/client/orders/:id_pedido/status', updateOrderStatus);

// Rutas de pedidos (admin)
router.get('/admin/pedidos', getAllPedidos);
router.get('/admin/ventas/stats', getVentasStats);

export default router;
