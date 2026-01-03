import pool from '../config/db.js';

/**
 * Helper para construir filtros de fecha dinámicamente
 * Si month es undefined/null, solo filtra por año
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

/**
 * Servicio para reportes de canchas
 * Maneja todas las opciones de reportes relacionadas con canchas
 */
export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-canchas':
      return await listarCanchas();
    case 'mas-utilizadas':
      return await canchasMasUtilizadas(year, month);
    case 'mejor-puntuadas':
      return await canchasMejorPuntuadas(year, month);
    case 'ingresos-cancha':
      return await ingresosPorCancha(year, month);
    case 'tasa-ocupacion':
      return await tasaOcupacion(year, month);
    default:
      throw new Error(`Opción no válida: ${option}`);
  }
}

/**
 * Opción 1: Listar Canchas
 */
async function listarCanchas() {
  const query = `
    SELECT 
      c.nombre_cancha AS "Nombre",
      d.nombre_deporte AS "Deporte",
      s.nombre AS "Sede",
      s.ciudad AS "Ciudad",
      c.estado AS "Estado",
      COALESCE(c.tarifa, 0) AS "Precio/Hora",
      c.largo || 'm x ' || c.ancho || 'm' AS "Dimensiones",
      c.tipo_superficie AS "Superficie"
    FROM canchas c
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    ORDER BY s.nombre, c.nombre_cancha
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Nombre", "Deporte", "Sede", "Ciudad", "Estado", "Precio/Hora", "Dimensiones", "Superficie"],
    rows: result.rows,
    summary: {
      'Total de Canchas': result.rows.length,
      'Canchas Disponibles': result.rows.filter(r => r.Estado === 'Disponible').length,
      'Canchas en Mantenimiento': result.rows.filter(r => r.Estado === 'Mantenimiento').length,
      'Precio Promedio': `$${(result.rows.reduce((sum, r) => sum + parseFloat(r['Precio/Hora'] || 0), 0) / result.rows.length).toFixed(2)}`
    }
  };
}

/**
 * Opción 2: Canchas Más Utilizadas
 */
async function canchasMasUtilizadas(year, month) {
  const query = `
    SELECT 
      c.nombre_cancha AS "Cancha",
      s.nombre AS "Sede",
      d.nombre_deporte AS "Deporte",
      COUNT(r.id_reserva) AS "Total Reservas",
      ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
      ROUND(
        (SUM(r.duracion_minutos) / 60.0 / (30 * 12)) * 100, 
        2
      ) AS "Tasa Ocupación (%)",
      COALESCE(SUM(r.monto_total), 0) AS "Ingresos"
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
      AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND r.estado_pago != 'cancelado'
    GROUP BY c.id_cancha, c.nombre_cancha, s.nombre, d.nombre_deporte
    HAVING COUNT(r.id_reserva) > 0
    ORDER BY COUNT(r.id_reserva) DESC
    LIMIT 20
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Cancha", "Sede", "Deporte", "Total Reservas", "Horas Reservadas", "Tasa Ocupación (%)", "Ingresos"],
    rows: result.rows,
    summary: {
      'Total de Canchas': result.rows.length,
      'Reservas Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas']), 0),
      'Horas Totales': result.rows.reduce((sum, r) => sum + parseFloat(r['Horas Reservadas']), 0).toFixed(2),
      'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos), 0).toFixed(2)}`
    }
  };
}

/**
 * Opción 3: Canchas Mejor Puntuadas
 */
