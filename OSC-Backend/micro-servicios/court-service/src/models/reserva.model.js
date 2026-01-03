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

export const findByUserIdComplete = async (id_usuario) => {
    const result = await pool.query(`
        SELECT 
            r.*,
            c.nombre_cancha,
            c.tarifa AS tarifa_cancha,
            c.id_sede,
            u.name_user AS nombre_usuario,
            u.email_user AS email_usuario,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            mp.banco,
            mp.tipo_tarjeta,
            CONCAT(REPEAT('*', GREATEST(LENGTH(mp.numero_tarjeta)-3, 0)), RIGHT(mp.numero_tarjeta, 3)) AS numero_tarjeta_oculto,
            (r.hora_inicio + (r.duracion_minutos || ' minutes')::INTERVAL)::TIME AS hora_fin
        FROM reservas r
        INNER JOIN canchas c ON r.id_cancha = c.id_cancha
        LEFT JOIN usuarios u ON r.id_usuario = u.uid
        LEFT JOIN sedes s ON c.id_sede = s.id_sede
        LEFT JOIN metodos_pago mp ON r.id_metodo_pago = mp.id_metodo_pago
        WHERE r.id_usuario = $1
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
    `, [id_usuario]);
    return result.rows;
};

export const findByCanchaId = async (id_cancha) => {
    const result = await pool.query('SELECT * FROM reservas WHERE id_cancha = $1', [id_cancha]);
    return result.rows;
};

export const create = async (reserva) => {
    const { 
        id_cancha, 
        id_usuario, 
        fecha_reserva, 
        hora_inicio, 
        duracion_minutos, 
        monto_total, 
        estado_pago, 
        token_acceso_qr,
        tipo_pago,
        id_metodo_pago,
        comprobante_url,
        notas
    } = reserva;
    
    const result = await pool.query(
        `INSERT INTO reservas (
            id_cancha, id_usuario, fecha_reserva, hora_inicio, duracion_minutos, 
            monto_total, estado_pago, token_acceso_qr, tipo_pago, id_metodo_pago, 
            comprobante_url, notas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *`,
        [id_cancha, id_usuario, fecha_reserva, hora_inicio, duracion_minutos, 
         monto_total, estado_pago, token_acceso_qr, tipo_pago, id_metodo_pago, 
         comprobante_url, notas]
    );
    return result.rows[0];
};

export const update = async (id, reserva) => {
    const { estado_pago, comprobante_url, notas } = reserva;
    const result = await pool.query(
        'UPDATE reservas SET estado_pago = COALESCE($1, estado_pago), comprobante_url = COALESCE($2, comprobante_url), notas = COALESCE($3, notas) WHERE id_reserva = $4 RETURNING *',
        [estado_pago, comprobante_url, notas, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM reservas WHERE id_reserva = $1 RETURNING *', [id]);
    return result.rows[0];
};

export const findAllComplete = async () => {
    const result = await pool.query(`
        SELECT 
            r.*,
            c.nombre_cancha,
            c.tipo_superficie,
            c.tarifa AS tarifa_cancha,
            c.id_sede,
            u.name_user AS nombre_usuario,
            u.email_user AS email_usuario,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            mp.banco,
            mp.tipo_tarjeta,
            CONCAT(REPEAT('*', GREATEST(LENGTH(mp.numero_tarjeta)-3, 0)), RIGHT(mp.numero_tarjeta, 3)) AS numero_tarjeta_oculto,
            (r.hora_inicio + (r.duracion_minutos || ' minutes')::INTERVAL) AS hora_fin
        FROM reservas r
        INNER JOIN canchas c ON r.id_cancha = c.id_cancha
        LEFT JOIN usuarios u ON r.id_usuario = u.uid
        LEFT JOIN sedes s ON c.id_sede = s.id_sede
        LEFT JOIN metodos_pago mp ON r.id_metodo_pago = mp.id_metodo_pago
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
    `);
    return result.rows;
};

export const verificarDisponibilidad = async (id_cancha, fecha_reserva, hora_inicio, duracion_minutos) => {
    const result = await pool.query(
        'SELECT verificar_disponibilidad_cancha($1, $2, $3, $4) AS disponible',
        [id_cancha, fecha_reserva, hora_inicio, duracion_minutos]
    );
    return result.rows[0].disponible;
};
