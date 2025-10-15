import db from "../config/db.js";

export const findAll = async () => {
  const res = await db.query("SELECT * FROM usuarios");
  return res.rows;
};

export const findById = async (id) => {
  const res = await db.query("SELECT * FROM usuarios WHERE id_user = $1", [id]);
  return res.rows[0];
};

export const create = async (user) => {
  const { uid, nombre, email, id_rol } = user;
  try {
    const res = await db.query(
      "INSERT INTO usuarios (uid, name_user, email_user, id_rol) VALUES ($1, $2, $3, $4) RETURNING *",
      [uid, nombre, email, id_rol]
    );
    return res.rows[0];
  } catch (err) {
    // Log query context to help identify constraint/connection errors
    console.error('[users.model] create query failed:', {
      sql: 'INSERT INTO usuarios (uid, name_user, email_user, id_rol) VALUES ($1, $2, $3, $4) RETURNING *',
      params: [uid, nombre, email, id_rol],
      error: err && err.stack ? err.stack : err,
    });
    throw err;
  }
};

export const update = async (id, user) => {
  const { uid, nombre, email, id_rol } = user;
  try {
    const res = await db.query(
      "UPDATE usuarios SET name_user = $1, email_user = $2, id_rol = $3 WHERE uid = $4 RETURNING *",
      [nombre, email, id_rol, uid]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[users.model] update query failed:', {
      sql: 'UPDATE usuarios SET name_user = $1, email_user = $2, id_rol = $3 WHERE uid = $4 RETURNING *',
      params: [nombre, email, id_rol, uid],
      error: err && err.stack ? err.stack : err,
    });
    throw err;
  }
};

export const remove = async (id) => {
  const res = await db.query("DELETE FROM usuarios WHERE uid = $1", [id]);
  return res.rowCount > 0;
};
