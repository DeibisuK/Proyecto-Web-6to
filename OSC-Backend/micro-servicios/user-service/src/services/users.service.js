import * as model from '../models/users.model.js';

export const getAll = async (req, res) => {
    return await model.findAll();
};

export const findById = async (uid) => {
    return await model.findById(uid);
};
    
export const create = async (user) => {
    return await model.create(user);
};

export const update = async (uid, user) => {
    return await model.update(uid, user);
};

export const remove = async (id) => {
    return await model.remove(id);
};

export const updateRole = async (uid, id_rol) => {
    return await model.updateRole(uid, id_rol);
};
export const getCashbackByUid = async (uid) => {
    return await model.getCashback(uid);
};