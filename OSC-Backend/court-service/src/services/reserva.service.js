import * as model from '../models/reserva.model.js';
import { v4 as uuidv4 } from 'uuid';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const getByUserId = async (id_usuario) => {
    return await model.findByUserId(id_usuario);
};

export const getByCanchaId = async (id_cancha) => {
    return await model.findByCanchaId(id_cancha);
};

export const create = async (reserva) => {
    reserva.token_acceso_qr = uuidv4();
    return await model.create(reserva);
};

export const update = async (id, reserva) => {
    return await model.update(id, reserva);
};

export const remove = async (id) => {
    return await model.remove(id);
};
