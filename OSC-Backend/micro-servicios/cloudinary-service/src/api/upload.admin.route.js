import express from "express";
import multer from "multer";
import {
  testConexion,
  uploadImagen,
  uploadCancha,
  uploadEquipo,
  deleteImagen,
} from "../controllers/upload.controller.js";

const router = express.Router();

// Configurar multer para memoria (no guardar en disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

router.get("/test-conexion", testConexion);
//router.post("/upload-imagen", upload.single("imagen"), uploadImagen);
router.post("/upload-cancha", upload.single("imagen"), uploadCancha);
router.post("/upload-equipo", upload.single("logo"), uploadEquipo);
router.delete("/delete-imagen/", deleteImagen);

export default router;
