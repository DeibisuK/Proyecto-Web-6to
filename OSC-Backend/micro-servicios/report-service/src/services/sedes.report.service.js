import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  switch (option) {
    case 'listar-sedes':
      return await listarSedes();
    case 'sedes-mas-utilizadas':
      return await sedesMasUtilizadas();
    case 'sedes-por-ciudad':
      return await sedesPorCiudad();
    case 'ingresos-por-sede':
      return await ingresosPorSede();
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarSedes() {
  try {
    const query = `
      SELECT 
        s.id_sede AS "ID",
        s.nombre AS "Sede",
        s.ciudad AS "Ciudad",
        s.direccion AS "Dirección",
        s.telefono AS "Teléfono",
        s.email AS "Email",
        s.estado AS "Estado",
        COUNT(DISTINCT c.id_cancha) AS "Canchas",
        COUNT(DISTINCT r.id_reserva) AS "Reservas Totales",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales",
        s.creado_en AS "Fecha Creación"
      FROM sedes s
      LEFT JOIN canchas c ON s.id_sede = c.id_sede
      LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
        AND r.estado_pago = 'pagado'
        AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY s.id_sede, s.nombre, s.ciudad, s.direccion, s.telefono, s.email, s.estado, s.creado_en
      ORDER BY s.nombre
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Sede", "Ciudad", "Dirección", "Teléfono", "Email", "Estado", "Canchas", "Reservas Totales", "Ingresos Totales", "Fecha Creación"],
      rows: result.rows,
      summary: {
        'Total de Sedes': result.rows.length,
        'Sedes Activas': result.rows.filter(r => r.Estado === 'Activo').length,
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingresos Totales'] || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en listarSedes:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener sedes" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function sedesMasUtilizadas() {
  try {
    const query = `
      SELECT 
        s.nombre AS "Sede",
        s.ciudad AS "Ciudad",
        COUNT(DISTINCT c.id_cancha) AS "Canchas",
        COUNT(r.id_reserva) AS "Total Reservas",
        ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        ROUND(
          (SUM(r.duracion_minutos) / 60.0 / (COUNT(DISTINCT c.id_cancha) * 30 * 12)) * 100,
          2
        ) AS "Tasa Ocupación (%)",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
        COUNT(DISTINCT r.id_usuario) AS "Usuarios Únicos"
      FROM sedes s
      LEFT JOIN canchas c ON s.id_sede = c.id_sede
      LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
        AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago != 'cancelado'
      WHERE s.estado = 'Activo'
      GROUP BY s.id_sede, s.nombre, s.ciudad
      HAVING COUNT(r.id_reserva) > 0
      ORDER BY COUNT(r.id_reserva) DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Sede", "Ciudad", "Canchas", "Total Reservas", "Horas Reservadas", "Tasa Ocupación (%)", "Ingresos", "Usuarios Únicos"],
      rows: result.rows,
      summary: {
        'Sedes Analizadas': result.rows.length,
        'Total Reservas': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en sedesMasUtilizadas:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener sedes más utilizadas" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function sedesPorCiudad() {
  try {
    const query = `
      SELECT 
        s.ciudad AS "Ciudad",
        COUNT(DISTINCT s.id_sede) AS "Sedes",
        COUNT(DISTINCT c.id_cancha) AS "Canchas",
        COUNT(r.id_reserva) AS "Reservas",
        ROUND(SUM(r.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
        ROUND(AVG(r.monto_total), 2) AS "Ticket Promedio"
      FROM sedes s
      LEFT JOIN canchas c ON s.id_sede = c.id_sede
      LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
        AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago = 'pagado'
      GROUP BY s.ciudad
      ORDER BY COALESCE(SUM(r.monto_total), 0) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Ciudad", "Sedes", "Canchas", "Reservas", "Horas Reservadas", "Ingresos", "Ticket Promedio"],
      rows: result.rows,
      summary: {
        'Total Ciudades': result.rows.length,
        'Total Sedes': result.rows.reduce((sum, r) => sum + parseInt(r.Sedes || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en sedesPorCiudad:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener sedes por ciudad" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function ingresosPorSede() {
  try {
    const query = `
      SELECT 
        s.nombre AS "Sede",
        s.ciudad AS "Ciudad",
        COUNT(DISTINCT c.id_cancha) AS "Canchas",
        COUNT(r.id_reserva) AS "Reservas",
        COALESCE(SUM(r.monto_total), 0) AS "Ingresos Totales",
        ROUND(AVG(r.monto_total), 2) AS "Ticket Promedio",
        ROUND(
          (COALESCE(SUM(r.monto_total), 0) * 100.0) / 
          NULLIF((SELECT SUM(monto_total) FROM reservas 
                  WHERE estado_pago = 'pagado' 
                  AND EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)), 0),
          2
        ) AS "% del Total",
        ROUND(
          COALESCE(SUM(r.monto_total), 0) / NULLIF(COUNT(DISTINCT c.id_cancha), 0),
          2
        ) AS "Ingreso por Cancha"
      FROM sedes s
      LEFT JOIN canchas c ON s.id_sede = c.id_sede
      LEFT JOIN reservas r ON c.id_cancha = r.id_cancha
        AND EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago = 'pagado'
      WHERE s.estado = 'Activo'
      GROUP BY s.id_sede, s.nombre, s.ciudad
      HAVING SUM(r.monto_total) > 0
      ORDER BY SUM(r.monto_total) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Sede", "Ciudad", "Canchas", "Reservas", "Ingresos Totales", "Ticket Promedio", "% del Total", "Ingreso por Cancha"],
      rows: result.rows,
      summary: {
        'Sedes con Ingresos': result.rows.length,
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingresos Totales'] || 0), 0).toFixed(2)}`,
        'Ticket Promedio General': `$${(result.rows.reduce((sum, r) => sum + parseFloat(r['Ticket Promedio'] || 0), 0) / (result.rows.length || 1)).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en ingresosPorSede:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener ingresos por sede" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
