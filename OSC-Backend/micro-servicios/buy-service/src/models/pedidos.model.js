import pool from "../config/db.js";

export const findAll = async () => {
  const result = await pool.query("SELECT * FROM pedidos");
  return result.rows;
};

export const findById = async (id) => {
  const query = `
        SELECT 
            p.id_pedido,
            p.id_usuario,
            p.uuid_factura,
            p.total,
            p.estado_pedido,
            p.fecha_pedido
        FROM pedidos p
        WHERE p.id_pedido = $1
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
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

export const updateStatus = async (id, estado_pedido) => {
  const result = await pool.query(
    "UPDATE pedidos SET estado_pedido = $1 WHERE id_pedido = $2 RETURNING *",
    [estado_pedido, id]
  );
  return result.rows[0];
};
