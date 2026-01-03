import pool from '../config/db.js';

// Plantilla básica para equipos
export async function getReportData(option, filters = {}) {
  switch (option) {
    case 'listar-equipos':
      return await listarEquipos();
    case 'mas-activos':
      return await equiposMasActivos();
    case 'equipos-deporte':
      return await equiposPorDeporte();
    case 'equipos-torneos':
      return await equiposEnTorneos();
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
        e.id_equipo AS "ID",
        e.nombre_equipo AS "Equipo",
        d.nombre_deporte AS "Deporte",
        u.name_user AS "Capitán/Creador",
        COUNT(DISTINCT it.id_inscripcion) AS "Torneos Inscritos",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Jugados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' 
                            AND pt.resultado_local > pt.resultado_visitante 
                            AND pt.id_equipo_local = e.id_equipo THEN pt.id_partido
                            WHEN pt.estado_partido = 'finalizado' 
                            AND pt.resultado_visitante > pt.resultado_local 
                            AND pt.id_equipo_visitante = e.id_equipo THEN pt.id_partido
                       END) AS "Partidos Ganados",
        e.creado_en AS "Fecha Creación"
      FROM equipos e
      LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
      LEFT JOIN usuarios u ON e.firebase_uid = u.uid
      LEFT JOIN inscripciones_torneo it ON e.id_equipo = it.id_equipo
      LEFT JOIN partidos_torneo pt ON e.id_equipo IN (pt.id_equipo_local, pt.id_equipo_visitante)
      GROUP BY e.id_equipo, e.nombre_equipo, d.nombre_deporte, u.name_user, e.creado_en
      ORDER BY e.nombre_equipo
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Equipo", "Deporte", "Capitán/Creador", "Torneos Inscritos", "Partidos Jugados", "Partidos Ganados", "Fecha Creación"],
      rows: result.rows,
      summary: { 
        'Total de Equipos': result.rows.length,
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Jugados'] || 0), 0),
        'Total Torneos': result.rows.reduce((sum, r) => sum + parseInt(r['Torneos Inscritos'] || 0), 0)
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

async function equiposMasActivos() {
  try {
    const query = `
      SELECT 
        e.nombre_equipo AS "Equipo",
        d.nombre_deporte AS "Deporte",
        COUNT(DISTINCT it.id_torneo) AS "Torneos",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Jugados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Partidos Finalizados",
        -- Victorias
        COUNT(DISTINCT CASE 
          WHEN pt.estado_partido = 'finalizado' 
          AND ((pt.id_equipo_local = e.id_equipo AND pt.resultado_local > pt.resultado_visitante)
               OR (pt.id_equipo_visitante = e.id_equipo AND pt.resultado_visitante > pt.resultado_local))
          THEN pt.id_partido 
        END) AS "Victorias",
        -- Derrotas
        COUNT(DISTINCT CASE 
          WHEN pt.estado_partido = 'finalizado' 
          AND ((pt.id_equipo_local = e.id_equipo AND pt.resultado_local < pt.resultado_visitante)
               OR (pt.id_equipo_visitante = e.id_equipo AND pt.resultado_visitante < pt.resultado_local))
          THEN pt.id_partido 
        END) AS "Derrotas",
        -- Empates
        COUNT(DISTINCT CASE 
          WHEN pt.estado_partido = 'finalizado' 
          AND pt.resultado_local = pt.resultado_visitante
          THEN pt.id_partido 
        END) AS "Empates",
        ROUND(
          (COUNT(DISTINCT CASE 
            WHEN pt.estado_partido = 'finalizado' 
            AND ((pt.id_equipo_local = e.id_equipo AND pt.resultado_local > pt.resultado_visitante)
                 OR (pt.id_equipo_visitante = e.id_equipo AND pt.resultado_visitante > pt.resultado_local))
            THEN pt.id_partido 
          END) * 100.0) / 
          NULLIF(COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END), 0),
          2
        ) AS "% Victorias"
      FROM equipos e
      LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
      LEFT JOIN inscripciones_torneo it ON e.id_equipo = it.id_equipo
      LEFT JOIN partidos_torneo pt ON e.id_equipo IN (pt.id_equipo_local, pt.id_equipo_visitante)
      GROUP BY e.id_equipo, e.nombre_equipo, d.nombre_deporte
      HAVING COUNT(DISTINCT pt.id_partido) > 0
      ORDER BY COUNT(DISTINCT pt.id_partido) DESC, COUNT(DISTINCT it.id_torneo) DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Equipo", "Deporte", "Torneos", "Partidos Jugados", "Partidos Finalizados", "Victorias", "Derrotas", "Empates", "% Victorias"],
      rows: result.rows,
      summary: {
        'Equipos Activos': result.rows.length,
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Jugados'] || 0), 0),
        'Total Victorias': result.rows.reduce((sum, r) => sum + parseInt(r.Victorias || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en equiposMasActivos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener equipos más activos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function equiposPorDeporte() {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        COUNT(DISTINCT e.id_equipo) AS "Total Equipos",
        COUNT(DISTINCT it.id_torneo) AS "Torneos Activos",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Totales",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Partidos Finalizados",
        COUNT(DISTINCT CASE WHEN t.estado = 'en_curso' THEN t.id_torneo END) AS "Torneos en Curso"
      FROM deportes d
      LEFT JOIN equipos e ON d.id_deporte = e.id_deporte
      LEFT JOIN inscripciones_torneo it ON e.id_equipo = it.id_equipo
      LEFT JOIN torneos t ON it.id_torneo = t.id_torneo
      LEFT JOIN partidos_torneo pt ON e.id_equipo IN (pt.id_equipo_local, pt.id_equipo_visitante)
      GROUP BY d.id_deporte, d.nombre_deporte
      ORDER BY COUNT(DISTINCT e.id_equipo) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Total Equipos", "Torneos Activos", "Partidos Totales", "Partidos Finalizados", "Torneos en Curso"],
      rows: result.rows,
      summary: {
        'Total Deportes': result.rows.length,
        'Total Equipos': result.rows.reduce((sum, r) => sum + parseInt(r['Total Equipos'] || 0), 0),
        'Total Torneos': result.rows.reduce((sum, r) => sum + parseInt(r['Torneos Activos'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en equiposPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener equipos por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function equiposEnTorneos() {
  try {
    const query = `
      SELECT 
        e.nombre_equipo AS "Equipo",
        t.nombre AS "Torneo",
        d.nombre_deporte AS "Deporte",
        t.estado AS "Estado Torneo",
        it.estado AS "Estado Inscripción",
        it.fecha_inscripcion AS "Fecha Inscripción",
        -- Estadísticas del equipo en el torneo
        ct.partidos_jugados AS "Partidos",
        ct.partidos_ganados AS "Ganados",
        ct.partidos_empatados AS "Empates",
        ct.partidos_perdidos AS "Perdidos",
        ct.puntos_favor AS "Puntos A Favor",
        ct.puntos_contra AS "Puntos En Contra",
        ct.diferencia_puntos AS "Diferencia",
        ct.puntos_clasificacion AS "Puntos",
        ct.posicion AS "Posición"
      FROM inscripciones_torneo it
      INNER JOIN equipos e ON it.id_equipo = e.id_equipo
      INNER JOIN torneos t ON it.id_torneo = t.id_torneo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN clasificacion_torneo ct ON it.id_torneo = ct.id_torneo 
        AND it.id_equipo = ct.id_equipo
      WHERE it.aprobado = true
      ORDER BY t.fecha_inicio DESC, t.nombre, ct.posicion NULLS LAST
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Equipo", "Torneo", "Deporte", "Estado Torneo", "Estado Inscripción", "Fecha Inscripción", "Partidos", "Ganados", "Empates", "Perdidos", "Puntos A Favor", "Puntos En Contra", "Diferencia", "Puntos", "Posición"],
      rows: result.rows,
      summary: {
        'Total Inscripciones': result.rows.length,
        'Equipos Distintos': new Set(result.rows.map(r => r.Equipo)).size,
        'Torneos Distintos': new Set(result.rows.map(r => r.Torneo)).size
      }
    };
  } catch (error) {
    console.error('Error en equiposEnTorneos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener equipos en torneos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
