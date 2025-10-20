import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM reservas');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM reservas WHERE id_reserva = $1', [id]);
    return result.rows[0];
};

export const findByUserId = async (id_usuario) => {
    const result = await pool.query('SELECT * FROM reservas WHERE id_usuario = $1', [id_usuario]);
    return result.rows;
};

export const findByCanchaId = async (id_cancha) => {
    const result = await pool.query('SELECT * FROM reservas WHERE id_cancha = $1', [id_cancha]);
    return result.rows;
};

export const create = async (reserva) => {
    const { id_cancha, id_usuario, fecha_reserva, hora_inicio, duracion_minutos, monto_total, estado_pago, token_acceso_qr } = reserva;
    const result = await pool.query(
        'INSERT INTO reservas (id_cancha, id_usuario, fecha_reserva, hora_inicio, duracion_minutos, monto_total, estado_pago, token_acceso_qr) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id_cancha, id_usuario, fecha_reserva, hora_inicio, duracion_minutos, monto_total, estado_pago, token_acceso_qr]
    );
    return result.rows[0];
};

export const update = async (id, reserva) => {
    const { estado_pago, token_acceso_qr } = reserva;
    const result = await pool.query(
        'UPDATE reservas SET estado_pago = $1, token_acceso_qr = $2 WHERE id_reserva = $3 RETURNING *',
        [estado_pago, token_acceso_qr, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM reservas WHERE id_reserva = $1 RETURNING *', [id]);
    return result.rows[0];
};
