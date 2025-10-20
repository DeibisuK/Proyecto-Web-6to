import * as model from '../models/deporte.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const create = async (deporte) => {
    return await model.create(deporte);
};

export const update = async (id, deporte) => {
    return await model.update(id, deporte);
};

export const remove = async (id) => {
    return await model.remove(id);
};
