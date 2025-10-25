import express from "express";
import cors from "cors";
import arbitroAdmin from "./api/admin/arbitro.admin.routes.js";
import equipoAdmin from "./api/admin/equipo.admin.routes.js";
import equipoClient from "./api/client/equipo.client.routes.js";
import partidoAdmin from "./api/admin/partido.admin.routes.js";
import partidoClient from "./api/client/partido.client.routes.js";
import authenticate from "../../../middleware/authenticate.js";
import authorizeRole from "../../../middleware/authorizeRole.js";

const app = express();

app.use(cors());
app.use(express.json());

//CLIENT ROUTES
app.use("/client", equipoClient);
app.use("/client", partidoClient);

//ADMIN ROUTES
app.use("/admin", arbitroAdmin);
app.use("/admin", equipoAdmin);
app.use("/admin", partidoAdmin);

export default app;
