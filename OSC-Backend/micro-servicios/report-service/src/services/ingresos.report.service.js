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
      r.estado_pago AS "Estado Pago",
      r.tipo_pago AS "Método Pago"
    FROM reservas r
    LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN usuarios u ON r.id_usuario = u.uid
    WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND r.estado_pago = 'pagado'
    
    UNION ALL
    
    -- Ingresos por Productos
    SELECT 
      p.fecha_pedido AS "Fecha",
      'Producto' AS "Tipo",
      'Pedido #' || p.id_pedido AS "Concepto",
      u.name_user AS "Usuario",
      p.total AS "Monto",
      p.estado_pedido AS "Estado Pago",
      'virtual' AS "Método Pago"
    FROM pedidos p
    LEFT JOIN usuarios u ON p.id_usuario = u.uid
    WHERE EXTRACT(YEAR FROM p.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND p.estado_pedido = 'Entregado'
    
    ORDER BY "Fecha" DESC
    LIMIT 500
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Fecha", "Tipo", "Concepto", "Usuario", "Monto", "Estado Pago", "Método Pago"],
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
      WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado_pago = 'pagado'
    ),
    ingresos_productos AS (
      SELECT COALESCE(SUM(total), 0) AS total
      FROM pedidos
      WHERE EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado_pedido = 'Entregado'
    )
    SELECT 
      'Reservas de Canchas' AS "Concepto",
      ir.total AS "Monto"
    FROM ingresos_reservas ir
    
    UNION ALL
    
    SELECT 
      'Venta de Productos' AS "Concepto",
      ip.total AS "Monto"
    FROM ingresos_productos ip
    
    UNION ALL
    
    SELECT 
      'TOTAL GENERAL' AS "Concepto",
      ir.total + ip.total AS "Monto"
    FROM ingresos_reservas ir, ingresos_productos ip
  `;
  
  const result = await pool.query(query);
  
  const totalMonto = result.rows.find(r => r.Concepto === 'TOTAL GENERAL')?.Monto || 0;
  
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
      COALESCE(ROUND(AVG(monto_total), 2), 0) AS "Ingreso Promedio"
    FROM reservas
    WHERE EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND estado_pago = 'pagado'
    
    UNION ALL
    
    SELECT 
      'Venta de Productos' AS "Categoría",
      COUNT(*) AS "Transacciones",
      COALESCE(SUM(total), 0) AS "Ingreso Total",
      COALESCE(ROUND(AVG(total), 2), 0) AS "Ingreso Promedio"
    FROM pedidos
    WHERE EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND estado_pedido = 'Entregado'
    
    ORDER BY "Ingreso Total" DESC
  `;
  
  const result = await pool.query(query);
  
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
    WITH ingresos_reservas_deporte AS (
      SELECT 
        d.nombre_deporte,
        COUNT(r.id_reserva) AS cantidad,
        COALESCE(SUM(r.monto_total), 0) AS ingresos
      FROM reservas r
      LEFT JOIN canchas c ON r.id_cancha = c.id_cancha
      LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
      WHERE EXTRACT(YEAR FROM r.fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND r.estado_pago = 'pagado'
      GROUP BY d.nombre_deporte
    ),
    ingresos_productos_deporte AS (
      SELECT 
        d.nombre_deporte,
        SUM(dp.cantidad) AS cantidad,
        COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) AS ingresos
      FROM detalle_pedidos dp
      JOIN variantes_productos vp ON dp.id_variante = vp.id_variante
      JOIN productos p ON vp.id_producto = p.id_producto
      JOIN deportes d ON p.id_deporte = d.id_deporte
      JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      WHERE EXTRACT(YEAR FROM ped.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND ped.estado_pedido = 'Entregado'
      GROUP BY d.nombre_deporte
    ),
    total_ingresos AS (
      SELECT 
        COALESCE((SELECT SUM(monto_total) FROM reservas 
                  WHERE estado_pago = 'pagado' 
                  AND EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) + 
        COALESCE((SELECT SUM(total) FROM pedidos 
                  WHERE estado_pedido = 'Entregado' 
                  AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) 
        AS total
    )
    SELECT 
      COALESCE(ir.nombre_deporte, ip.nombre_deporte) AS "Deporte",
      COALESCE(ir.cantidad, 0) AS "Reservas",
      COALESCE(ip.cantidad, 0) AS "Productos Vendidos",
      COALESCE(ir.ingresos, 0) + COALESCE(ip.ingresos, 0) AS "Ingresos Totales",
      ROUND(
        ((COALESCE(ir.ingresos, 0) + COALESCE(ip.ingresos, 0)) * 100.0) / 
        NULLIF((SELECT total FROM total_ingresos), 0),
        2
      ) AS "% del Total"
    FROM ingresos_reservas_deporte ir
    FULL OUTER JOIN ingresos_productos_deporte ip ON ir.nombre_deporte = ip.nombre_deporte
    ORDER BY (COALESCE(ir.ingresos, 0) + COALESCE(ip.ingresos, 0)) DESC
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Deporte", "Reservas", "Productos Vendidos", "Ingresos Totales", "% del Total"],
    rows: result.rows,
    summary: {
      'Total de Deportes': result.rows.length,
      'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingresos Totales']), 0).toFixed(2)}`
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
        COALESCE(
          (SELECT SUM(monto_total) FROM reservas 
           WHERE estado_pago = 'pagado' 
           AND EXTRACT(YEAR FROM fecha_reserva) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM fecha_reserva) = EXTRACT(MONTH FROM CURRENT_DATE)), 0
        ) + 
        COALESCE(
          (SELECT SUM(total) FROM pedidos 
           WHERE estado_pedido = 'Entregado'
           AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM fecha_pedido) = EXTRACT(MONTH FROM CURRENT_DATE)), 0
        ) AS total
    )
    SELECT 
      'Ingresos del Mes Actual' AS "Concepto",
      ROUND(ia.total, 2) AS "Valor"
    FROM ingresos_actuales ia
    
    UNION ALL
    
    SELECT 
      'Promedio Diario' AS "Concepto",
      ROUND(ia.total / NULLIF(dt.dias, 0), 2) AS "Valor"
    FROM ingresos_actuales ia, dias_transcurridos dt
    
    UNION ALL
    
    SELECT 
      'Proyección Fin de Mes (30 días)' AS "Concepto",
      ROUND((ia.total / NULLIF(dt.dias, 0)) * 30, 2) AS "Valor"
    FROM ingresos_actuales ia, dias_transcurridos dt
    
    UNION ALL
    
    SELECT 
      'Días Transcurridos' AS "Concepto",
      dt.dias AS "Valor"
    FROM dias_transcurridos dt
  `;
  
  const result = await pool.query(query);
  
  return {
    columns: ["Concepto", "Valor"],
    rows: result.rows,
    summary: {
      'Nota': 'Proyección basada en datos actuales del mes'
    }
  };
}
