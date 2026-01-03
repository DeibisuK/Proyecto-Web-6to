import db from '../config/db.js';

/**
 * Obtiene todos los usuarios de la base de datos con información de su rol
 * @returns {Promise<Array>} Lista de usuarios de la BD
 */
export const getAllUsersFromDB = async () => {
  try {
    const res = await db.query(`
      SELECT 
        u.uid,
        u.name_user as nombre,
        u.email_user as email,
        u.id_rol,
        r.nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.name_user ASC
    `);
    
    return res.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza el rol de un usuario en la base de datos
 * @param {string} uid - Firebase UID del usuario
 * @param {number} id_rol - Nuevo ID de rol
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUserRole = async (uid, id_rol) => {
  try {
    const res = await db.query(
      `UPDATE usuarios 
       SET id_rol = $1 
       WHERE uid = $2 
       RETURNING uid, name_user as nombre, email_user as email, id_rol`,
      [id_rol, uid]
    );
    
    if (res.rows.length === 0) {
      return null;
    }
    
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene información de un rol por su ID
 * @param {number} id_rol - ID del rol
 * @returns {Promise<Object|null>} Información del rol
 */
export const getRoleById = async (id_rol) => {
  try {
    const res = await db.query(
      'SELECT id_rol, nombre_rol FROM roles WHERE id_rol = $1',
      [id_rol]
    );
    
    return res.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene usuarios por rol específico
 * @param {number} id_rol - ID del rol
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsersByRole = async (id_rol) => {
  try {
    const res = await db.query(
      'SELECT id_user, uid, name_user, email_user, id_rol FROM usuarios WHERE id_rol = $1 ORDER BY name_user ASC',
      [id_rol]
    );
    
    return res.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene estadísticas generales del sistema para el dashboard
 * @returns {Promise<Object>} Estadísticas completas
 */
export const getEstadisticasDashboard = async () => {
  try {
    // 1. Usuarios totales
    const usuariosRes = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = parseInt(usuariosRes.rows[0].total) || 0;

    // 2. Ingresos del mes actual (reservas + pedidos)
    const mesActual = new Date();
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0, 23, 59, 59);

    // Ingresos de reservas
    const reservasRes = await db.query(`
      SELECT COALESCE(SUM(monto_total), 0) as total_reservas
      FROM reservas
      WHERE fecha_reserva >= $1 AND fecha_reserva <= $2
        AND estado_pago IN ('completado', 'pagado')
    `, [primerDia, ultimoDia]);

    // Ingresos de pedidos (productos)
    const pedidosRes = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total_pedidos
      FROM pedidos
      WHERE fecha_pedido >= $1 AND fecha_pedido <= $2
        AND estado_pedido IN ('completado', 'entregado')
    `, [primerDia, ultimoDia]);

    const ingresosMes = parseFloat(reservasRes.rows[0].total_reservas || 0) + 
                        parseFloat(pedidosRes.rows[0].total_pedidos || 0);

    // 3. Satisfacción promedio (ratings de canchas)
    const ratingsRes = await db.query(`
      SELECT 
        COALESCE(AVG(estrellas), 0) as promedio_satisfaccion,
        COUNT(*) as total_ratings
      FROM ratings_canchas
      WHERE estado = 'activo'
    `);
    
    const satisfaccion = parseFloat(ratingsRes.rows[0].promedio_satisfaccion || 0);
    const totalRatings = parseInt(ratingsRes.rows[0].total_ratings || 0);

    // 4. Reservas creadas hoy
    const reservasHoyRes = await db.query(`
      SELECT 
        COUNT(*) as total_del_dia, 
        COUNT(CASE WHEN estado_pago IN ('pendiente', 'pagado') THEN 1 END) as reservas_activas
      FROM reservas
      WHERE DATE(fecha_registro) = CURRENT_DATE
    `);
    console.log('📊 Reservas creadas hoy:', reservasHoyRes.rows[0]);
    
    const reservasHoy = parseInt(reservasHoyRes.rows[0].reservas_activas || 0);
    console.log('📊 Reservas activas (hoy):', reservasHoy);

    // 5. Top 5 canchas mejor valoradas
    // Primero verificamos si hay canchas disponibles
    const canchasDisponibles = await db.query(`
      SELECT COUNT(*) as total FROM canchas WHERE estado = 'Disponible'
    `);
    console.log('📊 Canchas disponibles:', canchasDisponibles.rows[0].total);

    const topCanchasRes = await db.query(`
      SELECT 
        c.id_cancha,
        c.nombre_cancha,
        c.tipo_superficie,
        c.imagen_url,
        COALESCE(AVG(r.estrellas), 0) as rating_promedio,
        COUNT(r.id_rating) as total_ratings
      FROM canchas c
      LEFT JOIN ratings_canchas r ON c.id_cancha = r.id_cancha AND r.estado = 'activo'
      WHERE c.estado = 'Disponible'
      GROUP BY c.id_cancha, c.nombre_cancha, c.tipo_superficie, c.imagen_url
      ORDER BY rating_promedio DESC, total_ratings DESC
      LIMIT 5
    `);

    console.log('📊 Rows devueltas por query:', topCanchasRes.rows.length);
    console.log('📊 Primera fila:', JSON.stringify(topCanchasRes.rows[0], null, 2));

    const topCanchas = topCanchasRes.rows.map(row => ({
      id_cancha: row.id_cancha,
      nombre: row.nombre_cancha,
      deporte: row.tipo_superficie,
      rating: parseFloat(row.rating_promedio).toFixed(1),
      totalRatings: parseInt(row.total_ratings),
      imagen_url: row.imagen_url
    }));

    console.log('📊 Top Canchas:', topCanchas.length, 'encontradas');
    console.log('📊 Canchas:', JSON.stringify(topCanchas, null, 2));

    // 6. Reservas por mes del año actual (2026)
    const reservasPorMesRes = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM fecha_reserva) as mes,
        CASE EXTRACT(MONTH FROM fecha_reserva)
          WHEN 1 THEN 'Enero'
          WHEN 2 THEN 'Febrero'
          WHEN 3 THEN 'Marzo'
          WHEN 4 THEN 'Abril'
          WHEN 5 THEN 'Mayo'
          WHEN 6 THEN 'Junio'
          WHEN 7 THEN 'Julio'
          WHEN 8 THEN 'Agosto'
          WHEN 9 THEN 'Septiembre'
          WHEN 10 THEN 'Octubre'
          WHEN 11 THEN 'Noviembre'
          WHEN 12 THEN 'Diciembre'
        END as nombre_mes,
        COUNT(*) as total_reservas
      FROM reservas
      WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM fecha_reserva)
      ORDER BY mes
    `);

    // Crear array de 12 meses con 0 como default
    const reservasPorMes = Array(12).fill(0);
    reservasPorMesRes.rows.forEach(row => {
      const mesIndex = parseInt(row.mes) - 1; // Mes 1-12 a índice 0-11
      reservasPorMes[mesIndex] = parseInt(row.total_reservas);
    });

    // 7. Distribución por deporte (usando tabla deportes)
    const deportesRes = await db.query(`
      SELECT 
        d.nombre_deporte as deporte,
        COUNT(r.id_reserva) as total_reservas
      FROM reservas r
      INNER JOIN canchas c ON r.id_cancha = c.id_cancha
      INNER JOIN deportes d ON c.id_deporte = d.id_deporte
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY d.nombre_deporte
      ORDER BY total_reservas DESC
    `);

    const totalReservasDeporte = deportesRes.rows.reduce((sum, row) => sum + parseInt(row.total_reservas), 0);
    const porDeporte = deportesRes.rows.map(row => ({
      nombre: row.deporte,
      total: parseInt(row.total_reservas),
      porcentaje: totalReservasDeporte > 0 
        ? Math.round((parseInt(row.total_reservas) / totalReservasDeporte) * 100) 
        : 0
    }));

    // 8. Últimas 5 reservas
    const ultimasReservasRes = await db.query(`
      SELECT 
        r.id_reserva,
        r.fecha_reserva,
        r.hora_inicio,
        r.duracion_minutos,
        r.monto_total,
        r.estado_pago,
        r.fecha_registro,
        c.nombre_cancha,
        c.tipo_superficie,
        u.name_user as nombre_usuario,
        u.email_user as email_usuario
      FROM reservas r
      INNER JOIN canchas c ON r.id_cancha = c.id_cancha
      INNER JOIN usuarios u ON r.id_usuario = u.uid
      ORDER BY r.fecha_registro DESC
      LIMIT 5
    `);

    const ultimasReservas = ultimasReservasRes.rows.map(row => ({
      id: row.id_reserva,
      fecha: row.fecha_reserva,
      hora: row.hora_inicio.substring(0, 5), // HH:MM
      duracion: row.duracion_minutos,
      monto: parseFloat(row.monto_total),
      estado: row.estado_pago,
      cancha: row.nombre_cancha,
      deporte: row.tipo_superficie,
      usuario: row.nombre_usuario || row.email_usuario,
      fechaRegistro: row.fecha_registro
    }));

    return {
      usuariosActivos: totalUsuarios,
      ingresosMes: ingresosMes.toFixed(2),
      satisfaccion: satisfaccion.toFixed(1),
      totalRatings: totalRatings,
      reservasHoy: reservasHoy,
      topCanchas: topCanchas,
      reservasPorMes: reservasPorMes,
      porDeporte: porDeporte,
      ultimasReservas: ultimasReservas
    };
  } catch (error) {
    console.error('Error en getEstadisticasDashboard:', error);
    throw error;
  }
};
