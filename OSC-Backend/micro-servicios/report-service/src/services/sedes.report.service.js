import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  switch (option) {
    case 'listar-sedes':
      return await listarSedes();
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarSedes() {
  const query = `
    SELECT 
      s.nombre AS "Nombre",
      s.ciudad AS "Ciudad",
      s.direccion AS "Dirección",
      s.telefono AS "Teléfono",
      s.email AS "Email",
      COUNT(c.id_cancha) AS "Número de Canchas",
      s.estado AS "Estado"
    FROM sedes s
    LEFT JOIN canchas c ON s.id_sede = c.id_sede
    GROUP BY s.id_sede, s.nombre, s.ciudad, s.direccion, s.telefono, s.email, s.estado
    ORDER BY s.nombre
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Nombre", "Ciudad", "Dirección", "Teléfono", "Email", "Número de Canchas", "Estado"],
    rows: result.rows,
    summary: {
      'Total de Sedes': result.rows.length,
      'Sedes Activas': result.rows.filter(r => r.Estado === 'Activo').length
    }
  };
}
