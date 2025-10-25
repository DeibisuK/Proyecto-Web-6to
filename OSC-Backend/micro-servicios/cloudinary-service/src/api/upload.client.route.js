import express from "express";
import multer from "multer";
import {
  testConexion,
  uploadImagen,
  uploadCancha,
  uploadEquipo,
  deleteImagen,
} from "../controllers/upload.controller.js";
import authenticate from "../../../../middleware/authenticate.js";

const router = express.Router();

// Configurar multer para memoria (no guardar en disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});


//router.post("/upload-imagen", upload.single("imagen"), uploadImagen);
//router.post("/upload-cancha", upload.single("imagen"), uploadCancha);
router.post("/upload-equipo", authenticate(), upload.single("logo"), uploadEquipo);
router.delete("/delete-imagen/", authenticate(), deleteImagen);

export default router;
