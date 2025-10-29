import { Router } from "express";
import {
  getAllProductos,
  createProducto,
  getProductoDetalle,
  updateProducto,
  deleteProducto,
  postVariantes,
  getOpciones
} from "../../controllers/producto.controller.js";

const router = Router();

router.get("/", getAllProductos);
router.get("/opciones", getOpciones);
router.get("/:id", getProductoDetalle);
router.post("/", createProducto);
router.post("/:id/variantes", postVariantes);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;
