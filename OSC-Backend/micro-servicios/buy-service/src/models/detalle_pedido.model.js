import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM detalle_pedidos');
    return result.rows;
};

export const findByOrderId = async (id_pedido) => {
    const result = await pool.query('SELECT * FROM detalle_pedidos WHERE id_pedido = $1', [id_pedido]);
    return result.rows;
};

export const create = async (detalle) => {
    const { id_pedido, id_variante, cantidad, precio_venta } = detalle;
    const result = await pool.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_variante, cantidad, precio_venta) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_pedido, id_variante, cantidad, precio_venta]
    );
    return result.rows[0];
};

// Crear múltiples detalles de pedido en una transacción
export const createBatch = async (detalles) => {
    const values = detalles.map((d, index) => {
        const offset = index * 4;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    }).join(', ');
    
    const params = detalles.flatMap(d => [d.id_pedido, d.id_variante, d.cantidad, d.precio_venta]);
    
    const result = await pool.query(
        `INSERT INTO detalle_pedidos (id_pedido, id_variante, cantidad, precio_venta) 
         VALUES ${values} RETURNING *`,
        params
    );
    return result.rows;
};
