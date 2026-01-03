import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query(`
   SELECT 
    c.*,
     s.nombre AS nombre_sede,
      d.nombre_deporte 
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    ORDER BY c.id_cancha DESC
`);
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE c.id_cancha = $1
  `, [id]);
  return result.rows[0];
};

export const findBySede = async (idSede) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE c.id_sede = $1
    ORDER BY c.nombre_cancha
  `, [idSede]);
  return result.rows;
};

export const findByDeporte = async (idDeporte) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE c.id_deporte = $1
    ORDER BY c.nombre_cancha
  `, [idDeporte]);
  return result.rows;
};


export const create = async (cancha) => {
  const { 
    nombre_cancha, 
    id_sede, 
    id_deporte, 
    largo, 
    ancho, 
    tarifa, 
    tipo_superficie, 
    estado, 
    imagen_url 
  } = cancha;
  
  const result = await pool.query(
    `INSERT INTO canchas 
    (nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url]
  );
  return result.rows[0];
};

export const update = async (id, cancha) => {
  const { 
    nombre_cancha, 
    id_sede, 
    id_deporte, 
    largo, 
    ancho, 
    tarifa, 
    tipo_superficie, 
    estado, 
    imagen_url 
  } = cancha;
  
  const result = await pool.query(
    `UPDATE canchas 
    SET nombre_cancha = $1, id_sede = $2, id_deporte = $3, largo = $4, ancho = $5, 
        tarifa = $6, tipo_superficie = $7, estado = $8, imagen_url = $9
    WHERE id_cancha = $10 
    RETURNING *`,
    [nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM canchas WHERE id_cancha = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const guardarHorariosDisponibles = async (idCancha, configuracion) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Eliminar horarios existentes de esta cancha
    await client.query(
      'DELETE FROM horarios_disponibles WHERE id_cancha = $1',
      [idCancha]
    );
    
    console.log('🗑️ Horarios anteriores eliminados para cancha:', idCancha);
    
    // Mapeo de días a números
    const diasMap = {
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6,
      'domingo': 0
    };
    
    const { dias_habilitados, horarios } = configuracion;
    const horariosInsertados = [];
    
    // Preparar horarios para JSON (convertir 00:00 a 24:00)
    const horariosJSON = horarios.map(h => ({
      hora_inicio: h.hora_inicio,
      hora_fin: (h.hora_fin === '00:00' || h.hora_fin === '00:00:00') ? '24:00' : h.hora_fin
    }));
    
    // Insertar UNA fila por día con todos los horarios en JSON
    for (const dia of dias_habilitados) {
      const diaNumero = diasMap[dia];
      
      const result = await client.query(
        `INSERT INTO horarios_disponibles 
        (id_cancha, dia_semana, horarios, activo)
        VALUES ($1, $2, $3, true)
        RETURNING *`,
        [idCancha, diaNumero, JSON.stringify(horariosJSON)]
      );
      horariosInsertados.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    const totalHorarios = dias_habilitados.length * horarios.length;
    console.log(`✅ ${horariosInsertados.length} días configurados con ${horarios.length} horarios cada uno (total: ${totalHorarios} slots)`);
    
    return {
      id_cancha: idCancha,
      total_dias: horariosInsertados.length,
      total_horarios: totalHorarios,
      dias: horariosInsertados
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en transacción de horarios disponibles:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getHorariosDisponibles = async (idCancha) => {
  const result = await pool.query(
    `SELECT 
      id_horario,
      id_cancha,
      dia_semana,
      horario->>'hora_inicio' as hora_inicio,
      CASE 
        WHEN horario->>'hora_fin' = '24:00' THEN '00:00'
        ELSE horario->>'hora_fin'
      END as hora_fin,
      activo
    FROM horarios_disponibles, 
         jsonb_array_elements(horarios) as horario
    WHERE id_cancha = $1 AND activo = true
    ORDER BY dia_semana, hora_inicio`,
    [idCancha]
  );
  return result.rows;
};

export const getHorariosConReservas = async (idCancha, fecha) => {
  console.log('🔍 Consultando horarios con reservas:', { idCancha, fecha });
  
  const result = await pool.query(
    `SELECT 
      hd.id_horario,
      hd.id_cancha,
      hd.dia_semana,
      horario->>'hora_inicio' as hora_inicio,
      CASE 
        WHEN horario->>'hora_fin' = '24:00' THEN '00:00'
        ELSE horario->>'hora_fin'
      END as hora_fin,
      hd.activo,
      CASE 
        WHEN r.id_reserva IS NOT NULL THEN true
        ELSE false
      END as reservado,
      r.id_reserva as debug_id_reserva
    FROM horarios_disponibles hd
    CROSS JOIN jsonb_array_elements(hd.horarios) as horario
    LEFT JOIN reservas r ON 
      r.id_cancha = hd.id_cancha 
      AND r.fecha_reserva = $2::date
      AND TO_CHAR(r.hora_inicio, 'HH24:MI') = horario->>'hora_inicio'
      AND r.estado_pago IN ('pendiente', 'pagado', 'completado')
    WHERE hd.id_cancha = $1 
      AND hd.activo = true
      AND EXTRACT(DOW FROM $2::date) = hd.dia_semana
    ORDER BY hora_inicio`,
    [idCancha, fecha]
  );
  
  console.log('📊 Horarios encontrados:', result.rows.length);
  console.log('🔴 Horarios reservados:', result.rows.filter(h => h.reservado).length);
  
  return result.rows;
};
