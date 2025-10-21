import { Router } from "express";
import {
  getAllPartidos,
  getPartidoById,
  createPartido,
  updatePartidoStatus,
  finishPartido,
  deletePartido,
} from "../../controllers/partido.controller.js";

const router = Router();

router.get("/partidos", getAllPartidos);
router.get("/partidos/:id", getPartidoById);
router.post("/partidos", createPartido);
router.put("/partidos/:id/status", updatePartidoStatus);
router.put("/partidos/:id/finish", finishPartido);
router.delete("/partidos/:id", deletePartido);

export default router;
