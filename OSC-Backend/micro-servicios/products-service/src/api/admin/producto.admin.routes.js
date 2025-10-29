import { Router } from "express";
import {
  getAllProductos,
  createProducto,
  getProductoDetalle,
  updateProducto,
  deleteProducto,
} from "../../controllers/producto.controller.js";

const router = Router();

router.get("/", getAllProductos);
router.get("/:id", getProductoDetalle);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;
