import * as service from '../services/equipo.service.js';

export const getAllEquipos = async (req, res) => {
    try {
        const equipos = await service.getAll();
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

export const createEquipo = async (req, res) => {
    try {
        const equipo = await service.create(req.body);
        res.status(201).json(equipo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEquipo = async (req, res) => {
    try {
        const equipo = await service.update(req.params.id, req.body);
        res.json(equipo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEquipo = async (req, res) => {
    try {
        const equipo = await service.remove(req.params.id);
        if (equipo) {
            res.json({ message: 'Equipo deleted' });
        } else {
            res.status(404).json({ message: 'Equipo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
