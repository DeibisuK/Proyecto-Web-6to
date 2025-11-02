import * as model from '../models/pedidos.model.js';
import * as detallePedidoModel from '../models/detalle_pedido.model.js';
import * as itemsCarritoModel from '../models/items_carrito.model.js';
import * as variantesModel from '../models/variantes.model.js';
import { v4 as uuidv4 } from 'uuid';

// Crear pedido desde items del carrito
export const createOrderFromCart = async (id_usuario, id_carrito) => {
    // Obtener items del carrito con información completa
    const items = await itemsCarritoModel.findByCartIdDetailed(id_carrito);
    
    if (!items || items.length === 0) {
        throw new Error('El carrito está vacío');
    }
    
    // Validar stock de todos los items antes de crear el pedido
    for (const item of items) {
        const stockValido = await itemsCarritoModel.validateStock(item.id_variante, item.cantidad);
        if (!stockValido) {
            throw new Error(`Stock insuficiente para: ${item.nombre_producto} (${item.sku})`);
        }
    }
    
    // Calcular total
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const uuid_factura = uuidv4();
    
    // Crear pedido
    const pedido = await model.create({
        id_usuario,
        total,
        estado_pedido: 'Pendiente',
        uuid_factura
    });

    // Crear detalles del pedido usando batch insert
    const detalles = items.map(item => ({
        id_pedido: pedido.id_pedido,
        id_variante: item.id_variante,
        cantidad: item.cantidad,
        precio_venta: item.precio_unitario
    }));
    
    await detallePedidoModel.createBatch(detalles);
    
    // ✅ RESTAR STOCK de cada variante
    for (const item of items) {
        await variantesModel.decrementStock(item.id_variante, item.cantidad);
    }
    
    // Limpiar carrito después de crear el pedido
    await itemsCarritoModel.clearCart(id_carrito);

    return {
        ...pedido,
        detalles: items
    };
};

// Crear pedido directo (sin carrito) - para compras rápidas
export const createOrder = async (id_usuario, items) => {
    // Validar que items tenga id_variante en lugar de id_producto
    if (items.some(item => !item.id_variante)) {
        throw new Error('Todos los items deben tener id_variante');
    }
    
    // Validar stock de todos los items
    for (const item of items) {
        const stockValido = await itemsCarritoModel.validateStock(item.id_variante, item.cantidad);
        if (!stockValido) {
            throw new Error(`Stock insuficiente para variante ID: ${item.id_variante}`);
        }
    }
    
    const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);
    const uuid_factura = uuidv4();
    
    const pedido = await model.create({
        id_usuario,
        total,
        estado_pedido: 'Pendiente',
        uuid_factura
    });

    const detalles = items.map(item => ({
        id_pedido: pedido.id_pedido,
        id_variante: item.id_variante,
        cantidad: item.cantidad,
        precio_venta: item.precio_unitario
    }));
    
    await detallePedidoModel.createBatch(detalles);

    // ✅ RESTAR STOCK de cada variante
    for (const item of items) {
        await variantesModel.decrementStock(item.id_variante, item.cantidad);
    }

    return pedido;
};

export const getOrdersByUserId = async (id_usuario) => {
    return await model.findByUserId(id_usuario);
};

export const getOrderById = async (id) => {
    const pedido = await model.findById(id);
    if (pedido) {
        pedido.detalles = await detallePedidoModel.findByOrderId(id);
    }
    return pedido;
};

export const updateOrderStatus = async (id, estado_pedido) => {
    // Si se está cancelando el pedido, devolver el stock
    if (estado_pedido === 'Cancelado') {
        const pedido = await model.findById(id);
        
        // Solo devolver stock si el pedido no estaba ya cancelado
        if (pedido.estado_pedido !== 'Cancelado') {
            const detalles = await detallePedidoModel.findByOrderId(id);
            
            // Devolver stock de cada variante
            for (const detalle of detalles) {
                await variantesModel.incrementStock(detalle.id_variante, detalle.cantidad);
            }
        }
    }
    
    return await model.updateStatus(id, estado_pedido);
};
