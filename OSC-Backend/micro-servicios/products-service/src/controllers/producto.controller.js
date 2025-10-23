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
    const {
      categoria,
      deporte,
      marca,
      sort,
      q = null,
      is_new = undefined,
      page = '1',
      per_page = '24',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPageNum = Math.min(Math.max(parseInt(per_page, 10) || 24, 1), 100);
    const offset = (pageNum - 1) * perPageNum;

    const opts = {
      categoriaId: categoria ? parseInt(categoria, 10) : null,
      deporteId: deporte ? parseInt(deporte, 10) : null,
      marcaId: marca ? parseInt(marca, 10) : null,
      sort: sort || null,
      q: q ? String(q).trim() : null,
      is_new: is_new === undefined ? null : (String(is_new) === 'true'),
      limit: perPageNum,
      offset,
    };

    console.debug('[getProductosCard] opts (parsed):', opts);
    const result = await service.getAllCard(opts);
    console.debug('[getProductosCard] result:', { total: result.total, count: result.data.length });
    res.json(result);
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
