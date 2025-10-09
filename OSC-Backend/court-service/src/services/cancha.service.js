import * as model from '../models/cancha.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (cancha) => {
    return await model.create(cancha);
};

export const update = async (id, cancha) => {
    return await model.update(id, cancha);
};

export const remove = async (id) => {
    return await model.remove(id);
};
