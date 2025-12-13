import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-usuarios':
      return await listarUsuarios();
    case 'nuevos-usuarios':
      return await nuevosUsuarios(year, month);
    case 'usuarios-frecuentes':
      return await usuariosFrecuentes(year, month);
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarUsuarios() {
  const query = `
    SELECT 
      u.name_user AS "Nombre Completo",
      u.email_user AS "Email",
      u.phone_user AS "Teléfono",
      r.nombre_rol AS "Rol",
      u.created_at::DATE AS "Fecha de Registro",
      u.estado AS "Estado"
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.created_at DESC
    LIMIT 500
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Nombre Completo", "Email", "Teléfono", "Rol", "Fecha de Registro", "Estado"],
    rows: result.rows,
    summary: {
      'Total de Usuarios': result.rows.length,
      'Usuarios Activos': result.rows.filter(r => r.Estado === 'Activo').length
    }
  };
}

async function nuevosUsuarios(year, month) {
  const query = `
    SELECT 
      u.name_user AS "Nombre",
      u.email_user AS "Email",
      u.created_at::DATE AS "Fecha de Registro",
      r.nombre_rol AS "Rol"
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE EXTRACT(YEAR FROM u.created_at) = $1
      AND EXTRACT(MONTH FROM u.created_at) = $2
    ORDER BY u.created_at DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Nombre", "Email", "Fecha de Registro", "Rol"],
    rows: result.rows,
    summary: {
      'Nuevos Usuarios': result.rows.length
    }
  };
}

async function usuariosFrecuentes(year, month) {
  const query = `
    SELECT 
      u.name_user AS "Nombre",
      u.email_user AS "Email",
      COUNT(r.id_reserva) AS "Total Reservas",
      COALESCE(SUM(r.monto_total), 0) AS "Total Gastado"
    FROM usuarios u
    LEFT JOIN reservas r ON u.id_user = r.id_usuario
      AND EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Pagado'
    WHERE u.id_rol = 2
    GROUP BY u.id_user, u.name_user, u.email_user
    HAVING COUNT(r.id_reserva) > 0
    ORDER BY COUNT(r.id_reserva) DESC
    LIMIT 50
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Nombre", "Email", "Total Reservas", "Total Gastado"],
    rows: result.rows,
    summary: {
      'Usuarios Frecuentes': result.rows.length,
      'Total Gastado': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Total Gastado']), 0).toFixed(2)}`
    }
  };
}
