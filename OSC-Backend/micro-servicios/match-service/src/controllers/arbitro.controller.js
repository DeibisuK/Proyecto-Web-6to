import * as service from '../services/arbitro.service.js';

export const getAllArbitros = async (req, res) => {
    try {
        const arbitros = await service.getAll();
        res.json(arbitros);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getArbitroById = async (req, res) => {
    try {
        const arbitro = await service.getById(req.params.id);
        if (arbitro) {
            res.json(arbitro);
        } else {
            res.status(404).json({ message: 'Arbitro not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createArbitro = async (req, res) => {
    try {
        const arbitro = await service.create(req.body);
        res.status(201).json(arbitro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateArbitro = async (req, res) => {
    try {
        const arbitro = await service.update(req.params.id, req.body);
        res.json(arbitro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteArbitro = async (req, res) => {
    try {
        const arbitro = await service.remove(req.params.id);
        if (arbitro) {
            res.json({ message: 'Arbitro deleted' });
        } else {
            res.status(404).json({ message: 'Arbitro not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
