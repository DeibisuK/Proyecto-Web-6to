import * as service from '../services/sede.service.js';

export const getAllSedes = async (req, res) => {
  try {
    const sedes = await service.getAll();
    res.json(sedes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSedeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sede = await service.getById(id);
    if (sede) {
      res.json(sede);
    } else {
      res.status(404).json({ message: 'Sede not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSede = async (req, res) => {
  try {
    const sede = await service.create(req.body);
    res.status(201).json(sede);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSede = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sede = await service.update(id, req.body);
    if (sede) {
      res.json(sede);
    } else {
      res.status(404).json({ message: 'Sede not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSede = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sede = await service.remove(id);
    if (sede) {
      res.json({ message: 'Sede deleted', sede });
    } else {
      res.status(404).json({ message: 'Sede not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
