import * as service from '../services/equipo.service.js';

// GET /equipos - ADMIN: Obtener todos los equipos
export const getAllEquipos = async (req, res) => {
    try {
        const equipos = await service.getAll();
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /equipos/mis-equipos - CLIENTE: Obtener equipos del usuario autenticado
export const getMisEquipos = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const equipos = await service.getMisEquipos(req.user);
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener mis equipos:', error);
        res.status(400).json({ message: error.message });
    }
};

// GET /equipos/:id - Obtener un equipo por ID
export const getEquipoById = async (req, res) => {
    try {
        const equipo = await service.getById(req.params.id);
        if (equipo) {
            res.json(equipo);
        } else {
            res.status(404).json({ message: 'Equipo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /equipos - Crear un nuevo equipo
export const createEquipo = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const equipo = await service.create(req.body, req.user);
        res.status(201).json(equipo);
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(400).json({ message: error.message });
    }
};

// PUT /equipos/:id - Actualizar un equipo
export const updateEquipo = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const equipo = await service.update(req.params.id, req.body, req.user);
        res.json(equipo);
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(403).json({ message: error.message });
    }
};

// DELETE /equipos/:id - Eliminar un equipo
export const deleteEquipo = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const equipo = await service.remove(req.params.id, req.user);
        if (equipo) {
            res.json({ message: 'Equipo deleted successfully' });
        } else {
            res.status(404).json({ message: 'Equipo not found' });
        }
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(403).json({ message: error.message });
    }
};
