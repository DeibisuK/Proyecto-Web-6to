import * as service from '../services/categoria.service.js';

export const getAllCategorias = async (req, res) => {
  try {
    const categorias = await service.getAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoriaById = async (req, res) => {
  try {
    const categoria = await service.getById(req.params.id);
    if (categoria) {
      res.json(categoria);
    } else {
      res.status(404).json({ message: 'Categoria not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategoria = async (req, res) => {
  try {
    const categoria = await service.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoria = async (req, res) => {
  try {
    const categoria = await service.update(req.params.id, req.body);
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategoria = async (req, res) => {
  try {
    const categoria = await service.remove(req.params.id);
    if (categoria) {
      res.json({ message: 'Categoria deleted' });
    } else {
      res.status(404).json({ message: 'Categoria not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
