import * as model from '../models/pedidos.model.js';
import * as detallePedidoModel from '../models/detalle_pedido.model.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (id_usuario, items) => {
    const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);
    const uuid_factura = uuidv4();
    
    const pedido = await model.create({
        id_usuario,
        total,
        estado_pedido: 'Pendiente',
        uuid_factura
    });

    for (const item of items) {
        await detallePedidoModel.create({
            id_pedido: pedido.id_pedido,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_venta: item.precio_unitario
        });
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
    return await model.updateStatus(id, estado_pedido);
};
