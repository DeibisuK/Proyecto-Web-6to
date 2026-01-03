import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-arbitros':
      return await listarArbitros();
    case 'mas-partidos':
      return await arbitrosMasPartidos(year, month);
    case 'arbitros-deporte':
      return await arbitrosPorDeporte();
    case 'disponibilidad':
      return await disponibilidadArbitros();
    default:
      throw new Error(`Opción no válida: ${option}`);
  }
}

async function listarArbitros() {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Nombre",
        u.email_user AS "Email",
        u.estado AS "Estado",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Arbitrados",
        COUNT(DISTINCT CASE 
              WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido 
        END) AS "Partidos Finalizados",
        COUNT(DISTINCT CASE 
              WHEN pt.estado_partido IN ('programado', 'por_jugar') THEN pt.id_partido 
        END) AS "Partidos Pendientes",
        COUNT(DISTINCT pt.id_torneo) AS "Torneos",
        COUNT(DISTINCT t.id_deporte) AS "Deportes",
        u.fecha_registro AS "Fecha Registro"
      FROM usuarios u
      LEFT JOIN partidos_torneo pt 
             ON u.id_user = pt.id_arbitro
      LEFT JOIN torneos t 
             ON pt.id_torneo = t.id_torneo
      LEFT JOIN canchas c 
             ON pt.id_cancha = c.id_cancha
      WHERE u.id_rol = 3
      GROUP BY 
        u.id_user, 
        u.name_user, 
        u.email_user, 
        u.estado, 
        u.fecha_registro
      ORDER BY COUNT(DISTINCT pt.id_partido) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Nombre", "Email", "Estado", "Partidos Arbitrados", "Partidos Finalizados", "Partidos Pendientes", "Torneos", "Deportes", "Fecha Registro"],
      rows: result.rows,
      summary: {
        'Total de Árbitros': result.rows.length,
        'Árbitros Activos': result.rows.filter(r => r.Estado === 'A').length,
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Arbitrados'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en listarArbitros:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener árbitros" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function arbitrosMasPartidos(year, month) {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Árbitro",
        COUNT(DISTINCT pt.id_partido) AS "Total Partidos",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Finalizados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido IN ('programado', 'por_jugar', 'en_curso') THEN pt.id_partido END) AS "Activos/Pendientes",
        COUNT(DISTINCT pt.id_torneo) AS "Torneos",
        ROUND(
          COUNT(DISTINCT pt.id_partido)::numeric / 
          NULLIF(COUNT(DISTINCT pt.id_torneo), 0),
          2
        ) AS "Partidos por Torneo",
        MIN(pt.fecha_partido) AS "Primer Partido",
        MAX(pt.fecha_partido) AS "Último Partido"
      FROM usuarios u
      INNER JOIN partidos_torneo pt ON u.id_user = pt.id_arbitro
      WHERE u.id_rol = 3
        AND pt.estado_partido NOT IN ('cancelado', 'suspendido')
      GROUP BY u.id_user, u.name_user
      HAVING COUNT(DISTINCT pt.id_partido) > 0
      ORDER BY COUNT(DISTINCT pt.id_partido) DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Árbitro", "Total Partidos", "Finalizados", "Activos/Pendientes", "Torneos", "Partidos por Torneo", "Primer Partido", "Último Partido"],
      rows: result.rows,
      summary: {
        'Total de Árbitros Activos': result.rows.length,
        'Partidos Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Partidos'] || 0), 0),
        'Torneos Totales': result.rows.reduce((sum, r) => sum + parseInt(r.Torneos || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en arbitrosMasPartidos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener árbitros con más partidos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function arbitrosPorDeporte() {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        u.name_user AS "Árbitro",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Arbitrados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Finalizados",
        COUNT(DISTINCT pt.id_torneo) AS "Torneos",
        MIN(pt.fecha_partido) AS "Primer Partido",
        MAX(pt.fecha_partido) AS "Último Partido"
      FROM usuarios u
      INNER JOIN partidos_torneo pt ON u.id_user = pt.id_arbitro
      INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      WHERE u.id_rol = 3
        AND pt.estado_partido NOT IN ('cancelado', 'suspendido')
      GROUP BY d.nombre_deporte, u.id_user, u.name_user
      ORDER BY d.nombre_deporte, COUNT(DISTINCT pt.id_partido) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Árbitro", "Partidos Arbitrados", "Finalizados", "Torneos", "Primer Partido", "Último Partido"],
      rows: result.rows,
      summary: {
        'Total de Deportes': new Set(result.rows.map(r => r.Deporte)).size,
        'Árbitros Totales': new Set(result.rows.map(r => r.Árbitro)).size,
        'Partidos Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Arbitrados'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en arbitrosPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener árbitros por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function disponibilidadArbitros() {
  try {
    const query = `
      SELECT 
        u.id_user AS "ID",
        u.name_user AS "Árbitro",
        u.email_user AS "Email",
        COUNT(DISTINCT CASE 
          WHEN pt.fecha_partido >= CURRENT_DATE 
          AND pt.estado_partido IN ('programado', 'por_jugar') 
          THEN pt.id_partido 
        END) AS "Partidos Pendientes",
        MAX(CASE 
          WHEN pt.fecha_partido >= CURRENT_DATE 
          AND pt.estado_partido IN ('programado', 'por_jugar')
          THEN pt.fecha_partido 
        END) AS "Próximo Partido",
        COUNT(DISTINCT pt_total.id_partido) AS "Total Partidos Históricos",
        STRING_AGG(DISTINCT d.nombre_deporte, ', ' ORDER BY d.nombre_deporte) AS "Deportes"
      FROM usuarios u
      LEFT JOIN partidos_torneo pt ON u.id_user = pt.id_arbitro
        AND pt.fecha_partido >= CURRENT_DATE
        AND pt.estado_partido IN ('programado', 'por_jugar')
      LEFT JOIN partidos_torneo pt_total ON u.id_user = pt_total.id_arbitro
      LEFT JOIN torneos t ON pt_total.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      WHERE u.id_rol = 3
        AND u.estado = 'A'
      GROUP BY u.id_user, u.name_user, u.email_user
      ORDER BY COUNT(DISTINCT CASE 
          WHEN pt.fecha_partido >= CURRENT_DATE 
          AND pt.estado_partido IN ('programado', 'por_jugar') 
          THEN pt.id_partido 
        END) ASC, 
        COUNT(DISTINCT pt_total.id_partido) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Árbitro", "Email", "Partidos Pendientes", "Próximo Partido", "Total Partidos Históricos", "Deportes"],
      rows: result.rows,
      summary: {
        'Árbitros Disponibles': result.rows.length,
        'Árbitros Sin Partidos Pendientes': result.rows.filter(r => parseInt(r['Partidos Pendientes']) === 0).length,
        'Total Partidos Pendientes': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Pendientes'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en disponibilidadArbitros:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener disponibilidad de árbitros" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
