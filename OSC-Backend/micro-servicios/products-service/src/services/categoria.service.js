import * as model from '../models/categoria.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (categoria) => {
    return await model.create(categoria);
};

export const update = async (id, categoria) => {
    return await model.update(id, categoria);
};

export const remove = async (id) => {
    return await model.remove(id);
};
