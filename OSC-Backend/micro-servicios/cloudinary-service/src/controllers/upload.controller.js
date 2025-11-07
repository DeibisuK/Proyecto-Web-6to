import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

export const testConexion = async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "Conexión exitosa a la base de datos" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error de conexión",
      details: error.message,
    });
  }
};

export const uploadImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const { userId, carpeta = "usuarios" } = req.body;

    const resultado = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          public_id: `user_${userId}_${Date.now()}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

export const uploadCancha = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const resultado = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "canchas",
          public_id: `cancha_${Date.now()}`,
          resource_type: "auto",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

export const uploadEquipo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const resultado = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "equipos",
          public_id: `equipo_${Date.now()}`,
          resource_type: "auto",
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

export const uploadProductos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const resultado = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "productos",
          public_id: `producto_${Date.now()}`,
          resource_type: "auto",
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

export const deleteImagen = async (req, res) => {
  try {
    const publicId = req.body.public_id;
    if (!publicId) {
      return res.status(400).json({ error: "public_id es requerido" });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Imagen eliminada" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      fullError: error,
    });
  }
};
