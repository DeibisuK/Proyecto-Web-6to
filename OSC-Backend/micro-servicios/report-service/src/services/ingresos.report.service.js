import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-ingresos':
      return await listarIngresos(year, month);
    case 'ingresos-totales':
      return await ingresosTotales(year, month);
    case 'ingresos-categoria':
      return await ingresosPorCategoria(year, month);
    case 'ingresos-deporte':
      return await ingresosPorDeporte(year, month);
    case 'proyeccion':
      return await proyeccionIngresos(year, month);
    default:
      throw new Error(`Opción no válida: ${option}`);
  }
}

async function listarIngresos(year, month) {
  const query = `
    -- Ingresos por Reservas
    SELECT 
      r.fecha_reserva AS "Fecha",
      'Reserva' AS "Tipo",
      c.nombre_cancha || ' - ' || s.nombre AS "Concepto",
      u.name_user AS "Usuario",
      r.monto_total AS "Monto",
      r.estado_pago AS "Estado Pago"
    FROM reservas r
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN usuarios u ON r.id_usuario = u.id_user
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Pagado'
    
    UNION ALL
    
    -- Ingresos por Productos
    SELECT 
      p.fecha_pedido AS "Fecha",
      'Producto' AS "Tipo",
      'Pedido #' || p.id_pedido AS "Concepto",
      u.name_user AS "Usuario",
      p.total AS "Monto",
      p.estado_pedido AS "Estado Pago"
    FROM pedidos p
    LEFT JOIN usuarios u ON p.id_usuario = u.id_user
    WHERE EXTRACT(YEAR FROM p.fecha_pedido) = $1
      AND EXTRACT(MONTH FROM p.fecha_pedido) = $2
      AND p.estado_pedido = 'Completado'
    
    ORDER BY "Fecha" DESC
    LIMIT 500
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Fecha", "Tipo", "Concepto", "Usuario", "Monto", "Estado Pago"],
    rows: result.rows,
    summary: {
      'Total de Transacciones': result.rows.length,
      'Monto Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Monto || 0), 0).toFixed(2)}`
    }
  };
}

async function ingresosTotales(year, month) {
  const query = `
    WITH ingresos_reservas AS (
      SELECT COALESCE(SUM(monto_total), 0) AS total
      FROM reservas
      WHERE EXTRACT(YEAR FROM fecha_reserva) = $1
        AND EXTRACT(MONTH FROM fecha_reserva) = $2
        AND estado_pago = 'Pagado'
    ),
    ingresos_productos AS (
      SELECT COALESCE(SUM(total), 0) AS total
      FROM pedidos
      WHERE EXTRACT(YEAR FROM fecha_pedido) = $1
        AND EXTRACT(MONTH FROM fecha_pedido) = $2
        AND estado_pedido = 'Completado'
    )
    SELECT 
      'Reservas' AS "Concepto",
      ir.total AS "Monto"
    FROM ingresos_reservas ir
    
    UNION ALL
    
    SELECT 
      'Productos' AS "Concepto",
      ip.total AS "Monto"
    FROM ingresos_productos ip
    
    UNION ALL
    
    SELECT 
      'TOTAL' AS "Concepto",
      ir.total + ip.total AS "Monto"
    FROM ingresos_reservas ir, ingresos_productos ip
  `;
  
  const result = await pool.query(query, [year, month]);
  
  const totalMonto = result.rows.find(r => r.Concepto === 'TOTAL')?.Monto || 0;
  
  return {
    columns: ["Concepto", "Monto"],
    rows: result.rows,
    summary: {
      'Total de Ingresos': `$${parseFloat(totalMonto).toFixed(2)}`
    }
  };
}

async function ingresosPorCategoria(year, month) {
  const query = `
    SELECT 
      'Reservas de Canchas' AS "Categoría",
      COUNT(*) AS "Transacciones",
      COALESCE(SUM(monto_total), 0) AS "Ingreso Total",
      COALESCE(AVG(monto_total), 0) AS "Ingreso Promedio"
    FROM reservas
    WHERE EXTRACT(YEAR FROM fecha_reserva) = $1
      AND EXTRACT(MONTH FROM fecha_reserva) = $2
      AND estado_pago = 'Pagado'
    
    UNION ALL
    
    SELECT 
      'Venta de Productos' AS "Categoría",
      COUNT(*) AS "Transacciones",
      COALESCE(SUM(total), 0) AS "Ingreso Total",
      COALESCE(AVG(total), 0) AS "Ingreso Promedio"
    FROM pedidos
    WHERE EXTRACT(YEAR FROM fecha_pedido) = $1
      AND EXTRACT(MONTH FROM fecha_pedido) = $2
      AND estado_pedido = 'Completado'
    
    ORDER BY "Ingreso Total" DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Categoría", "Transacciones", "Ingreso Total", "Ingreso Promedio"],
    rows: result.rows,
    summary: {
      'Total de Ingresos': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingreso Total']), 0).toFixed(2)}`
    }
  };
}

async function ingresosPorDeporte(year, month) {
  const query = `
    SELECT 
      d.nombre_deporte AS "Deporte",
      COUNT(r.id_reserva) AS "Reservas",
      COALESCE(SUM(r.monto_total), 0) AS "Ingresos",
      ROUND(
        (COALESCE(SUM(r.monto_total), 0) * 100.0) / 
        NULLIF((SELECT SUM(monto_total) FROM reservas WHERE estado_pago = 'Pagado'), 0),
        2
      ) AS "% del Total"
    FROM reservas r
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = $1
      AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
      AND r.estado_pago = 'Pagado'
    GROUP BY d.nombre_deporte
    ORDER BY SUM(r.monto_total) DESC
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Deporte", "Reservas", "Ingresos", "% del Total"],
    rows: result.rows,
    summary: {
      'Total de Deportes': result.rows.length,
      'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos), 0).toFixed(2)}`
    }
  };
}

async function proyeccionIngresos(year, month) {
  const query = `
    WITH dias_transcurridos AS (
      SELECT EXTRACT(DAY FROM CURRENT_DATE) AS dias
    ),
    ingresos_actuales AS (
      SELECT 
        COALESCE(SUM(r.monto_total), 0) + COALESCE(SUM(p.total), 0) AS total
      FROM reservas r
      FULL OUTER JOIN pedidos p ON 1=1
      WHERE (EXTRACT(YEAR FROM r.fecha_reserva) = $1 
             AND EXTRACT(MONTH FROM r.fecha_reserva) = $2
             AND r.estado_pago = 'Pagado')
         OR (EXTRACT(YEAR FROM p.fecha_pedido) = $1 
             AND EXTRACT(MONTH FROM p.fecha_pedido) = $2
             AND p.estado_pedido = 'Completado')
    )
    SELECT 
      'Ingresos Actuales' AS "Concepto",
      ia.total AS "Valor"
    FROM ingresos_actuales ia
    
    UNION ALL
    
    SELECT 
      'Promedio Diario' AS "Concepto",
      ia.total / NULLIF(dt.dias, 0) AS "Valor"
    FROM ingresos_actuales ia, dias_transcurridos dt
    
    UNION ALL
    
    SELECT 
      'Proyección Fin de Mes' AS "Concepto",
      (ia.total / NULLIF(dt.dias, 0)) * 30 AS "Valor"
    FROM ingresos_actuales ia, dias_transcurridos dt
  `;
  
  const result = await pool.query(query, [year, month]);
  
  return {
    columns: ["Concepto", "Valor"],
    rows: result.rows,
    summary: {
      'Nota': 'Proyección basada en datos actuales del mes'
    }
  };
}
