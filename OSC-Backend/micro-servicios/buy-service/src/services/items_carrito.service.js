import * as model from '../models/items_carrito.model.js';

export const getItemsByCartId = async (id_carrito) => {
    return await model.findByCartId(id_carrito);
};

// Obtener items del carrito con información detallada
export const getItemsByCartIdDetailed = async (id_carrito) => {
    return await model.findByCartIdDetailed(id_carrito);
};

// Agregar item al carrito con validaciones
export const addItem = async (item) => {
    const { id_carrito, id_variante, cantidad } = item;
    
    // Validar stock disponible
    const stockValido = await model.validateStock(id_variante, cantidad);
    if (!stockValido) {
        throw new Error('Stock insuficiente para la variante solicitada');
    }
    
    // Obtener precio actual de la variante
    const precio_unitario = await model.getVariantPrice(id_variante);
    
    // Verificar si el item ya existe en el carrito
    const itemExistente = await model.findByCartAndVariant(id_carrito, id_variante);
    
    if (itemExistente) {
        // Si existe, actualizar la cantidad
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        
        // Validar stock para la nueva cantidad
        const stockValidoNuevo = await model.validateStock(id_variante, nuevaCantidad);
        if (!stockValidoNuevo) {
            throw new Error('Stock insuficiente para agregar más unidades');
        }
        
        return await model.update(itemExistente.id_item, { cantidad: nuevaCantidad });
    }
    
    // Si no existe, crear nuevo item
    return await model.create({
        id_carrito,
        id_variante,
        cantidad,
        precio_unitario
    });
};

export const updateItem = async (id, item) => {
    const { cantidad, id_variante } = item;
    
    // Si se proporciona id_variante, validar stock
    if (id_variante && cantidad) {
        const stockValido = await model.validateStock(id_variante, cantidad);
        if (!stockValido) {
            throw new Error('Stock insuficiente para la cantidad solicitada');
        }
    }
    
    return await model.update(id, item);
};

export const removeItem = async (id) => {
    return await model.remove(id);
};

export const clearCart = async (id_carrito) => {
    return await model.clearCart(id_carrito);
}
