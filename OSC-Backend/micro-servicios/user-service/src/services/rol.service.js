import * as model from '../models/rol.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (rol) => {
    return await model.create(rol);
};

export const update = async (id, rol) => {
    return await model.update(id, rol);
};

export const remove = async (id) => {
    return await model.remove(id);
};