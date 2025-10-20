import * as service from '../services/marca.service.js';

export const getAllMarcas = async (req, res) => {
  try {
    const marcas = await service.getAll();
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarcaById = async (req, res) => {
  try {
    const marca = await service.getById(req.params.id);
    if (marca) {
      res.json(marca);
    } else {
      res.status(404).json({ message: 'Marca not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMarca = async (req, res) => {
  try {
    const marca = await service.create(req.body);
    res.status(201).json(marca);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMarca = async (req, res) => {
  try {
    const marca = await service.update(req.params.id, req.body);
    res.json(marca);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMarca = async (req, res) => {
  try {
    const marca = await service.remove(req.params.id);
    if (marca) {
      res.json({ message: 'Marca deleted' });
    } else {
      res.status(404).json({ message: 'Marca not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
