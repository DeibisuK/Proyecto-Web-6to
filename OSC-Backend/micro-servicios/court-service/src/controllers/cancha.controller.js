import * as service from '../services/cancha.service.js';

export const getAllCanchas = async (req, res) => {
  try {
    const canchas = await service.getAll();
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchaById = async (req, res) => {
  try {
    const cancha = await service.getById(req.params.id);
    if (cancha) {
      res.json(cancha);
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchasBySede = async (req, res) => {
  try {
    const canchas = await service.getBySede(req.params.idSede);
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanchasByDeporte = async (req, res) => {
  try {
    const canchas = await service.getByDeporte(req.params.idDeporte);
    res.json(canchas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCancha = async (req, res) => {
  try {
    const cancha = await service.create(req.body);
    res.status(201).json(cancha);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCancha = async (req, res) => {
  try {
    const cancha = await service.update(req.params.id, req.body);
    if (cancha) {
      res.json(cancha);
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCancha = async (req, res) => {
  try {
    const cancha = await service.remove(req.params.id);
    if (cancha) {
      res.json({ message: 'Cancha deleted successfully', cancha });
    } else {
      res.status(404).json({ message: 'Cancha not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

