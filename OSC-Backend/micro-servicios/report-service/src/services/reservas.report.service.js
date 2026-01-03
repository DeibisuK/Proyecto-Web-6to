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
  try {
    const query = `
      SELECT 
        r.id_reserva AS "ID",
        r.fecha_reserva AS "Fecha",
        r.hora_inicio AS "Hora",
        r.duracion_minutos || ' min' AS "Duración",
        c.nombre_cancha AS "Cancha",
        s.nombre AS "Sede",
        d.nombre_deporte AS "Deporte",
        u.name_user AS "Usuario",
        u.email_user AS "Email",
        r.monto_total AS "Monto",
        r.estado_pago AS "Estado Pago",
        r.tipo_pago AS "Tipo Pago",
        r.fecha_registro AS "Fecha Registro"
      FROM reservas r
      LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON c.id_sede = s.id_sede
      LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
      LEFT JOIN usuarios u ON r.id_usuario = u.uid
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
      LIMIT 500
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Fecha", "Hora", "Duración", "Cancha", "Sede", "Deporte", "Usuario", "Email", "Monto", "Estado Pago", "Tipo Pago", "Fecha Registro"],
      rows: result.rows,
      summary: {
        'Total de Reservas': result.rows.length,
        'Monto Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Monto || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en listarReservas:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener reservas" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function reservasPorEstado(year, month) {
  try {
    const query = `
      SELECT 
        r.estado_pago AS "Estado",
        COUNT(*) AS "Total Reservas",
        ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Totales",
        COALESCE(SUM(r.monto_total), 0) AS "Monto Total",
        ROUND(AVG(r.monto_total), 2) AS "Monto Promedio",
        ROUND(
          (COUNT(*) * 100.0) / 
          NULLIF((SELECT COUNT(*) FROM reservas 
                  WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)), 0),
          2
        ) AS "% del Total"
      FROM reservas r
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY r.estado_pago
      ORDER BY COUNT(*) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Estado", "Total Reservas", "Horas Totales", "Monto Total", "Monto Promedio", "% del Total"],
      rows: result.rows,
      summary: {
        'Total de Reservas': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas']), 0),
        'Monto Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Monto Total'] || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en reservasPorEstado:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener reservas por estado" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function cancelaciones(year, month) {
  try {
    const query = `
      SELECT 
        r.id_reserva AS "ID",
        r.fecha_reserva AS "Fecha Reserva",
        c.nombre_cancha AS "Cancha",
        s.nombre AS "Sede",
        d.nombre_deporte AS "Deporte",
        u.name_user AS "Usuario",
        u.email_user AS "Email",
        r.monto_total AS "Monto",
        r.tipo_pago AS "Tipo Pago",
        r.fecha_registro AS "Fecha Registro",
        r.fecha_reserva - DATE(r.fecha_registro) AS "Días Anticipación",
        r.notas AS "Motivo/Notas"
      FROM reservas r
      LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON c.id_sede = s.id_sede
      LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
      LEFT JOIN usuarios u ON r.id_usuario = u.uid
      WHERE r.estado_pago = 'cancelado'
        AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY r.fecha_registro DESC
      LIMIT 200
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Fecha Reserva", "Cancha", "Sede", "Deporte", "Usuario", "Email", "Monto", "Tipo Pago", "Fecha Registro", "Días Anticipación", "Motivo/Notas"],
      rows: result.rows,
      summary: {
        'Total Cancelaciones': result.rows.length,
        'Monto Total Perdido': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Monto || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en cancelaciones:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener cancelaciones" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function reservasPorDeporte(year, month) {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        COUNT(r.id_reserva) AS "Total Reservas",
        ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
        ROUND(AVG(r.monto_total), 2) AS "Ticket Promedio",
        COUNT(DISTINCT r.id_usuario) AS "Usuarios Únicos",
        ROUND(
          (COUNT(r.id_reserva) * 100.0) / 
          NULLIF((SELECT COUNT(*) FROM reservas 
                  WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND estado_pago != 'cancelado'), 0),
          2
        ) AS "% del Total"
      FROM reservas r
      LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
      LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago != 'cancelado'
      GROUP BY d.nombre_deporte
      ORDER BY COUNT(r.id_reserva) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Total Reservas", "Horas Reservadas", "Ingresos", "Ticket Promedio", "Usuarios Únicos", "% del Total"],
      rows: result.rows,
      summary: {
        'Total de Deportes': result.rows.length,
        'Reservas Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en reservasPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener reservas por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function reservasPorDia(year, month) {
  try {
    const query = `
      SELECT 
        CASE EXTRACT(DOW FROM r.fecha_reserva)
          WHEN 0 THEN '7-Domingo'
          WHEN 1 THEN '1-Lunes'
          WHEN 2 THEN '2-Martes'
          WHEN 3 THEN '3-Miércoles'
          WHEN 4 THEN '4-Jueves'
          WHEN 5 THEN '5-Viernes'
          WHEN 6 THEN '6-Sábado'
        END AS "Día Semana",
        COUNT(*) AS "Total Reservas",
        ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
        ROUND(AVG(r.monto_total), 2) AS "Ticket Promedio",
        ROUND(
          (COUNT(*) * 100.0) / 
          NULLIF((SELECT COUNT(*) FROM reservas 
                  WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND estado_pago != 'cancelado'), 0),
          2
        ) AS "% del Total"
      FROM reservas r
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago != 'cancelado'
      GROUP BY EXTRACT(DOW FROM r.fecha_reserva)
      ORDER BY EXTRACT(DOW FROM r.fecha_reserva)
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Día Semana", "Total Reservas", "Horas Reservadas", "Ingresos", "Ticket Promedio", "% del Total"],
      rows: result.rows,
      summary: {
        'Total de Reservas': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en reservasPorDia:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener reservas por día" }],
      summary: { 'Estado': 'Error' }
    };
  }
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
