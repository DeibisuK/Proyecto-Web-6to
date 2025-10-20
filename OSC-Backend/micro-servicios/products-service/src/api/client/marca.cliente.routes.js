import { Router } from "express";
import * as controller from "../../controllers/marca.controller.js";

const router = Router();

router.get("/", controller.getAllMarcas);
router.get("/:id", controller.getMarcaById);

export default router;
