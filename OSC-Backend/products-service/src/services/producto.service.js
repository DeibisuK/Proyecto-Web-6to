import * as model from '../models/producto.model.js';

export const getAll = async () => {
    return await model.findAllProductos();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (producto) => {
    return await model.create(producto);
};

export const update = async (id, producto) => {
    return await model.update(id, producto);
};

export const remove = async (id) => {
    return await model.remove(id);
};
