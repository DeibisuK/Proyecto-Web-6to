import pool from '../config/db.js';

// Obtener variante por ID
export const findById = async (id_variante) => {
    const result = await pool.query(
        'SELECT * FROM variantes_productos WHERE id_variante = $1',
        [id_variante]
    );
    return result.rows[0];
};

// Decrementar stock (al crear pedido)
export const decrementStock = async (id_variante, cantidad) => {
    const result = await pool.query(
        'UPDATE variantes_productos SET stock = stock - $1 WHERE id_variante = $2 RETURNING *',
        [cantidad, id_variante]
    );
    return result.rows[0];
};

// Incrementar stock (al cancelar pedido)
export const incrementStock = async (id_variante, cantidad) => {
    const result = await pool.query(
        'UPDATE variantes_productos SET stock = stock + $1 WHERE id_variante = $2 RETURNING *',
        [cantidad, id_variante]
    );
    return result.rows[0];
};

// Actualizar stock directamente (para admin)
export const updateStock = async (id_variante, nuevo_stock) => {
    const result = await pool.query(
        'UPDATE variantes_productos SET stock = $1 WHERE id_variante = $2 RETURNING *',
        [nuevo_stock, id_variante]
    );
    return result.rows[0];
};