async function canchasMejorPuntuadas(year, month) {
  const query = `
    SELECT 
      c.nombre_cancha AS "Cancha",
      s.nombre AS "Sede",
      d.nombre_deporte AS "Deporte",
      c.estado AS "Estado",
      COUNT(DISTINCT r.id_rating) AS "Total Ratings",
      ROUND(AVG(r.estrellas), 2) AS "Promedio Estrellas",
      COUNT(DISTINCT res.id_reserva) AS "Total Reservas",
      COALESCE(c.tarifa, 0) AS "Tarifa"
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    LEFT JOIN ratings_canchas r ON c.id_cancha = r.id_cancha 
      AND r.estado = 'activo'
    LEFT JOIN reservas res ON c.id_cancha = res.id_cancha
    GROUP BY c.id_cancha, c.nombre_cancha, s.nombre, d.nombre_deporte, c.estado, c.tarifa
    HAVING COUNT(DISTINCT r.id_rating) > 0
    ORDER BY AVG(r.estrellas) DESC, COUNT(DISTINCT r.id_rating) DESC
    LIMIT 20
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Cancha", "Sede", "Deporte", "Estado", "Total Ratings", "Promedio Estrellas", "Total Reservas", "Tarifa"],
    rows: result.rows.length > 0 ? result.rows : [],
    summary: {
      'Total de Canchas': result.rows.length,
      'Promedio General': result.rows.length > 0 ? `${(result.rows.reduce((sum, r) => sum + parseFloat(r['Promedio Estrellas'] || 0), 0) / result.rows.length).toFixed(2)} ⭐` : 'N/A'
    }
  };
}

/**
 * Opción 4: Ingresos por Cancha
 */
async function ingresosPorCancha(year, month) {
  const query = `
    SELECT 
      c.nombre_cancha AS "Cancha",
      s.nombre AS "Sede",
      COUNT(r.id_reserva) AS "Total Reservas",
      COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales",
      COALESCE(AVG(r.monto_total), 0) AS "Ingreso Promedio",
      ROUND(
        (COALESCE(SUM(r.monto_total), 0) * 100.0) / 
        NULLIF((SELECT SUM(monto_total) FROM reservas 
                WHERE estado_pago = 'pagado' 
                AND EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)), 0),
        2
      ) AS "% del Total"
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
      AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND r.estado_pago = 'pagado'
    GROUP BY c.id_cancha, c.nombre_cancha, s.nombre
    HAVING SUM(r.monto_total) > 0
    ORDER BY SUM(r.monto_total) DESC NULLS LAST
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Cancha", "Sede", "Total Reservas", "Ingresos Totales", "Ingreso Promedio", "% del Total"],
    rows: result.rows,
    summary: {
      'Total de Canchas': result.rows.length,
      'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingresos Totales']), 0).toFixed(2)}`,
      'Ingreso Promedio': `$${(result.rows.reduce((sum, r) => sum + parseFloat(r['Ingreso Promedio']), 0) / result.rows.length).toFixed(2)}`
    }
  };
}

/**
 * Opción 5: Tasa de Ocupación
 */
async function tasaOcupacion(year, month) {
  const query = `
    SELECT 
      c.nombre_cancha AS "Cancha",
      s.nombre AS "Sede",
      4320 AS "Horas Disponibles Año",
      COALESCE(ROUND(SUM(r.duracion_minutos) / 60.0, 2), 0) AS "Horas Reservadas",
      ROUND(
        (COALESCE(SUM(r.duracion_minutos), 0) / 60.0 / 4320) * 100,
        2
      ) AS "Tasa Ocupación (%)"
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
      AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND r.estado_pago != 'cancelado'
    WHERE c.estado = 'Disponible'
    GROUP BY c.id_cancha, c.nombre_cancha, s.nombre
    ORDER BY (COALESCE(SUM(r.duracion_minutos), 0) / 60.0 / 4320) * 100 DESC
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Cancha", "Sede", "Horas Disponibles", "Horas Reservadas", "Tasa Ocupación (%)"],
    rows: result.rows,
    summary: {
      'Canchas Analizadas': result.rows.length,
      'Tasa Promedio': `${(result.rows.reduce((sum, r) => sum + parseFloat(r['Tasa Ocupación (%)']), 0) / result.rows.length).toFixed(2)}%`,
      'Cancha Más Ocupada': result.rows.length > 0 ? result.rows[0].Cancha : 'N/A'
    }
  };
}
