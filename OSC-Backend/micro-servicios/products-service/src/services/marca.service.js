import * as model from '../models/marca.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (marca) => {
    return await model.create(marca);
};

export const update = async (id, marca) => {
    return await model.update(id, marca);
};

export const remove = async (id) => {
    return await model.remove(id);
};
