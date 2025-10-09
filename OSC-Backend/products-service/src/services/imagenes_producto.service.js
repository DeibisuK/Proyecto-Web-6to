import * as model from '../models/imagenes_producto.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const getByProductId = async (id_producto) => {
    return await model.findByProductId(id_producto);
};

export const create = async (imagen) => {
    return await model.create(imagen);
};

export const update = async (id, imagen) => {
    return await model.update(id, imagen);
};

export const remove = async (id) => {
    return await model.remove(id);
};
