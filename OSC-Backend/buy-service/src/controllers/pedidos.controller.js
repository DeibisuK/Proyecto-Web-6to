import * as pedidosService from '../services/pedidos.service.js';
import * as carritoService from '../services/carrito.service.js';
import * as itemsCarritoService from '../services/items_carrito.service.js';

export const createOrderFromCart = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const cart = await carritoService.getCartByUserId(id_usuario);
        const items = await itemsCarritoService.getItemsByCartId(cart.id_carrito);

        if (items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        const pedido = await pedidosService.createOrder(id_usuario, items);
        await itemsCarritoService.clearCart(cart.id_carrito);

        res.status(201).json(pedido);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await pedidosService.getOrdersByUserId(req.params.id_usuario);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrder = async (req, res) => {
    try {
        const order = await pedidosService.getOrderById(req.params.id_pedido);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Pedido not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { estado_pedido } = req.body;
        const order = await pedidosService.updateOrderStatus(req.params.id_pedido, estado_pedido);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
