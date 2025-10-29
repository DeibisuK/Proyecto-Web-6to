import * as model from '../models/producto.model.js';

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
    // By default create should only create the base product record.
    // For creating product + variantes in one op use model.create (kept for backward compatibility)
    return await model.createProducto(producto);
};

export const update = async (id, producto) => {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) throw new Error('Invalid product id');
    return await model.updateProducto(idNum, producto);
};

export const remove = async (id) => {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) throw new Error('Invalid product id');
    const res = await model.deleteProducto(idNum);
    // normalize to boolean deleted
    return !!(res && res.deleted);
};

export const createVariantes = async (productId, variantesArray) => {
    const idNum = Number(productId);
    if (Number.isNaN(idNum)) throw new Error('Invalid product id');
    return await model.createVariantes(idNum, variantesArray);
};

export const getOpciones = async () => {
    return await model.getOpcionesConValores();
};
