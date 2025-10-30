import express from "express";
import cors from "cors";
import canchaCliente from "./api/client/cancha.client.routes.js";
import reservaCliente from "./api/client/reserva.client.routes.js";
import sedeCliente from "./api/client/sede.client.routes.js";
import canchaAdmin from "./api/admin/cancha.admin.routes.js";
import reservaAdmin from "./api/admin/reserva.admin.routes.js";
import sedeAdmin from "./api/admin/sede.admin.routes.js";
import authenticate from "../../../middleware/authenticate.js";
import authorizeRole from "../../../middleware/authorizeRole.js";

const app = express();

app.use(cors());
app.use(express.json());

//CLIENT ROUTES
app.use("/client", sedeCliente);
app.use("/client", canchaCliente);
app.use("/client", authorizeRole(2), reservaCliente);

//ADMIN ROUTES
app.use("/admin", authenticate(),authorizeRole(1), canchaAdmin);
app.use("/admin", authenticate(),authorizeRole(1), reservaAdmin);
app.use("/admin", authenticate(),authorizeRole(1), sedeAdmin);

export default app;
