import * as model from '../models/producto.model.js';

// export const getAll = async () => {
//     return await model.findAllProducts();
// };

export const searchProductos = async (opts) => {
    return await model.searchProducts(opts);
};

/**
 * Obtiene el detalle completo de un producto con todas sus variantes
 * @param {number} id_producto - ID del producto
 * @returns {Object|null} Producto detallado o null si no existe
 */
export const getProductoDetalle = async (id_producto) => {
    return await model.getProductoDetalle(id_producto);
};

export const create = async (producto) => {
    return await model.create(producto);
};

