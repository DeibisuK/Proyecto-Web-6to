import * as model from '../models/sede.model.js';

export const getAll = async () => {
  return await model.findAll();
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const create = async (sedeData) => {
  return await model.create(sedeData);
};

export const update = async (id, sedeData) => {
  return await model.update(id, sedeData);
};

export const remove = async (id) => {
  return await model.remove(id);
};
