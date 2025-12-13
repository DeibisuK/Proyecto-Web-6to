import pool from '../config/db.js';

// Plantilla básica para equipos
export async function getReportData(option, filters = {}) {
  switch (option) {
    case 'listar-equipos':
      return await listarEquipos();
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarEquipos() {
  try {
    const query = `
      SELECT 
        e.nombre_equipo AS "Equipo",
        d.nombre_deporte AS "Deporte",
        e.firebase_uid AS "UID Creador",
        (SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo) AS "Jugadores",
        e.creado_en::DATE AS "Fecha Creación"
      FROM equipos e
      LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
      ORDER BY e.creado_en DESC
      LIMIT 200
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Equipo", "Deporte", "UID Creador", "Jugadores", "Fecha Creación"],
      rows: result.rows,
      summary: { 
        'Total de Equipos': result.rows.length,
        'Total de Jugadores': result.rows.reduce((sum, r) => sum + parseInt(r.Jugadores || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en listarEquipos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener equipos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
