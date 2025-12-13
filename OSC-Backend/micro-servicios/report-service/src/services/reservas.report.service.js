import pool from '../config/db.js';

/**
 * Helper para construir filtros de fecha dinámicamente
 */
function buildDateFilters(year, month) {
  if (month !== undefined && month !== null) {
    return {
      whereClause: 'AND EXTRACT(YEAR FROM r.fecha_reserva) = $1 AND EXTRACT(MONTH FROM r.fecha_reserva) = $2',
      params: [year, month]
    };
  } else {
    return {
      whereClause: 'AND EXTRACT(YEAR FROM r.fecha_reserva) = $1',
      params: [year]
    };
  }
}

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-reservas':
      return await listarReservas(year, month);
    case 'reservas-estado':
      return await reservasPorEstado(year, month);
    case 'cancelaciones':
      return await cancelaciones(year, month);
    case 'reservas-deporte':
      return await reservasPorDeporte(year, month);
    case 'reservas-dia':
      return await reservasPorDia(year, month);
    case 'duracion-promedio':
      return await duracionPromedio(year, month);
    default:
      throw new Error(`Opción no válida: ${option}`);
  }
}

async function listarReservas(year, month) {
  const query = `
    SELECT 
      r.fecha_reserva AS "Fecha",
      u.name_user AS "Usuario",
      c.nombre_cancha AS "Cancha",
      s.nombre AS "Sede",
      d.nombre_deporte AS "Deporte",
      r.hora_inicio AS "Hora Inicio",
      r.duracion_minutos AS "Duración (min)",
      r.monto_total AS "Monto",
      r.estado_pago AS "Estado Pago"
    FROM reservas r
    LEFT JOIN usuarios u ON r.id_usuario = u.id_user
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
    ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
    LIMIT 500
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Fecha", "Usuario", "Cancha", "Sede", "Deporte", "Hora Inicio", "Duración (min)", "Monto", "Estado Pago"],
    rows: result.rows,
    summary: {
      'Total de Reservas': result.rows.length,
      'Monto Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Monto || 0), 0).toFixed(2)}`
    }
  };
}

async function reservasPorEstado(year, month) {
  const query = `
    SELECT 
      r.estado_pago AS "Estado",
      COUNT(*) AS "Cantidad",
      COALESCE(SUM(r.monto_total), 0) AS "Monto Total"
    FROM reservas r
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
    GROUP BY r.estado_pago
    ORDER BY COUNT(*) DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Estado", "Cantidad", "Monto Total"],
    rows: result.rows,
    summary: {
      'Total de Reservas': result.rows.reduce((sum, r) => sum + parseInt(r.Cantidad), 0)
    }
  };
}

async function cancelaciones(year, month) {
  const query = `
    SELECT 
      r.fecha_reserva AS "Fecha Reserva",
      u.name_user AS "Usuario",
      c.nombre_cancha AS "Cancha",
      r.monto_total AS "Monto Perdido"
    FROM reservas r
    LEFT JOIN usuarios u ON r.id_usuario = u.id_user
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Cancelado'
    ORDER BY r.fecha_reserva DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Fecha Reserva", "Usuario", "Cancha", "Monto Perdido"],
    rows: result.rows,
    summary: {
      'Total Cancelaciones': result.rows.length,
      'Monto Total Perdido': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Monto Perdido'] || 0), 0).toFixed(2)}`
    }
  };
}

async function reservasPorDeporte(year, month) {
  const query = `
    SELECT 
      d.nombre_deporte AS "Deporte",
      COUNT(r.id_reserva) AS "Número de Reservas",
      ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Totales",
      COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales"
    FROM reservas r
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Pagado'
    GROUP BY d.nombre_deporte
    ORDER BY COUNT(r.id_reserva) DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Deporte", "Número de Reservas", "Horas Totales", "Ingresos Totales"],
    rows: result.rows,
    summary: {
      'Total de Deportes': result.rows.length,
      'Reservas Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Número de Reservas']), 0)
    }
  };
}

async function reservasPorDia(year, month) {
  const query = `
    SELECT 
      CASE EXTRACT(DOW FROM r.fecha_reserva)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
      END AS "Día de la Semana",
      COUNT(r.id_reserva) AS "Número de Reservas",
      COALESCE(SUM(r.monto_total), 0) AS "Ingresos"
    FROM reservas r
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Pagado'
    GROUP BY EXTRACT(DOW FROM r.fecha_reserva)
    ORDER BY EXTRACT(DOW FROM r.fecha_reserva)
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Día de la Semana", "Número de Reservas", "Ingresos"],
    rows: result.rows,
    summary: {
      'Total de Reservas': result.rows.reduce((sum, r) => sum + parseInt(r['Número de Reservas']), 0)
    }
  };
}

async function duracionPromedio(year, month) {
  const query = `
    SELECT 
      d.nombre_deporte AS "Deporte",
      ROUND(AVG(r.duracion_minutos), 2) AS "Duración Promedio (min)",
      MIN(r.duracion_minutos) AS "Duración Mínima (min)",
      MAX(r.duracion_minutos) AS "Duración Máxima (min)",
      COUNT(r.id_reserva) AS "Total Reservas"
    FROM reservas r
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago != 'Cancelado'
    GROUP BY d.nombre_deporte
    ORDER BY AVG(r.duracion_minutos) DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Deporte", "Duración Promedio (min)", "Duración Mínima (min)", "Duración Máxima (min)", "Total Reservas"],
    rows: result.rows,
    summary: {
      'Duración Promedio General': `${(result.rows.reduce((sum, r) => sum + parseFloat(r['Duración Promedio (min)']), 0) / result.rows.length).toFixed(2)} min`
    }
  };
}
