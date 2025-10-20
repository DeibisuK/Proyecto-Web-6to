import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

const router = express.Router();
// Configurar multer para memoria (no guardar en disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

router.get("/test-conexion", async (req, res) => {
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
});

// Endpoint para subir imagen
router.post("/upload-imagen", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    // Datos adicionales del usuario (si los envías)
    const { userId, carpeta = "usuarios" } = req.body;

    // Subir a Cloudinary usando buffer
    const resultado = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          public_id: `user_${userId}_${Date.now()}`, // Nombre único
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
    console.error("Error al subir imagen:", error);
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
});

// Endpoint específico para subir imágenes de canchas (sin guardar en BD)
router.post("/upload-cancha", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    // Subir a Cloudinary usando buffer
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
    console.error("Error al subir imagen de cancha:", error);
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
});

// Endpoint específico para subir logos de equipos
router.post("/upload-equipo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    // Subir a Cloudinary usando buffer
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
    console.error("Error al subir logo de equipo:", error);
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
});

// Endpoint para eliminar imagen
router.delete("/delete-imagen/", async (req, res) => {
  try {
    const publicId = req.body.public_id; // Decodificar
    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Imagen eliminada" });
  } catch (error) {
    // ¡ESTE ES EL ERROR REAL!
    console.error("¡FALLÓ EL ENDPOINT DELETE!:", error);
    // Devuelve el error completo para verlo en la consola del navegador (si quieres)
    res.status(500).json({
      error: error.message,
      fullError: error, // Añade esto para más detalle
    });
  }
});

export default router;
