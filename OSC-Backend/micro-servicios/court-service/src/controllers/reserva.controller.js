import * as service from '../services/reserva.service.js';

export const getAllReservas = async (req, res) => {
    try {
        const reservas = await service.getAll();
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservaById = async (req, res) => {
    try {
        const reserva = await service.getById(req.params.id);
        if (reserva) {
            res.json(reserva);
        } else {
            res.status(404).json({ message: 'Reserva not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservasByUserId = async (req, res) => {
    try {
        const reservas = await service.getByUserId(req.params.id_usuario);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservasByCanchaId = async (req, res) => {
    try {
        const reservas = await service.getByCanchaId(req.params.id_cancha);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReserva = async (req, res) => {
    try {
        const reserva = await service.create(req.body);
        res.status(201).json(reserva);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReserva = async (req, res) => {
    try {
        const reserva = await service.update(req.params.id, req.body);
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReserva = async (req, res) => {
    try {
        const reserva = await service.remove(req.params.id);
        if (reserva) {
            res.json({ message: 'Reserva deleted' });
        } else {
            res.status(404).json({ message: 'Reserva not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
