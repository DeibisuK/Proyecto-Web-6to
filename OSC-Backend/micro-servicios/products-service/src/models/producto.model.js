import pool from "../config/db.js";

// javascript
export const findAllProductos = async () => {
  const sql = `
    SELECT
      p.*,
      CASE
        WHEN v_first.url_images IS NULL THEN NULL
        WHEN jsonb_typeof(v_first.url_images -> 0) = 'string' THEN v_first.url_images ->> 0
        ELSE (v_first.url_images -> 0) ->> 'url'
      END AS url_imagen,
      v_first.precio AS precio,
      v_first.previous_price AS precio_anterior,
      v_first.stock AS stock,
      v_first.id_variante AS id_primera_variante,
      v_first.sku AS sku_primera_variante
    FROM productos p
    LEFT JOIN LATERAL (
      SELECT id_variante, precio, previous_price, sku, stock, url_images
      FROM variantes_productos v
      WHERE v.id_producto = p.id_producto
      ORDER BY id_variante ASC
      LIMIT 1
    ) v_first ON TRUE
    ORDER BY p.id_producto;
  `;

  const result = await pool.query(sql);

  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM productos WHERE id_producto = $1",
    [id]
  );
  return result.rows[0];
};

export async function create(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Insert producto base
    const insertProductSQL = `
      INSERT INTO productos (nombre, descripcion, id_categoria, id_deporte, id_marca, es_nuevo)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id_producto;
    `;
    const r = await client.query(insertProductSQL, [
      payload.nombre,
      payload.descripcion || null,
      payload.id_categoria,
      payload.id_deporte,
      payload.id_marca,
      payload.es_nuevo ?? false,
    ]);
    const id_producto = r.rows[0].id_producto;

    // helper: si envías valores como objetos { id_opcion, valor }, crea/obtén id_valor
    const ensureValor = async (id_opcion, valor) => {
      const qSel = `SELECT id_valor FROM valores_opcion WHERE id_opcion = $1 AND LOWER(valor) = LOWER($2) LIMIT 1`;
      const sel = await client.query(qSel, [id_opcion, valor]);
      if (sel.rowCount) return sel.rows[0].id_valor;
      const qIns = `INSERT INTO valores_opcion (id_opcion, valor) VALUES ($1,$2) RETURNING id_valor`;
      const ins = await client.query(qIns, [id_opcion, valor]);
      return ins.rows[0].id_valor;
    };

    const insertedVariants = [];

    // 2) Insertar variantes y sus valores
    const insertVarSQL = `
      INSERT INTO variantes_productos (id_producto, sku, precio, stock, url_images)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id_variante, sku, precio, stock, url_images;
    `;
    const insertVarValorSQL = `
      INSERT INTO variante_valores (id_variante, id_valor)
      VALUES ($1,$2)
      ON CONFLICT DO NOTHING;
    `;

    for (const varPayload of payload.variantes || []) {
      const urlImagesJson = varPayload.url_images
        ? JSON.stringify(varPayload.url_images)
        : "[]";
      const v = await client.query(insertVarSQL, [
        id_producto,
        varPayload.sku,
        varPayload.precio,
        varPayload.stock,
        urlImagesJson,
      ]);
      const id_variante = v.rows[0].id_variante;

      // valores puede ser una mezcla: [id_valor, { id_opcion, valor }, ...]
      for (const val of varPayload.valores || []) {
        let id_valor_to_use;
        if (typeof val === "number") {
          id_valor_to_use = val;
          // validar existencia (opcional): lanzar error si no existe
          const chk = await client.query(
            "SELECT 1 FROM valores_opcion WHERE id_valor = $1",
            [id_valor_to_use]
          );
          if (!chk.rowCount)
            throw new Error(`id_valor ${id_valor_to_use} no existe`);
        } else if (
          val &&
          typeof val === "object" &&
          val.id_opcion &&
          val.valor
        ) {
          id_valor_to_use = await ensureValor(val.id_opcion, val.valor);
        } else {
          throw new Error(
            "Formato inválido en valores de variante. Usar id_valor o {id_opcion, valor}."
          );
        }
        await client.query(insertVarValorSQL, [id_variante, id_valor_to_use]);
      }

      insertedVariants.push({
        id_variante,
        sku: v.rows[0].sku,
        precio: Number(v.rows[0].precio),
        stock: v.rows[0].stock,
        url_images: v.rows[0].url_images,
      });
    }

    await client.query("COMMIT");

    return {
      id_producto,
      variantes: insertedVariants,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Obtener productos para card usando la view vw_productos_card
export const findAllProductosCard = async ({
  categoriaId = null,
  deporteId = null,
  marcaId = null,
  sort = null, // 'price_asc' | 'price_desc' | null
  limit = 24,
  offset = 0,
} = {}) => {
  const sql = `
    SELECT
      id_producto,
      nombre,
      descripcion,
      id_categoria,
      nombre_categoria,
      id_deporte,
      nombre_deporte,
      id_marca,
      nombre_marca,
      es_nuevo,
      precio,
      precio_anterior,
      stock,
      images
    FROM public.vw_productos_card
    WHERE (
      $1::int IS NULL
      OR id_categoria = $1::int
    )
      AND (
        $2::int IS NULL
        OR id_deporte = $2::int
      )
      AND (
        $3::int IS NULL
        OR id_marca = $3::int
      )
    ORDER BY
      CASE WHEN $4 = 'price_asc' THEN precio END ASC,
      CASE WHEN $4 = 'price_desc' THEN precio END DESC,
      id_producto ASC
    LIMIT $5 OFFSET $6;
  `;

  const params = [categoriaId, deporteId, marcaId, sort, limit, offset];
  const result = await pool.query(sql, params);
  return result.rows;
};
