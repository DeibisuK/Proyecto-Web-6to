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
  const query = `
    SELECT 
      u.name_user AS "Nombre Completo",
      u.email_user AS "Email",
      u.estado AS "Estado",
      u.fecha_registro::DATE AS "Fecha de Registro"
    FROM usuarios u
    WHERE u.id_rol = 3
    ORDER BY u.name_user
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Nombre Completo", "Email", "Estado", "Fecha de Registro"],
    rows: result.rows,
    summary: {
      'Total de Árbitros': result.rows.length,
      'Árbitros Activos': result.rows.filter(r => r.Estado === 'Activo').length
    }
  };
}

async function arbitrosMasPartidos(year, month) {
  const query = `
    SELECT 
      u.name_user AS "Árbitro",
      COUNT(p.id_partido) AS "Total Partidos",
      SUM(CASE WHEN p.estado_partido = 'Finalizado' THEN 1 ELSE 0 END) AS "Completados",
      SUM(CASE WHEN p.estado_partido = 'Cancelado' THEN 1 ELSE 0 END) AS "Cancelados"
    FROM usuarios u
    INNER JOIN partidos_torneo p ON u.id_user = p.id_arbitro
      AND EXTRACT(YEAR FROM p.fecha_partido) = $1
      AND EXTRACT(MONTH FROM p.fecha_partido) = $2
    WHERE u.id_rol = 3
    GROUP BY u.id_user, u.name_user
    ORDER BY COUNT(p.id_partido) DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Árbitro", "Total Partidos", "Completados", "Cancelados"],
    rows: result.rows,
    summary: {
      'Total de Árbitros Activos': result.rows.length,
      'Partidos Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Partidos']), 0)
    }
  };
}

async function arbitrosPorDeporte() {
  const query = `
    SELECT 
      d.nombre_deporte AS "Deporte",
      COUNT(DISTINCT p.id_arbitro) AS "Número de Árbitros"
    FROM deportes d
    INNER JOIN torneos t ON d.id_deporte = t.id_deporte
    INNER JOIN partidos_torneo p ON t.id_torneo = p.id_torneo
    INNER JOIN usuarios u ON p.id_arbitro = u.id_user AND u.id_rol = 3
    GROUP BY d.nombre_deporte
    ORDER BY COUNT(DISTINCT p.id_arbitro) DESC
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Deporte", "Número de Árbitros"],
    rows: result.rows,
    summary: {
      'Total de Deportes': result.rows.length
    }
  };
}

async function disponibilidadArbitros() {
  const query = `
    SELECT 
      u.name_user AS "Árbitro",
      u.email_user AS "Email",
      u.estado AS "Estado"
    FROM usuarios u
    WHERE u.id_rol = 3 AND u.estado = 'Activo'
    ORDER BY u.name_user
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Árbitro", "Email", "Estado"],
    rows: result.rows,
    summary: {
      'Árbitros Disponibles': result.rows.length
    }
  };
}
