import { Router } from "express";
import {
  getAllProductos,
  createProducto,
  getProductoDetalle,
  updateProducto,
  deleteProducto,
  postVariantes,
  updateVariante,
  deleteVariante,
  getOpciones
} from "../../controllers/producto.controller.js";

const router = Router();

router.get("/", getAllProductos);
router.get("/opciones", getOpciones);
router.get("/:id", getProductoDetalle);
router.post("/", createProducto);
router.post("/:id/variantes", postVariantes);
router.put("/:id", updateProducto);
router.put("/:id_producto/variantes/:id_variante", updateVariante);
router.delete("/:id", deleteProducto);
router.delete("/:id_producto/variantes/:id_variante", deleteVariante);

export default router;
