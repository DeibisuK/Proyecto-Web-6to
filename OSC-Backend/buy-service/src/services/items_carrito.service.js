import * as model from '../models/items_carrito.model.js';

export const getItemsByCartId = async (id_carrito) => {
    return await model.findByCartId(id_carrito);
};

export const addItem = async (item) => {
    return await model.create(item);
};

export const updateItem = async (id, item) => {
    return await model.update(id, item);
};

export const removeItem = async (id) => {
    return await model.remove(id);
};

export const clearCart = async (id_carrito) => {
    return await model.clearCart(id_carrito);
}
