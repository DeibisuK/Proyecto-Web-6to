import { Router } from "express";
import * as controller from "../../controllers/marca.controller.js";

const router = Router();

router.get("/", controller.getAllMarcas);
router.get("/:id", controller.getMarcaById);
router.post("/", controller.createMarca);
router.put("/:id", controller.updateMarca);
router.delete("/:id", controller.deleteMarca);

export default router;
