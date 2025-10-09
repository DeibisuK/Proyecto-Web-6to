import * as service from '../services/deporte.service.js';

export const getAllDeportes = async (req, res) => {
  try {
    const deportes = await service.getAll();
    res.json(deportes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeporteById = async (req, res) => {
  try {
    const deporte = await service.getById(req.params.id);
    if (deporte) {
      res.json(deporte);
    } else {
      res.status(404).json({ message: 'Deporte not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeporte = async (req, res) => {
  try {
    const deporte = await service.create(req.body);
    res.status(201).json(deporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeporte = async (req, res) => {
  try {
    const deporte = await service.update(req.params.id, req.body);
    res.json(deporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDeporte = async (req, res) => {
  try {
    const deporte = await service.remove(req.params.id);
     if (deporte) {
      res.json({ message: 'Deporte deleted' });
    } else {
      res.status(404).json({ message: 'Deporte not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
