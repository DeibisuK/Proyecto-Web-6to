import * as equipoModel from '../models/equipo.model.js';
import * as historialModel from '../models/historial_partidos.model.js';

export const getAll = async () => {
    return await equipoModel.findAll();
};

export const getById = async (id) => {
    return await equipoModel.findById(id);
};

export const create = async (equipo) => {
    const nuevoEquipo = await equipoModel.create(equipo);
    await historialModel.create(nuevoEquipo.id_equipo);
    return nuevoEquipo;
};

export const update = async (id, equipo) => {
    return await equipoModel.update(id, equipo);
};

export const remove = async (id) => {
    return await equipoModel.remove(id);
};
