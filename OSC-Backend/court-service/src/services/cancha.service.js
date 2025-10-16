import * as model from '../models/cancha.model.js';

export const getAll = async () => {
    return await model.findAll();
};

export const getById = async (id) => {
    return await model.findById(id);
};

export const getBySede = async (idSede) => {
    return await model.findBySede(idSede);
};

export const create = async (cancha) => {
    // Validaciones
    if (!cancha.nombre_cancha || !cancha.id_sede || !cancha.id_deporte) {
        throw new Error('Faltan campos obligatorios: nombre_cancha, id_sede, id_deporte');
    }
    
    if (cancha.largo <= 0 || cancha.largo > 200) {
        throw new Error('El largo debe estar entre 1 y 200 metros');
    }
    
    if (cancha.ancho <= 0 || cancha.ancho > 200) {
        throw new Error('El ancho debe estar entre 1 y 200 metros');
    }
    
    if (cancha.tarifa < 0) {
        throw new Error('La tarifa no puede ser negativa');
    }
    
    const tiposValidos = ['Cemento', 'Césped Natural', 'Césped Sintético', 'Parquet', 'Arcilla'];
    if (!tiposValidos.includes(cancha.tipo_superficie)) {
        throw new Error('Tipo de superficie no válido');
    }
    
    const estadosValidos = ['Disponible', 'Mantenimiento', 'Reservado', 'Fuera de Servicio'];
    if (!estadosValidos.includes(cancha.estado)) {
        throw new Error('Estado no válido');
    }
    
    return await model.create(cancha);
};

export const update = async (id, cancha) => {
    // Validaciones similares a create
    if (cancha.largo && (cancha.largo <= 0 || cancha.largo > 200)) {
        throw new Error('El largo debe estar entre 1 y 200 metros');
    }
    
    if (cancha.ancho && (cancha.ancho <= 0 || cancha.ancho > 200)) {
        throw new Error('El ancho debe estar entre 1 y 200 metros');
    }
    
    if (cancha.tarifa !== undefined && cancha.tarifa < 0) {
        throw new Error('La tarifa no puede ser negativa');
    }
    
    return await model.update(id, cancha);
};

export const remove = async (id) => {
    return await model.remove(id);
};

