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
import authenticate from '../../../../middleware/authenticate.js';

const router = Router();

// Rutas públicas (acceso vía QR)
router.get('/client/orders/:id_pedido', getOrder);

// Rutas del carrito (cliente - requieren autenticación)
router.get('/client/cart/:uid', authenticate(), getCart);
router.post('/client/cart/:uid/items', authenticate(), addItemToCart);
router.put('/client/cart/items/:id_item', authenticate(), updateItemInCart);
router.delete('/client/cart/items/:id_item', authenticate(), removeItemFromCart);
router.delete('/client/cart/:uid', authenticate(), clearCart);

// Rutas de pedidos (cliente - requieren autenticación)
router.post('/client/orders/user/:uid', authenticate(), createOrderFromCart);
router.get('/client/orders/user/:uid', authenticate(), getOrders);
router.put('/client/orders/:id_pedido/status', authenticate(), updateOrderStatus);

// Rutas de pedidos (admin - requieren autenticación)
router.get('/admin/pedidos', authenticate(), getAllPedidos);
router.get('/admin/ventas/stats', authenticate(), getVentasStats);

export default router;
