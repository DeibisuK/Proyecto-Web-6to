import * as model from '../models/users.model.js';

export const getAll = async (req, res) => {
    return await model.findAll();
};

export const findById = async (id) => {
    return await model.findById(id);
};

export const create = async (user) => {
    return await model.create(user);
};

export const update = async (id, user) => {
    return await model.update(id, user);
};

export const remove = async (id) => {
    return await model.remove(id);
};
