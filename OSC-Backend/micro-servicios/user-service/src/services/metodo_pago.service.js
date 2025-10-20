import * as model from '../models/metodo_pago.model.js';

// Obtener todos los métodos de pago de un usuario
export const getMetodosPagoByUser = async (firebase_uid) => {
    return await model.findByFirebaseUid(firebase_uid);
};

// Obtener un método de pago por ID
export const getMetodoPagoById = async (id) => {
    return await model.findById(id);
};

// Obtener un método de pago por ID y usuario (para seguridad)
export const getMetodoPagoByIdAndUser = async (id, firebase_uid) => {
    return await model.findByIdAndUser(id, firebase_uid);
};

// Crear un nuevo método de pago
export const createMetodoPago = async (data) => {
    return await model.insert(data);
};

// Actualizar un método de pago
export const updateMetodoPago = async (id, data) => {
    return await model.update(id, data);
};

// Eliminar un método de pago
export const deleteMetodoPago = async (id) => {
    return await model.remove(id);
};

// Validar que un método de pago pertenece a un usuario
export const validateMethodOwnership = async (id, firebase_uid) => {
    const metodo = await model.findByIdAndUser(id, firebase_uid);
    return metodo !== undefined;
};
