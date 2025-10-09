import * as model from '../models/arbitro.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (arbitro) => {
    return await model.create(arbitro);
};

export const update = async (id, arbitro) => {
    return await model.update(id, arbitro);
};

export const remove = async (id) => {
    return await model.remove(id);
};
