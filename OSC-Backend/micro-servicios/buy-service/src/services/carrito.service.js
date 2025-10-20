import * as model from '../models/carrito.model.js';

export const getCartByUserId = async (id_usuario) => {
    let cart = await model.findByUserId(id_usuario);
    if (!cart) {
        cart = await model.create({ id_usuario });
    }
    return cart;
};

export const deleteCart = async (id) => {
    return await model.remove(id);
}
