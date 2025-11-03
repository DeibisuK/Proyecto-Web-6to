import pool from "../config/db.js";

export const findAll = async () => {
  const result = await pool.query("SELECT * FROM detalle_pedidos");
  return result.rows;
};

export const findByOrderId = async (id_pedido) => {
  const query = `
        SELECT 
            dp.id_detalle,
            dp.id_pedido,
            dp.id_variante,
            dp.cantidad,
            dp.precio_venta as precio_unitario,
            (dp.cantidad * dp.precio_venta) as subtotal,
            vp.sku,
            vp.url_images->0->>'url' as imagen_url,
            pr.nombre as nombre_producto,
            (
                SELECT vo.valor 
                FROM variante_valores vv 
                JOIN valores_opcion vo ON vv.id_valor = vo.id_valor
                JOIN opciones_productos op ON vo.id_opcion = op.id_opcion
                WHERE vv.id_variante = vp.id_variante AND op.nombre = 'Color'
                LIMIT 1
            ) as color,
            (
                SELECT vo.valor 
                FROM variante_valores vv 
                JOIN valores_opcion vo ON vv.id_valor = vo.id_valor
                JOIN opciones_productos op ON vo.id_opcion = op.id_opcion
                WHERE vv.id_variante = vp.id_variante AND op.nombre = 'Talla'
                LIMIT 1
            ) as talla
        FROM detalle_pedidos dp
        JOIN variantes_productos vp ON dp.id_variante = vp.id_variante
        JOIN productos pr ON vp.id_producto = pr.id_producto
        WHERE dp.id_pedido = $1
        ORDER BY dp.id_detalle
    `;
  const result = await pool.query(query, [id_pedido]);
  return result.rows;
};

export const create = async (detalle) => {
  const { id_pedido, id_variante, cantidad, precio_venta } = detalle;
  const result = await pool.query(
    "INSERT INTO detalle_pedidos (id_pedido, id_variante, cantidad, precio_venta) VALUES ($1, $2, $3, $4) RETURNING *",
    [id_pedido, id_variante, cantidad, precio_venta]
  );
  return result.rows[0];
};

// Crear múltiples detalles de pedido en una transacción
export const createBatch = async (detalles) => {
  const values = detalles
    .map((d, index) => {
      const offset = index * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    })
    .join(", ");

  const params = detalles.flatMap((d) => [
    d.id_pedido,
    d.id_variante,
    d.cantidad,
    d.precio_venta,
  ]);

  const result = await pool.query(
    `INSERT INTO detalle_pedidos (id_pedido, id_variante, cantidad, precio_venta) 
         VALUES ${values} RETURNING *`,
    params
  );
  return result.rows;
};
