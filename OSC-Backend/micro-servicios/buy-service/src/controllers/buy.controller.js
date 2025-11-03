import * as carritoService from '../services/carrito.service.js';
import * as itemsCarritoService from '../services/items_carrito.service.js';

export const getCart = async (req, res) => {
    try {
        const id_usuario = req.params.uid; // uid del usuario desde Firebase Auth
        const cart = await carritoService.getCartByUserId(id_usuario);
        // Usar la versión detallada que incluye info del producto y variante
        const items = await itemsCarritoService.getItemsByCartIdDetailed(cart.id_carrito);
        
        // Calcular totales
        const total_items = items.length;
        const total_productos = items.reduce((sum, item) => sum + item.cantidad, 0);
        const total_carrito = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
        
        res.json({
            ...cart,
            items,
            resumen: {
                total_items,
                total_productos,
                total_carrito: total_carrito.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addItemToCart = async (req, res) => {
    try {
        const id_usuario = req.params.uid; // uid del usuario desde Firebase Auth
        const { id_variante, cantidad } = req.body;

        // Validar datos requeridos
        if (!id_variante || !cantidad) {
            return res.status(400).json({ 
                message: 'id_variante y cantidad son requeridos' 
            });
        }

        const cart = await carritoService.getCartByUserId(id_usuario);

        // El servicio se encarga de validar stock y obtener precio
        const item = await itemsCarritoService.addItem({
            id_carrito: cart.id_carrito,
            id_variante,
            cantidad
        });

        res.status(201).json({
            message: 'Item agregado al carrito exitosamente',
            item
        });
    } catch (error) {
        // Diferenciar errores de validación de stock
        if (error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const updateItemInCart = async (req, res) => {
    try {
        console.log('🔵 [UPDATE ITEM] ID:', req.params.id_item, 'Cantidad:', req.body.cantidad);
        const { cantidad } = req.body;
        
        if (!cantidad || cantidad < 1) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }
        
        const item = await itemsCarritoService.updateItem(req.params.id_item, req.body);
        console.log('✅ [UPDATE ITEM] Item actualizado:', {
            id_item: item.id_item,
            cantidad: item.cantidad,
            stock_variante: item.stock_variante,
            tiene_stock: item.hasOwnProperty('stock_variante')
        });
        
        res.json({
            message: 'Item actualizado exitosamente',
            item
        });
    } catch (error) {
        console.error('❌ [UPDATE ITEM] Error:', error.message);
        if (error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ message: error.message });
        }
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
        const id_usuario = req.params.uid; // uid del usuario desde Firebase Auth
        const cart = await carritoService.getCartByUserId(id_usuario);
        await itemsCarritoService.clearCart(cart.id_carrito);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
