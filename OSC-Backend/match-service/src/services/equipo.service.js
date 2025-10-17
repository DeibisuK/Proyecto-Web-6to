import * as equipoModel from '../models/equipo.model.js';
import * as historialModel from '../models/historial_partidos.model.js';

// Obtener todos los equipos (ADMIN)
export const getAll = async () => {
    return await equipoModel.findAll();
};

// Obtener equipos del usuario autenticado
export const getMisEquipos = async (user) => {
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Si el usuario tiene firebase_uid (autenticado con Google/Facebook)
    if (user.uid) {
        return await equipoModel.findByFirebaseUid(user.uid);
    }
    
    // Si es usuario local de BD
    if (user.id_user) {
        return await equipoModel.findByUsuario(user.id_user);
    }

    throw new Error('No se pudo identificar al usuario');
};

export const getById = async (id) => {
    return await equipoModel.findById(id);
};

export const create = async (equipo, user) => {
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Asignar el creador según el tipo de usuario
    if (user.uid) {
        equipo.firebase_uid = user.uid;
        equipo.id_usuario_creador = null;
    } else if (user.id_user) {
        equipo.id_usuario_creador = user.id_user;
        equipo.firebase_uid = null;
    } else {
        throw new Error('No se pudo identificar al usuario');
    }

    const nuevoEquipo = await equipoModel.create(equipo);
    await historialModel.create(nuevoEquipo.id_equipo);
    return nuevoEquipo;
};

export const update = async (id, equipo, user) => {
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Si es admin o superadmin, puede editar cualquier equipo
    if (user.role === 'admin' || user.role === 'superadmin') {
        return await equipoModel.update(id, equipo);
    }

    // Verificar que el equipo pertenece al usuario
    let pertenece = false;
    if (user.uid) {
        pertenece = await equipoModel.belongsToFirebaseUser(id, user.uid);
    } else if (user.id_user) {
        pertenece = await equipoModel.belongsToUser(id, user.id_user);
    }

    if (!pertenece) {
        throw new Error('No tienes permiso para editar este equipo');
    }

    return await equipoModel.update(id, equipo);
};

export const remove = async (id, user) => {
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Si es admin o superadmin, puede eliminar cualquier equipo
    if (user.role === 'admin' || user.role === 'superadmin') {
        return await equipoModel.remove(id);
    }

    // Verificar que el equipo pertenece al usuario
    let pertenece = false;
    if (user.uid) {
        pertenece = await equipoModel.belongsToFirebaseUser(id, user.uid);
    } else if (user.id_user) {
        pertenece = await equipoModel.belongsToUser(id, user.id_user);
    }

    if (!pertenece) {
        throw new Error('No tienes permiso para eliminar este equipo');
    }

    return await equipoModel.remove(id);
};
