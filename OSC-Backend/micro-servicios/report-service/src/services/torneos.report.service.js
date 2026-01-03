import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  switch (option) {
    case 'listar-torneos':
      return await listarTorneos();
    case 'torneos-activos':
      return await torneosActivos();
    case 'torneos-deporte':
      return await torneosPorDeporte();
    case 'equipos-torneo':
      return await equiposPorTorneo();
    default:
      return {
        columns: ["Nota"],
        rows: [{ "Nota": "Reporte pendiente de implementación" }],
        summary: { 'Estado': 'En desarrollo' }
      };
  }
}

async function listarTorneos() {
  try {
    const query = `
      SELECT 
        t.id_torneo AS "ID",
        t.nombre AS "Torneo",
        d.nombre_deporte AS "Deporte",
        s.nombre AS "Sede",
        t.estado AS "Estado",
        t.tipo_torneo AS "Tipo",
        t.fecha_inicio AS "Inicio",
        t.fecha_fin AS "Fin",
        t.fecha_cierre_inscripcion AS "Cierre Inscripción",
        COUNT(DISTINCT it.id_equipo) AS "Equipos Inscritos",
        t.max_equipos AS "Máx Equipos",
        COUNT(DISTINCT pt.id_partido) AS "Partidos",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Finalizados",
        u_creador.name_user AS "Creado Por",
        u_arbitro.name_user AS "Árbitro Principal",
        t.creado_en AS "Fecha Creación"
      FROM torneos t
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN sedes s ON t.id_sede = s.id_sede
      LEFT JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
        AND it.aprobado = true
      LEFT JOIN partidos_torneo pt ON t.id_torneo = pt.id_torneo
      LEFT JOIN usuarios u_creador ON t.creado_por = u_creador.id_user
      LEFT JOIN usuarios u_arbitro ON t.id_arbitro = u_arbitro.id_user
      GROUP BY t.id_torneo, t.nombre, d.nombre_deporte, s.nombre, t.estado, t.tipo_torneo,
               t.fecha_inicio, t.fecha_fin, t.fecha_cierre_inscripcion, t.max_equipos,
               u_creador.name_user, u_arbitro.name_user, t.creado_en
      ORDER BY t.fecha_inicio DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Torneo", "Deporte", "Sede", "Estado", "Tipo", "Inicio", "Fin", "Cierre Inscripción", "Equipos Inscritos", "Máx Equipos", "Partidos", "Finalizados", "Creado Por", "Árbitro Principal", "Fecha Creación"],
      rows: result.rows,
      summary: {
        'Total Torneos': result.rows.length,
        'Torneos Activos': result.rows.filter(r => r.Estado === 'en_curso' || r.Estado === 'abierto').length,
        'Total Equipos': result.rows.reduce((sum, r) => sum + parseInt(r['Equipos Inscritos'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en listarTorneos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener torneos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function torneosActivos() {
  try {
    const query = `
      SELECT 
        t.id_torneo AS "ID",
        t.nombre AS "Torneo",
        d.nombre_deporte AS "Deporte",
        s.nombre AS "Sede",
        t.estado AS "Estado",
        t.fecha_inicio AS "Inicio",
        t.fecha_fin AS "Fin",
        COUNT(DISTINCT it.id_equipo) AS "Equipos",
        t.max_equipos AS "Máx",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Total",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) AS "Finalizados",
        COUNT(DISTINCT CASE WHEN pt.estado_partido IN ('programado', 'por_jugar') THEN pt.id_partido END) AS "Pendientes",
        COUNT(DISTINCT CASE WHEN pt.estado_partido = 'en_curso' THEN pt.id_partido END) AS "En Curso",
        ROUND(
          (COUNT(DISTINCT CASE WHEN pt.estado_partido = 'finalizado' THEN pt.id_partido END) * 100.0) /
          NULLIF(COUNT(DISTINCT pt.id_partido), 0),
          2
        ) AS "% Completado",
        u_arbitro.name_user AS "Árbitro"
      FROM torneos t
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN sedes s ON t.id_sede = s.id_sede
      LEFT JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
        AND it.aprobado = true
      LEFT JOIN partidos_torneo pt ON t.id_torneo = pt.id_torneo
      LEFT JOIN usuarios u_arbitro ON t.id_arbitro = u_arbitro.id_user
      WHERE t.estado IN ('abierto', 'en_curso')
      GROUP BY t.id_torneo, t.nombre, d.nombre_deporte, s.nombre, t.estado,
               t.fecha_inicio, t.fecha_fin, t.max_equipos, u_arbitro.name_user
      ORDER BY t.fecha_inicio DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Torneo", "Deporte", "Sede", "Estado", "Inicio", "Fin", "Equipos", "Máx", "Partidos Total", "Finalizados", "Pendientes", "En Curso", "% Completado", "Árbitro"],
      rows: result.rows,
      summary: {
        'Torneos Activos': result.rows.length,
        'Total Equipos': result.rows.reduce((sum, r) => sum + parseInt(r.Equipos || 0), 0),
        'Total Partidos': result.rows.reduce((sum, r) => sum + parseInt(r['Partidos Total'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en torneosActivos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener torneos activos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function torneosPorDeporte() {
  try {
    const query = `
      SELECT 
        d.nombre_deporte AS "Deporte",
        COUNT(DISTINCT t.id_torneo) AS "Total Torneos",
        COUNT(DISTINCT CASE WHEN t.estado = 'abierto' THEN t.id_torneo END) AS "Abiertos",
        COUNT(DISTINCT CASE WHEN t.estado = 'en_curso' THEN t.id_torneo END) AS "En Curso",
        COUNT(DISTINCT CASE WHEN t.estado = 'finalizado' THEN t.id_torneo END) AS "Finalizados",
        COUNT(DISTINCT it.id_equipo) AS "Equipos Totales",
        COUNT(DISTINCT pt.id_partido) AS "Partidos Totales",
        ROUND(
          AVG(equipos_por_torneo.cantidad),
          2
        ) AS "Promedio Equipos/Torneo"
      FROM deportes d
      LEFT JOIN torneos t ON d.id_deporte = t.id_deporte
      LEFT JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
        AND it.aprobado = true
      LEFT JOIN partidos_torneo pt ON t.id_torneo = pt.id_torneo
      LEFT JOIN LATERAL (
        SELECT COUNT(DISTINCT it2.id_equipo) as cantidad
        FROM inscripciones_torneo it2
        WHERE it2.id_torneo = t.id_torneo
          AND it2.aprobado = true
      ) equipos_por_torneo ON true
      GROUP BY d.id_deporte, d.nombre_deporte
      ORDER BY COUNT(DISTINCT t.id_torneo) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Deporte", "Total Torneos", "Abiertos", "En Curso", "Finalizados", "Equipos Totales", "Partidos Totales", "Promedio Equipos/Torneo"],
      rows: result.rows,
      summary: {
        'Total Deportes': result.rows.length,
        'Total Torneos': result.rows.reduce((sum, r) => sum + parseInt(r['Total Torneos'] || 0), 0),
        'Total Equipos': result.rows.reduce((sum, r) => sum + parseInt(r['Equipos Totales'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en torneosPorDeporte:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener torneos por deporte" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function equiposPorTorneo() {
  try {
    const query = `
      SELECT 
        t.nombre AS "Torneo",
        t.estado AS "Estado Torneo",
        d.nombre_deporte AS "Deporte",
        e.nombre_equipo AS "Equipo",
        it.estado AS "Estado Inscripción",
        it.fecha_inscripcion AS "Fecha Inscripción",
        -- Estadísticas
        COALESCE(ct.partidos_jugados, 0) AS "PJ",
        COALESCE(ct.partidos_ganados, 0) AS "G",
        COALESCE(ct.partidos_empatados, 0) AS "E",
        COALESCE(ct.partidos_perdidos, 0) AS "P",
        COALESCE(ct.puntos_clasificacion, 0) AS "Pts",
        COALESCE(ct.diferencia_puntos, 0) AS "Dif",
        COALESCE(ct.posicion, 0) AS "Pos"
      FROM torneos t
      INNER JOIN inscripciones_torneo it ON t.id_torneo = it.id_torneo
      INNER JOIN equipos e ON it.id_equipo = e.id_equipo
      LEFT JOIN deportes d ON t.id_deporte = d.id_deporte
      LEFT JOIN clasificacion_torneo ct ON t.id_torneo = ct.id_torneo 
        AND e.id_equipo = ct.id_equipo
      WHERE it.aprobado = true
      ORDER BY t.fecha_inicio DESC, t.nombre, ct.posicion NULLS LAST
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Torneo", "Estado Torneo", "Deporte", "Equipo", "Estado Inscripción", "Fecha Inscripción", "PJ", "G", "E", "P", "Pts", "Dif", "Pos"],
      rows: result.rows,
      summary: {
        'Total Inscripciones': result.rows.length,
        'Equipos Distintos': new Set(result.rows.map(r => r.Equipo)).size,
        'Torneos Distintos': new Set(result.rows.map(r => r.Torneo)).size
      }
    };
  } catch (error) {
    console.error('Error en equiposPorTorneo:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener equipos por torneo" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
