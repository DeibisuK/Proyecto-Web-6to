import * as service from '../services/producto.service.js';

export const getAllProductos = async (req, res) => {
  try {
    const productos = await service.getAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductosCard = async (req, res) => {
  try {
    const { categoria, deporte, marca, sort, limit, offset } = req.query;
    console.debug('[getProductosCard] req.query:', req.query);
    const opts = {
      categoriaId: categoria ? parseInt(categoria, 10) : null,
      deporteId: deporte ? parseInt(deporte, 10) : null,
      marcaId: marca ? parseInt(marca, 10) : null,
      sort: sort || null,
      limit: limit ? parseInt(limit, 10) : 24,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    console.debug('[getProductosCard] opts (parsed):', opts);
    const productos = await service.getAllCard(opts);
    console.debug('[getProductosCard] productos returned:', productos.length);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductoById = async (req, res) => {
  try {
    const producto = await service.getById(req.params.id);
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).json({ message: 'Producto not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProducto = async (req, res) => {
  try {
    const producto = await service.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProducto = async (req, res) => {
  try {
    const producto = await service.update(req.params.id, req.body);
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const producto = await service.remove(req.params.id);
    if (producto) {
      res.json({ message: 'Producto deleted' });
    } else {
      res.status(404).json({ message: 'Producto not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
