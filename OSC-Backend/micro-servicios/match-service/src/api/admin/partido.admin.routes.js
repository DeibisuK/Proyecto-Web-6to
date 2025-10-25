import { Router } from "express";
import {
  getAllPartidos,
  getPartidoById,
  createPartido,
  updatePartidoStatus,
  finishPartido,
  deletePartido,
} from "../../controllers/partido.controller.js";
import authenticate from "../../../../../middleware/authenticate.js";
import authorizeRole from "../../../../../middleware/authorizeRole.js";

const router = Router();

router.get("/partidos",authenticate(),authorizeRole(1), getAllPartidos);
router.get("/partidos/:id",authenticate(),authorizeRole(1), getPartidoById);
router.post("/partidos",authenticate(),authorizeRole(1), createPartido);
router.put("/partidos/:id/status",authenticate(),authorizeRole(1), updatePartidoStatus);
router.put("/partidos/:id/finish",authenticate(),authorizeRole(1), finishPartido);
router.delete("/partidos/:id",authenticate(),authorizeRole(1), deletePartido);

export default router;
