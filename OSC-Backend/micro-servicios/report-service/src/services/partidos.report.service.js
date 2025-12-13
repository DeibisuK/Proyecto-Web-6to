import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-partidos':
      return await listarPartidos(year, month);
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Opción de reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarPartidos(year, month) {
  try {
    let query = `
      SELECT 
        p.fecha_partido::DATE AS "Fecha",
        p.hora_inicio AS "Hora",
        el.nombre_equipo AS "Equipo Local",
        ev.nombre_equipo AS "Equipo Visitante",
        d.nombre_deporte AS "Deporte",
        c.nombre_cancha AS "Cancha",
        u.name_user AS "Árbitro",
        p.estado_partido AS "Estado"
      FROM partidos_torneo p
      LEFT JOIN equipos el ON p.id_equipo_local = el.id_equipo
      LEFT JOIN equipos ev ON p.id_equipo_visitante = ev.id_equipo
      LEFT JOIN torneos t ON p.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN canchas c ON p.id_cancha = c.id_cancha
      LEFT JOIN usuarios u ON p.id_arbitro = u.id_user
      WHERE 1=1
    `;
    
    const params = [];
    
    if (year) {
      params.push(year);
      query += ` AND EXTRACT(YEAR FROM p.fecha_partido) = $${params.length}`;
    }
    
    if (month) {
      params.push(month);
      query += ` AND EXTRACT(MONTH FROM p.fecha_partido) = $${params.length}`;
    }
    
    query += ` ORDER BY p.fecha_partido DESC, p.hora_inicio DESC LIMIT 200`;
    
    const result = await pool.query(query, params);
    
    return {
      columns: ["Fecha", "Hora", "Equipo Local", "Equipo Visitante", "Deporte", "Cancha", "Árbitro", "Estado"],
      rows: result.rows,
      summary: { 
        'Total de Partidos': result.rows.length,
        'Finalizados': result.rows.filter(r => r.Estado === 'Finalizado').length,
        'Pendientes': result.rows.filter(r => r.Estado === 'Pendiente').length
      }
    };
  } catch (error) {
    console.error('Error en listarPartidos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener partidos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
