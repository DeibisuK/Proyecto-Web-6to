import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-usuarios':
      return await listarUsuarios();
    case 'nuevos-usuarios':
      return await nuevosUsuarios();
    case 'usuarios-frecuentes':
      return await usuariosFrecuentes();
    case 'usuarios-por-deporte':
      return await usuariosPorDeporte();
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarUsuarios() {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Nombre",
        u.email_user AS "Email",
        r.nombre_rol AS "Rol",
        u.estado AS "Estado",
        COUNT(DISTINCT res.id_reserva) AS "Reservas",
        COALESCE(SUM(res.monto_total), 0) AS "Gasto Total",
        u.fecha_registro AS "Fecha Registro"
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN reservas res ON u.uid = res.id_usuario
        AND res.estado_pago = 'pagado'
        AND EXTRACT(YEAR FROM res.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY u.id_user, u.name_user, u.email_user, r.nombre_rol, u.estado, u.cashback, u.fecha_registro
      ORDER BY u.fecha_registro DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Nombre", "Email", "Rol", "Estado", "Reservas", "Gasto Total", "Fecha Registro"],
      rows: result.rows,
      summary: {
        'Total de Usuarios': result.rows.length,
        'Usuarios Activos': result.rows.filter(r => r.Estado === 'Activo').length,
        'Gasto Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Gasto Total'] || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener usuarios" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function nuevosUsuarios() {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Nombre",
        u.email_user AS "Email",
        r.nombre_rol AS "Rol",
        u.fecha_registro AS "Fecha Registro",
        CURRENT_DATE - u.fecha_registro AS "Días desde Registro",
        COUNT(DISTINCT res.id_reserva) AS "Reservas Realizadas",
        COALESCE(SUM(res.monto_total), 0) AS "Gasto Total",
        CASE 
          WHEN COUNT(DISTINCT res.id_reserva) > 0 THEN 'Activo'
          ELSE 'Sin Actividad'
        END AS "Estado Actividad"
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN reservas res ON u.uid = res.id_usuario
        AND res.estado_pago = 'pagado'
      WHERE u.fecha_registro >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id_user, u.name_user, u.email_user, r.nombre_rol, u.fecha_registro
      ORDER BY u.fecha_registro DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Nombre", "Email", "Rol", "Fecha Registro", "Días desde Registro", "Reservas Realizadas", "Gasto Total", "Estado Actividad"],
      rows: result.rows,
      summary: {
        'Nuevos Usuarios': result.rows.length,
        'Usuarios Activos': result.rows.filter(r => r['Estado Actividad'] === 'Activo').length,
        'Usuarios Sin Actividad': result.rows.filter(r => r['Estado Actividad'] === 'Sin Actividad').length
      }
    };
  } catch (error) {
    console.error('Error en nuevosUsuarios:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener nuevos usuarios" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function usuariosFrecuentes() {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Nombre",
        u.email_user AS "Email",
        COUNT(DISTINCT res.id_reserva) AS "Total Reservas",
        ROUND(SUM(res.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        COALESCE(SUM(res.monto_total), 0) AS "Gasto Total",
        ROUND(AVG(res.monto_total), 2) AS "Ticket Promedio",
        COUNT(DISTINCT c.id_deporte) AS "Deportes Diferentes",
        MAX(res.fecha_reserva) AS "Última Reserva"
      FROM usuarios u
      INNER JOIN reservas res ON u.uid = res.id_usuario
      LEFT JOIN canchas c ON res.id_cancha = c.id_cancha
      WHERE EXTRACT(YEAR FROM res.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND res.estado_pago = 'pagado'
      GROUP BY u.id_user, u.name_user, u.email_user, u.cashback
      HAVING COUNT(DISTINCT res.id_reserva) >= 5
      ORDER BY COUNT(DISTINCT res.id_reserva) DESC, SUM(res.monto_total) DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Nombre", "Email", "Total Reservas", "Horas Reservadas", "Gasto Total", "Ticket Promedio", "Deportes Diferentes", "Última Reserva"],
      rows: result.rows,
      summary: {
        'Usuarios Frecuentes': result.rows.length,
        'Total Reservas': result.rows.reduce((sum, r) => sum + parseInt(r['Total Reservas'] || 0), 0),
        'Total Gastado': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Gasto Total'] || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en usuariosFrecuentes:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener usuarios frecuentes" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function usuariosPorDeporte() {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        COUNT(DISTINCT u.id_user) AS "Usuarios Únicos",
        COUNT(res.id_reserva) AS "Total Reservas",
        ROUND(SUM(res.duracion_minutos) / 60.0, 2) AS "Horas Reservadas",
        COALESCE(SUM(res.monto_total), 0) AS "Ingresos",
        ROUND(AVG(res.monto_total), 2) AS "Ticket Promedio",
        ROUND(
          COUNT(res.id_reserva)::numeric / NULLIF(COUNT(DISTINCT u.id_user), 0),
          2
        ) AS "Reservas por Usuario"
      FROM reservas res
      LEFT JOIN usuarios u ON res.id_usuario = u.uid
      LEFT JOIN canchas c ON res.id_cancha = c.id_cancha
      LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
      WHERE EXTRACT(YEAR FROM res.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND res.estado_pago = 'pagado'
      GROUP BY d.nombre_deporte
      ORDER BY COUNT(DISTINCT u.id_user) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Usuarios Únicos", "Total Reservas", "Horas Reservadas", "Ingresos", "Ticket Promedio", "Reservas por Usuario"],
      rows: result.rows,
      summary: {
        'Total Deportes': result.rows.length,
        'Total Usuarios': result.rows.reduce((sum, r) => sum + parseInt(r['Usuarios Únicos'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en usuariosPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener usuarios por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
