import * as service from '../services/producto.service.js';

export const getAllProductos = async (req, res) => {
  try {
    const productos = await service.getAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getProductosCard = async (req, res) => {
//   try {
//     const {
//       categoria,
//       deporte,
//       marca,
//       sort,
//       q = null,
//       is_new = undefined,
//       page = '1',
//       per_page = '10',
//     } = req.query;

//     const pageNum = Math.max(parseInt(page, 10) || 1, 1);
//     const perPageNum = Math.min(Math.max(parseInt(per_page, 10) || 24, 1), 100);
//     const offset = (pageNum - 1) * perPageNum;

//     const opts = {
//       categoriaId: categoria ? parseInt(categoria, 10) : null,
//       deporteId: deporte ? parseInt(deporte, 10) : null,
//       marcaId: marca ? parseInt(marca, 10) : null,
//       sort: sort || null,
//       q: q ? String(q).trim() : null,
//       is_new: is_new === undefined ? null : (String(is_new) === 'true'),
//       limit: perPageNum,
//       offset,
//     };

//     console.debug('[getProductosCard] opts (parsed):', opts);
//     const result = await service.getAllCard(opts);
//     console.debug('[getProductosCard] result:', { total: result.total, count: result.data.length });
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Nuevo endpoint para búsqueda con filtros múltiples
export const searchProductos = async (req, res) => {
  try {
    const {
      marcas = [],
      categorias = [],
      deportes = [],
      is_new = undefined,
      q = null,
      sort = null,
      page = 1,
      per_page = 10,
    } = req.body;

    // Validar y parsear page y per_page
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPageNum = Math.min(Math.max(parseInt(per_page, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * perPageNum;

    // Convertir arrays a arrays de números, filtrando valores inválidos
    const marcasIds = Array.isArray(marcas) 
      ? marcas.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];
    
    const categoriasIds = Array.isArray(categorias)
      ? categorias.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];
    
    const deportesIds = Array.isArray(deportes)
      ? deportes.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];

    const opts = {
      marcasIds: marcasIds.length > 0 ? marcasIds : null,
      categoriasIds: categoriasIds.length > 0 ? categoriasIds : null,
      deportesIds: deportesIds.length > 0 ? deportesIds : null,
      sort: sort || null,
      q: q ? String(q).trim() : null,
      is_new: is_new === undefined ? null : Boolean(is_new),
      limit: perPageNum,
      offset,
    };

    console.debug('[searchProductos] opts (parsed):', opts);
    const result = await service.searchProductos(opts);
    console.debug('[searchProductos] result:', { total: result.total, count: result.data.length });
    res.json(result);
  } catch (error) {
    console.error('[searchProductos] error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtiene el detalle completo de un producto específico
 * GET /client/productos/:id
 */
export const getProductoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    const idProducto = parseInt(id, 10);
    if (isNaN(idProducto)) {
      return res.status(400).json({ 
        message: 'ID de producto inválido',
        error: 'El ID debe ser un número entero'
      });
    }

    console.debug('[getProductoDetalle] Buscando producto ID:', idProducto);
    
    const producto = await service.getProductoDetalle(idProducto);
    
    if (!producto) {
      return res.status(404).json({ 
        message: 'Producto no encontrado',
        id: idProducto
      });
    }

    console.debug('[getProductoDetalle] Producto encontrado:', producto.nombre);
    res.json(producto);
    
  } catch (error) {
    console.error('[getProductoDetalle] error:', error);
    res.status(500).json({ 
      message: 'Error al obtener el detalle del producto',
      error: error.message 
    });
  }
};


// export const getProductoById = async (req, res) => {
//   try {
//     const producto = await service.getById(req.params.id);
//     if (producto) {
//       res.json(producto);
//     } else {
//       res.status(404).json({ message: 'Producto not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createProducto = async (req, res) => {
  try {
    const producto = await service.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const updateProducto = async (req, res) => {
//   try {
//     const producto = await service.update(req.params.id, req.body);
//     res.json(producto);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const deleteProducto = async (req, res) => {
//   try {
//     const producto = await service.remove(req.params.id);
//     if (producto) {
//       res.json({ message: 'Producto deleted' });
//     } else {
//       res.status(404).json({ message: 'Producto not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
