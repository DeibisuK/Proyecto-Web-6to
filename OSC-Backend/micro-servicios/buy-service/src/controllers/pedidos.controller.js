import * as pedidosService from '../services/pedidos.service.js';
import * as carritoService from '../services/carrito.service.js';
import * as itemsCarritoService from '../services/items_carrito.service.js';

export const createOrderFromCart = async (req, res) => {
    try {
        const id_usuario = req.params.uid; // uid del usuario desde Firebase Auth
        const cart = await carritoService.getCartByUserId(id_usuario);
        
        // Usar el nuevo método que valida stock y limpia el carrito
        const pedido = await pedidosService.createOrderFromCart(id_usuario, cart.id_carrito);

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido
        });
    } catch (error) {
        // Manejo de errores específicos
        if (error.message.includes('carrito está vacío') || error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const id_usuario = req.params.uid; // uid del usuario desde Firebase Auth
        const orders = await pedidosService.getOrdersByUserId(id_usuario);
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
        console.log('📡 [UPDATE STATUS] req.params:', req.params);
        console.log('📡 [UPDATE STATUS] id_pedido:', req.params.id_pedido, 'tipo:', typeof req.params.id_pedido);
        console.log('📡 [UPDATE STATUS] req.body:', req.body);
        
        const { estado_pedido } = req.body;
        const order = await pedidosService.updateOrderStatus(req.params.id_pedido, estado_pedido);
        res.json(order);
    } catch (error) {
        console.error('❌ [UPDATE STATUS] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
