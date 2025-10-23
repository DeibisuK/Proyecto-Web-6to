import * as model from '../models/producto.model.js';

export const getAll = async () => {
    return await model.findProducts();
};

export const getAllCard = async (opts) => {
    return await model.findProducts(opts);
};

export const getById = async (id) => {
    return await model.findProductsFiltre(id);
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
