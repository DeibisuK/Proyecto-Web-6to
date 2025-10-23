import pool from "../config/db.js";

// javascript
export const findAllProducts = async () => {
  const result  = await pool.query("SELECT * FROM productos;");
  return result.rows;
};

// Nueva función para búsqueda con filtros múltiples
export const searchProducts = async ({
  categoriasIds = null,
  deportesIds = null,
  marcasIds = null,
  q = null,
  is_new = null,
  sort = null,
  limit = 24,
  offset = 0,
} = {}) => {
  // Construir condiciones WHERE dinámicamente
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filtro por múltiples categorías
  if (
    categoriasIds &&
    Array.isArray(categoriasIds) &&
    categoriasIds.length > 0
  ) {
    conditions.push(`id_categoria = ANY($${paramIndex}::int[])`);
    params.push(categoriasIds);
    paramIndex++;
  }

  // Filtro por múltiples deportes
  if (deportesIds && Array.isArray(deportesIds) && deportesIds.length > 0) {
    conditions.push(`id_deporte = ANY($${paramIndex}::int[])`);
    params.push(deportesIds);
    paramIndex++;
  }

  // Filtro por múltiples marcas
  if (marcasIds && Array.isArray(marcasIds) && marcasIds.length > 0) {
    conditions.push(`id_marca = ANY($${paramIndex}::int[])`);
    params.push(marcasIds);
    paramIndex++;
  }

  // Filtro por búsqueda de texto
  if (q) {
    conditions.push(
      `(LOWER(nombre) LIKE $${paramIndex} OR LOWER(descripcion) LIKE $${paramIndex})`
    );
    params.push(`%${q.toLowerCase()}%`);
    paramIndex++;
  }

  // Filtro por productos nuevos
  if (is_new !== null) {
    conditions.push(`es_nuevo = $${paramIndex}`);
    params.push(is_new);
    paramIndex++;
  }

  // Construir cláusula WHERE
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Construir ORDER BY
  let orderByClause = "ORDER BY id_producto ASC";
  if (sort) {
    switch (sort) {
      case "price_asc":
        orderByClause = "ORDER BY precio ASC, id_producto ASC";
        break;
      case "price_desc":
        orderByClause = "ORDER BY precio DESC, id_producto ASC";
        break;
      case "newest":
        orderByClause = "ORDER BY id_producto DESC";
        break;
      case "name_asc":
        orderByClause = "ORDER BY nombre ASC";
        break;
      case "name_desc":
        orderByClause = "ORDER BY nombre DESC";
        break;
    }
  }

  // Agregar LIMIT y OFFSET
  params.push(limit);
  const limitParam = `$${paramIndex}`;
  paramIndex++;

  params.push(offset);
  const offsetParam = `$${paramIndex}`;

  const sql = `
    SELECT
      id_producto AS id,
      nombre,
      descripcion AS caracteristicas,
      id_categoria,
      nombre_categoria,
      id_deporte,
      nombre_deporte AS deporte,
      id_marca,
      nombre_marca AS marca,
      es_nuevo,
      COALESCE(precio,0)::numeric(10,2) AS precio,
      precio_anterior::numeric(10,2) AS precio_anterior,
      stock,
      (images ->> 0) AS imagen,
      COUNT(*) OVER() AS total_count
    FROM public.vw_productos_card
    ${whereClause}
    ${orderByClause}
    LIMIT ${limitParam} OFFSET ${offsetParam};
  `;

  console.debug("[searchProducts] SQL:", sql);
  console.debug("[searchProducts] params:", params);

  const result = await pool.query(sql, params);

  const rows = result.rows.map((r) => {
    const { total_count, ...item } = r;
    return item;
  });

  const total = result.rows.length
    ? parseInt(result.rows[0].total_count, 10)
    : 0;
  const total_pages = Math.ceil(total / (limit || 1));

  return {
    page: Math.floor(offset / limit) + 1,
    per_page: limit,
    total,
    total_pages,
    data: rows,
  };
};

/**
 * Obtiene el detalle completo de un producto con todas sus variantes
 * @param {number} id_producto - ID del producto
 * @returns {Object} Producto con variantes, valores e imágenes
 */
export const getProductoDetalle = async (id_producto) => {
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
      variantes
    FROM 
      vw_producto_detalle
    WHERE 
      id_producto = $1;
  `;

  console.debug("[getProductoDetalle] Buscando producto ID:", id_producto);

  const result = await pool.query(sql, [id_producto]);

  if (result.rows.length === 0) {
    return null;
  }

  const producto = result.rows[0];
  
  // Parsear el JSON de variantes si es necesario
  if (typeof producto.variantes === 'string') {
    producto.variantes = JSON.parse(producto.variantes);
  }

  console.debug("[getProductoDetalle] Producto encontrado:", producto.nombre);
  console.debug(`[getProductoDetalle] Variantes: ${producto.variantes.length}`);

  return producto;
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
