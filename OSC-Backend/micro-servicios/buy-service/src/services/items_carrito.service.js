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
    
    let resultItem;
    if (itemExistente) {
        // Si existe, actualizar la cantidad
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        
        // Validar stock para la nueva cantidad
        const stockValidoNuevo = await model.validateStock(id_variante, nuevaCantidad);
        if (!stockValidoNuevo) {
            throw new Error('Stock insuficiente para agregar más unidades');
        }
        
        resultItem = await model.update(itemExistente.id_item, { cantidad: nuevaCantidad });
    } else {
        // Si no existe, crear nuevo item
        resultItem = await model.create({
            id_carrito,
            id_variante,
            cantidad,
            precio_unitario
        });
    }
    
    // Obtener la información completa del item con detalles de producto/variante
    const itemsDetallados = await model.findByCartIdDetailed(id_carrito);
    const itemDetallado = itemsDetallados.find(i => i.id_item === resultItem.id_item);
    
    return itemDetallado || resultItem;
};

export const updateItem = async (id, item) => {
    console.log('🟡 [SERVICE updateItem] ID:', id, 'Tipo:', typeof id, 'Datos:', item);
    const { cantidad, id_variante } = item;
    
    // Si se proporciona id_variante, validar stock
    if (id_variante && cantidad) {
        const stockValido = await model.validateStock(id_variante, cantidad);
        if (!stockValido) {
            throw new Error('Stock insuficiente para la cantidad solicitada');
        }
    }
    
    // Actualizar el item
    const updatedItem = await model.update(id, item);
    console.log('🟡 [SERVICE updateItem] Item básico actualizado:', updatedItem);
    
    // Obtener la información completa del item actualizado con detalles de producto/variante
    const itemsDetallados = await model.findByCartIdDetailed(updatedItem.id_carrito);
    console.log('🟡 [SERVICE updateItem] Items detallados del carrito:', itemsDetallados.length);
    console.log('🟡 [SERVICE updateItem] Todos los items:', itemsDetallados.map(i => ({
        id_item: i.id_item,
        tipo_id_item: typeof i.id_item,
        stock_variante: i.stock_variante
    })));
    
    const itemDetallado = itemsDetallados.find(i => {
        console.log(`🟡 [SERVICE] Comparando: ${i.id_item} (${typeof i.id_item}) === ${id} (${typeof id})`);
        return i.id_item == id; // Usar == para comparación no estricta
    });
    
    console.log('🟡 [SERVICE updateItem] Item detallado encontrado:', {
        encontrado: !!itemDetallado,
        stock_variante: itemDetallado?.stock_variante,
        keys: itemDetallado ? Object.keys(itemDetallado) : []
    });
    
    return itemDetallado || updatedItem;
};

export const removeItem = async (id) => {
    return await model.remove(id);
};

export const clearCart = async (id_carrito) => {
    return await model.clearCart(id_carrito);
}
