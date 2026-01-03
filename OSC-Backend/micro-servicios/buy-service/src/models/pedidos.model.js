import pool from "../config/db.js";

export const findAll = async () => {
  const result = await pool.query("SELECT * FROM pedidos");
  return result.rows;
};

// Para admin: Listar todos los pedidos con información del usuario y productos
export const findAllWithDetails = async () => {
  const query = `
    SELECT 
      p.id_pedido,
      p.id_usuario,
      p.uuid_factura,
      p.total,
      p.estado_pedido,
      p.fecha_pedido,
      u.name_user as nombre_usuario,
      u.email_user as email_usuario,
      -- Detalles como JSON array
      COALESCE(
        json_agg(
          json_build_object(
            'id_detalle', dp.id_detalle,
            'id_variante', dp.id_variante,
            'sku', v.sku,
            'cantidad', dp.cantidad,
            'precio_unitario', dp.precio_venta,
            'subtotal', dp.cantidad * dp.precio_venta,
            'nombre_producto', pr.nombre,
            'imagen_producto', CASE 
              WHEN v.url_images IS NOT NULL AND jsonb_array_length(v.url_images) > 0 
              THEN v.url_images->0->>'url'
              ELSE NULL
            END
          ) ORDER BY dp.id_detalle
        ) FILTER (WHERE dp.id_detalle IS NOT NULL),
        '[]'::json
      ) as items,
      COUNT(dp.id_detalle) as total_items
    FROM pedidos p
    LEFT JOIN usuarios u ON p.id_usuario = u.uid
    LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN variantes_productos v ON dp.id_variante = v.id_variante
    LEFT JOIN productos pr ON v.id_producto = pr.id_producto
    GROUP BY p.id_pedido, p.id_usuario, p.uuid_factura, p.total, p.estado_pedido, p.fecha_pedido, u.name_user, u.email_user
    ORDER BY p.fecha_pedido DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const findById = async (id) => {
  console.log('🗄️ [MODEL findById] id:', id, 'tipo:', typeof id);
  
  // Obtener un cliente del pool y ejecutar DISCARD ALL antes de la query
  const client = await pool.connect();
  try {
    // Descartar prepared statements cacheados
    await client.query('DISCARD ALL');
    
    const query = `
        SELECT 
            p.id_pedido,
            p.id_usuario::TEXT as id_usuario,
            p.uuid_factura,
            p.total,
            p.estado_pedido,
            p.fecha_pedido
        FROM pedidos p
        WHERE p.id_pedido = $1
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const findByUserId = async (id_usuario) => {
  const query = `
        SELECT 
            p.id_pedido,
            p.id_usuario,
            p.uuid_factura as factura,
            p.total,
            p.estado_pedido,
            p.fecha_pedido as created_at,
            -- Agregar detalles como JSON array
            COALESCE(
                json_agg(
                    json_build_object(
                        'id_detalle', dp.id_detalle,
                        'id_variante', dp.id_variante,
                        'sku', v.sku,
                        'cantidad', dp.cantidad,
                        'precio_unitario', dp.precio_venta,
                        'subtotal', dp.cantidad * dp.precio_venta,
                        'nombre_producto', pr.nombre,
                        'imagen_producto', v.url_images->0->>'url',
                        'color', (
                            SELECT vo.valor 
                            FROM variante_valores vv 
                            JOIN valores_opcion vo ON vv.id_valor = vo.id_valor
                            JOIN opciones_productos op ON vo.id_opcion = op.id_opcion
                            WHERE vv.id_variante = v.id_variante AND op.nombre = 'Color'
                            LIMIT 1
                        ),
                        'talla', (
                            SELECT vo.valor 
                            FROM variante_valores vv 
                            JOIN valores_opcion vo ON vv.id_valor = vo.id_valor
                            JOIN opciones_productos op ON vo.id_opcion = op.id_opcion
                            WHERE vv.id_variante = v.id_variante AND op.nombre = 'Talla'
                            LIMIT 1
                        )
                    ) ORDER BY dp.id_detalle
                ) FILTER (WHERE dp.id_detalle IS NOT NULL),
                '[]'::json
            ) as items
        FROM pedidos p
        LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
        LEFT JOIN variantes_productos v ON dp.id_variante = v.id_variante
        LEFT JOIN productos pr ON v.id_producto = pr.id_producto
        WHERE p.id_usuario = $1
        GROUP BY p.id_pedido
        ORDER BY p.fecha_pedido DESC
    `;
  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};

export const create = async (pedido) => {
  const { id_usuario, total, estado_pedido, uuid_factura } = pedido;
  const result = await pool.query(
    "INSERT INTO pedidos (id_usuario, total, estado_pedido, uuid_factura) VALUES ($1, $2, $3, $4) RETURNING *",
    [id_usuario, total, estado_pedido, uuid_factura]
  );
  return result.rows[0];
};

// Estadísticas de ventas para admin
export const getVentasStats = async () => {
  const query = `
    SELECT 
      COUNT(DISTINCT p.id_pedido) as total_pedidos,
      COUNT(DISTINCT CASE WHEN DATE(p.fecha_pedido) = CURRENT_DATE THEN p.id_pedido END) as pedidos_hoy,
      COUNT(DISTINCT CASE WHEN p.estado_pedido = 'Pendiente' THEN p.id_pedido END) as pendientes,
      COUNT(DISTINCT CASE WHEN p.estado_pedido = 'Entregado' THEN p.id_pedido END) as completados,
      COALESCE(SUM(CASE WHEN DATE(p.fecha_pedido) = CURRENT_DATE THEN p.total ELSE 0 END), 0) as ventas_hoy,
      COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM p.fecha_pedido) = EXTRACT(MONTH FROM CURRENT_DATE) 
                        AND EXTRACT(YEAR FROM p.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE) 
                   THEN p.total ELSE 0 END), 0) as ventas_mes,
      COALESCE(SUM(p.total), 0) as ventas_totales
    FROM pedidos p
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

export const updateStatus = async (id, estado_pedido) => {
  console.log('🗄️ [MODEL updateStatus] id:', id, 'tipo:', typeof id);
  console.log('🗄️ [MODEL updateStatus] estado_pedido:', estado_pedido);
  
  // Obtener un cliente del pool y ejecutar DISCARD ALL antes de la query
  const client = await pool.connect();
  try {
    // Descartar prepared statements cacheados
    await client.query('DISCARD ALL');
    
    // Cast explícito de id_usuario a TEXT en el RETURNING
    const result = await client.query(
      "UPDATE pedidos SET estado_pedido = $1 WHERE id_pedido = $2 RETURNING id_pedido, id_usuario::TEXT as id_usuario, total, estado_pedido, fecha_pedido, uuid_factura",
      [estado_pedido, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};
