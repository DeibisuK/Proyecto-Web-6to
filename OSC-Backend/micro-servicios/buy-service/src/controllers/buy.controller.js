import * as carritoService from '../services/carrito.service.js';
import * as itemsCarritoService from '../services/items_carrito.service.js';

export const getCart = async (req, res) => {
    try {
        const cart = await carritoService.getCartByUserId(req.params.id_usuario);
        const items = await itemsCarritoService.getItemsByCartId(cart.id_carrito);
        cart.items = items;
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addItemToCart = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { id_producto, cantidad, precio_unitario } = req.body;

        const cart = await carritoService.getCartByUserId(id_usuario);

        const item = await itemsCarritoService.addItem({
            id_carrito: cart.id_carrito,
            id_producto,
            cantidad,
            precio_unitario
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateItemInCart = async (req, res) => {
    try {
        const item = await itemsCarritoService.updateItem(req.params.id_item, req.body);
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeItemFromCart = async (req, res) => {
    try {
        await itemsCarritoService.removeItem(req.params.id_item);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await carritoService.getCartByUserId(req.params.id_usuario);
        await itemsCarritoService.clearCart(cart.id_carrito);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
