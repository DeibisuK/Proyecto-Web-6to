import * as service from "../services/producto.service.js";

export const getAllProductos = async (req, res) => {
  try {
    // Soportar filtros opcionales vía query params para el listado admin
    const {
      marca,
      categoria,
      deporte,
      sort = null,
      q = null,
      is_new = undefined,
      page = "1",
      per_page = "24",
    } = req.query || {};

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPageNum = Math.min(Math.max(parseInt(per_page, 10) || 24, 1), 100);
    const offset = (pageNum - 1) * perPageNum;

    // Helper to normalize single or repeated query params into arrays of strings
    const toArray = (v) => {
      if (typeof v === "undefined" || v === null) return [];
      if (Array.isArray(v)) return v;
      return String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const opts = {
      marcas: toArray(marca),
      categorias: toArray(categoria),
      deportes: toArray(deporte),
      sort: sort || null,
      q: q ? String(q).trim() : null,
      is_new:
        typeof is_new === "undefined" ? undefined : String(is_new) === "true",
      page: pageNum,
      per_page: perPageNum,
    };

    // Reuse la lógica ya existente en el servicio de búsqueda (mismo formato de respuesta paginada)
    const result = await service.searchProductos(opts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nuevo endpoint para búsqueda con filtros múltiples
export const searchProductos = async (req, res) => {
  try {
    const {
      marcas = [],
      categorias = [],
      deportes = [],
      colores = [],
      tallas = [],
      is_new = undefined,
      q = null,
      sort = null,
      precioMin = null,
      precioMax = null,
      page = 1,
      per_page = 10,
    } = req.body;

    // Validar y parsear page y per_page
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPageNum = Math.min(Math.max(parseInt(per_page, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * perPageNum;

    // Convertir arrays a arrays de números, filtrando valores inválidos
    const marcasIds = Array.isArray(marcas)
      ? marcas.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : [];

    const categoriasIds = Array.isArray(categorias)
      ? categorias.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : [];

    const deportesIds = Array.isArray(deportes)
      ? deportes.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : [];

    const coloresIds = Array.isArray(colores)
      ? colores.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : [];

    const tallasIds = Array.isArray(tallas)
      ? tallas.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : [];

    // Validar y parsear precios
    const precioMinNum = precioMin !== null && precioMin !== undefined 
      ? parseFloat(precioMin) 
      : null;
    const precioMaxNum = precioMax !== null && precioMax !== undefined 
      ? parseFloat(precioMax) 
      : null;

    const opts = {
      marcasIds: marcasIds.length > 0 ? marcasIds : null,
      categoriasIds: categoriasIds.length > 0 ? categoriasIds : null,
      deportesIds: deportesIds.length > 0 ? deportesIds : null,
      coloresIds: coloresIds.length > 0 ? coloresIds : null,
      tallasIds: tallasIds.length > 0 ? tallasIds : null,
      sort: sort || null,
      q: q ? String(q).trim() : null,
      is_new: is_new === undefined ? null : Boolean(is_new),
      precioMin: precioMinNum,
      precioMax: precioMaxNum,
      limit: perPageNum,
      offset,
    };

    const result = await service.searchProductos(opts);
    res.json(result);
  } catch (error) {
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
        message: "ID de producto inválido",
        error: "El ID debe ser un número entero",
      });
    }

    const producto = await service.getProductoDetalle(idProducto);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
        id: idProducto,
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el detalle del producto",
      error: error.message,
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

/**
 * POST /admin/productos/:id/variantes
 * Acepta un objeto variante o un array de variantes. Inserta todas en una transacción.
 */
export const postVariantes = async (req, res) => {
  try {
    const { id } = req.params;
    const idProducto = parseInt(id, 10);
    if (isNaN(idProducto)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const body = req.body;
    const variantes = Array.isArray(body) ? body : [body];

    if (variantes.length === 0) {
      return res.status(400).json({ message: 'No se enviaron variantes' });
    }
    if (variantes.length > 500) {
      return res.status(400).json({ message: 'Demasiadas variantes en una sola petición (máx 500)' });
    }

    const inserted = await service.createVariantes(idProducto, variantes);
    res.status(201).json({ inserted_count: inserted.length, variantes: inserted });
  } catch (error) {
    // errores de validación lanzados por el modelo pueden propagarse con mensajes legibles
    res.status(400).json({ message: error.message });
  }
};

export const updateProducto = async (req, res) => {
  try {
    const producto = await service.update(req.params.id, req.body);
    if (!producto) {
      return res.status(404).json({ message: 'Producto not found' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const producto = await service.remove(req.params.id);
    if (producto) {
      res.json({ message: "Producto deleted" });
    } else {
      res.status(404).json({ message: "Producto not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /admin/productos/:id_producto/variantes/:id_variante
 * Actualiza una variante específica
 */
export const updateVariante = async (req, res) => {
  try {
    const { id_variante } = req.params;
    const idVariante = parseInt(id_variante, 10);
    
    if (isNaN(idVariante)) {
      return res.status(400).json({ message: 'ID de variante inválido' });
    }

    const updated = await service.updateVariante(idVariante, req.body);
    
    if (!updated) {
      return res.status(404).json({ message: 'Variante no encontrada' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE /admin/productos/:id_producto/variantes/:id_variante
 * Elimina una variante específica
 */
export const deleteVariante = async (req, res) => {
  try {
    const { id_variante } = req.params;
    const idVariante = parseInt(id_variante, 10);
    
    if (isNaN(idVariante)) {
      return res.status(400).json({ message: 'ID de variante inválido' });
    }

    const result = await service.deleteVariante(idVariante);
    
    if (!result.deleted) {
      return res.status(404).json({ message: 'Variante no encontrada' });
    }

    res.json({ message: 'Variante eliminada exitosamente', id_variante: result.id_variante });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /admin/productos/opciones
 * Devuelve las opciones y valores disponibles para productos
 */
export const getOpciones = async (req, res) => {
  try {
    const opciones = await service.getOpciones();
    res.json(opciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /client/productos/opciones/categorias
 * Devuelve las opciones y valores disponibles para múltiples categorías
 */
export const getOpcionesPorCategorias = async (req, res) => {
  try {
    const { categorias = [] } = req.body;
    
    if (!Array.isArray(categorias) || categorias.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de categorías' });
    }

    const categoriasIds = categorias
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    if (categoriasIds.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron IDs de categorías válidos' });
    }

    const opciones = await service.getOpcionesPorCategorias(categoriasIds);
    res.json(opciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /admin/productos/opciones/categoria/:id_categoria
 * Devuelve las opciones y valores disponibles para una categoría específica
 */
export const getOpcionesPorCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const idCategoria = parseInt(id_categoria, 10);
    
    if (isNaN(idCategoria)) {
      return res.status(400).json({ message: 'ID de categoría inválido' });
    }

    const opciones = await service.getOpcionesPorCategoria(idCategoria);
    res.json(opciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
