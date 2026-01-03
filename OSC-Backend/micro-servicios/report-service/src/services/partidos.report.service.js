import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-partidos':
      return await listarPartidos(year, month);
    case 'partidos-estado':
      return await partidosPorEstado();
    case 'partidos-deporte':
      return await partidosPorDeporte();
    case 'partidos-torneo':
      return await partidosDeTorneo(filters);
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
        pt.id_partido AS "ID",
        t.nombre AS "Torneo",
        d.nombre_deporte AS "Deporte",
        pt.fecha_partido AS "Fecha",
        pt.hora_inicio AS "Hora",
        e_local.nombre_equipo AS "Equipo Local",
        e_visitante.nombre_equipo AS "Equipo Visitante",
        pt.resultado_local || ' - ' || pt.resultado_visitante AS "Resultado",
        pt.estado_partido AS "Estado",
        c.nombre_cancha AS "Cancha",
        s.nombre AS "Sede",
        u.name_user AS "Árbitro",
        pt.id_fase AS "ID Fase",
        pt.id_grupo AS "ID Grupo"
      FROM partidos_torneo pt
      LEFT JOIN torneos t ON pt.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN equipos e_local ON pt.id_equipo_local = e_local.id_equipo
      LEFT JOIN equipos e_visitante ON pt.id_equipo_visitante = e_visitante.id_equipo
      LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON pt.id_sede = s.id_sede
      LEFT JOIN usuarios u ON pt.id_arbitro = u.id_user
      WHERE pt.estado_partido NOT IN ('cancelado', 'suspendido')
    `;
    
    const params = [];
    
    if (year) {
      params.push(year);
      query += ` AND EXTRACT(YEAR FROM pt.fecha_partido) = $${params.length}`;
    }
    
    if (month) {
      params.push(month);
      query += ` AND EXTRACT(MONTH FROM pt.fecha_partido) = $${params.length}`;
    }
    
    query += ` ORDER BY pt.fecha_partido DESC, pt.hora_inicio DESC LIMIT 200`;
    
    const result = await pool.query(query, params);
    
    return {
      columns: ["ID", "Torneo", "Deporte", "Fecha", "Hora", "Equipo Local", "Equipo Visitante", "Resultado", "Estado", "Cancha", "Sede", "Árbitro", "ID Fase", "ID Grupo"],
      rows: result.rows,
      summary: { 
        'Total de Partidos': result.rows.length,
        'Finalizados': result.rows.filter(r => r.Estado === 'finalizado').length,
        'Pendientes': result.rows.filter(r => ['programado', 'por_jugar'].includes(r.Estado)).length
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

async function partidosPorEstado() {
  try {
    const query = `
      SELECT 
        pt.estado_partido AS "Estado",
        COUNT(*) AS "Total Partidos",
        COUNT(DISTINCT pt.id_torneo) AS "Torneos",
        COUNT(DISTINCT pt.id_cancha) AS "Canchas Utilizadas",
        COUNT(DISTINCT pt.id_arbitro) AS "Árbitros",
        MIN(pt.fecha_partido) AS "Fecha Más Antigua",
        MAX(pt.fecha_partido) AS "Fecha Más Reciente",
        ROUND(
          (COUNT(*) * 100.0) / 
          NULLIF((SELECT COUNT(*) FROM partidos_torneo), 0),
          2
        ) AS "% del Total"
      FROM partidos_torneo pt
      GROUP BY pt.estado_partido
      ORDER BY COUNT(*) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Estado", "Total Partidos", "Torneos", "Canchas Utilizadas", "Árbitros", "Fecha Más Antigua", "Fecha Más Reciente", "% del Total"],
      rows: result.rows,
      summary: { 
        'Total Estados': result.rows.length,
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r["Total Partidos"] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en partidosPorEstado:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener partidos por estado" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function partidosPorDeporte() {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        COUNT(DISTINCT pt.id_partido) AS "Total Partidos",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Finalizados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido IN ('programado', 'por_jugar') THEN pt.id_partido END) AS "Programados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'en_curso' THEN pt.id_partido END) AS "En Curso",
        COUNT(DISTINCT pt.id_torneo) AS "Torneos",
        COUNT(DISTINCT pt.id_cancha) AS "Canchas",
        COUNT(DISTINCT pt.id_arbitro) AS "Árbitros",
        ROUND(
          (COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) * 100.0) /
          NULLIF(COUNT(DISTINCT pt.id_partido), 0),
          2
        ) AS "% Completado"
      FROM deportes d
      LEFT JOIN torneos t ON d.id_deporte = t.id_deporte
      LEFT JOIN partidos_torneo pt ON t.id_torneo = pt.id_torneo
      WHERE pt.estado_partido NOT IN ('cancelado', 'suspendido')
      GROUP BY d.id_deporte, d.nombre_deporte
      ORDER BY COUNT(DISTINCT pt.id_partido) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Total Partidos", "Finalizados", "Programados", "En Curso", "Torneos", "Canchas", "Árbitros", "% Completado"],
      rows: result.rows,
      summary: { 
        'Total Deportes': result.rows.length,
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r["Total Partidos"] || 0), 0),
        'Total Finalizados': result.rows.reduce((sum, r) => sum + parseInt(r["Finalizados"] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en partidosPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener partidos por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function partidosDeTorneo(filters = {}) {
  try {
    let query = `
      SELECT 
        t.nombre AS "Torneo",
        d.nombre_deporte AS "Deporte",
        t.estado AS "Estado Torneo",
        pt.fecha_partido AS "Fecha",
        pt.hora_inicio AS "Hora",
        pt.id_fase AS "ID Fase",
        pt.id_grupo AS "ID Grupo",
        e_local.nombre_equipo AS "Local",
        pt.resultado_local AS "Goles Local",
        e_visitante.nombre_equipo AS "Visitante",
        pt.resultado_visitante AS "Goles Visitante",
        CASE 
          WHEN pt.estado_partido = 'finalizado' AND pt.resultado_local > pt.resultado_visitante 
          THEN e_local.nombre_equipo
          WHEN pt.estado_partido = 'finalizado' AND pt.resultado_visitante > pt.resultado_local 
          THEN e_visitante.nombre_equipo
          WHEN pt.estado_partido = 'finalizado' AND pt.resultado_local = pt.resultado_visitante 
          THEN 'Empate'
          ELSE 'Por definir'
        END AS "Ganador",
        pt.estado_partido AS "Estado",
        c.nombre_cancha AS "Cancha",
        s.nombre AS "Sede",
        u.name_user AS "Árbitro",
        pt.nota AS "Notas"
      FROM partidos_torneo pt
      LEFT JOIN torneos t ON pt.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN equipos e_local ON pt.id_equipo_local = e_local.id_equipo
      LEFT JOIN equipos e_visitante ON pt.id_equipo_visitante = e_visitante.id_equipo
      LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON pt.id_sede = s.id_sede
      LEFT JOIN usuarios u ON pt.id_arbitro = u.id_user
      WHERE 1=1
    `;
    
    const params = [];
    const { year, month, torneo } = filters;
    
    if (year) {
      params.push(year);
      query += ` AND EXTRACT(YEAR FROM pt.fecha_partido) = $${params.length}`;
    }
    
    if (month) {
      params.push(month);
      query += ` AND EXTRACT(MONTH FROM pt.fecha_partido) = $${params.length}`;
    }
    
    if (torneo) {
      params.push(torneo);
      query += ` AND pt.id_torneo = $${params.length}`;
    }
    
    query += ` ORDER BY t.nombre, pt.fecha_partido ASC, pt.hora_inicio ASC`;
    
    const result = await pool.query(query, params);
    
    return {
      columns: ["Torneo", "Deporte", "Estado Torneo", "Fecha", "Hora", "ID Fase", "ID Grupo", "Local", "Goles Local", "Visitante", "Goles Visitante", "Ganador", "Estado", "Cancha", "Sede", "Árbitro", "Notas"],
      rows: result.rows,
      summary: { 
        'Total Partidos': result.rows.length,
        'Finalizados': result.rows.filter(r => r.Estado === 'finalizado').length,
        'Empates': result.rows.filter(r => r.Ganador === 'Empate').length
      }
    };
  } catch (error) {
    console.error('Error en partidosDeTorneo:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener partidos de torneo" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
