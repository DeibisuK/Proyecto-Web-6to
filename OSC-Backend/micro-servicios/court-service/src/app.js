import express from "express";
import cors from "cors";
import canchaCliente from "./api/client/cancha.client.routes.js";
import reservaCliente from "./api/client/reserva.client.routes.js";
import sedeCliente from "./api/client/sede.client.routes.js";
import torneoCliente from "./api/client/torneo.client.routes.js";
import canchaAdmin from "./api/admin/cancha.admin.routes.js";
import reservaAdmin from "./api/admin/reserva.admin.routes.js";
import sedeAdmin from "./api/admin/sede.admin.routes.js";
import torneoAdmin from "./api/admin/torneo.admin.routes.js";
import partidoAdmin from "./api/admin/partido.admin.routes.js";
import ratingRoutes from "./api/rating.routes.js";
import authenticate from "../../../middleware/authenticate.js";
import authorizeRole from "../../../middleware/authorizeRole.js";

const app = express();

app.use(cors());
app.use(express.json());

//CLIENT ROUTES
app.use("/client", sedeCliente);
app.use("/client", canchaCliente);
app.use("/client", authenticate(), torneoCliente);
app.use("/client", authenticate(), authorizeRole(2), reservaCliente);

// RATINGS ROUTES (públicas para lectura, autenticadas para escritura)
app.use("/ratings", ratingRoutes);

//ADMIN ROUTES
app.use("/admin", authenticate(), authorizeRole(1), canchaAdmin);
app.use("/admin", authenticate(), authorizeRole(1), reservaAdmin);
app.use("/admin", authenticate(), authorizeRole(1), sedeAdmin);
app.use("/admin", authenticate(), authorizeRole(1), torneoAdmin);
app.use("/admin/partidos", authenticate(), authorizeRole(1), partidoAdmin);

export default app;
