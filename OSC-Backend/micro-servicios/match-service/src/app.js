import express from "express";
import cors from "cors";
import authenticate from "../../../middleware/authenticate.js";
import authorizeRole from "../../../middleware/authorizeRole.js";

// ===== RUTAS ADMIN =====
import arbitroAdmin from "./api/admin/arbitro.admin.routes.js";
import equipoAdmin from "./api/admin/equipo.admin.routes.js";
import partidoAdmin from "./api/admin/partido.admin.routes.js";
import jugadoresAdmin from "./api/admin/jugadores.admin.routes.js";
import clasificacionAdmin from "./api/admin/clasificacion.admin.routes.js";
import configuracionEventosAdmin from "./api/admin/configuracion_eventos.admin.routes.js";

// ===== RUTAS CLIENT =====
import equipoClient from "./api/client/equipo.client.routes.js";
import partidoClient from "./api/client/partido.client.routes.js";
import clasificacionClient from "./api/client/clasificacion.client.routes.js";
import eventosClient from "./api/client/eventos.client.routes.js";

// ===== RUTAS ÁRBITRO =====
import eventosArbitro from "./api/arbitro/eventos.arbitro.routes.js";
import alineacionesArbitro from "./api/arbitro/alineaciones.arbitro.routes.js";
import tiempoRealArbitro from "./api/arbitro/tiempo_real.arbitro.routes.js";
import panelArbitro from "./api/arbitro/panel.arbitro.routes.js"; // ✅ NUEVO

const app = express();

app.use(cors());
app.use(express.json());

// ===== CLIENT ROUTES (Públicas) =====
app.use("/client", equipoClient);
app.use("/client", partidoClient);
app.use("/client", clasificacionClient);
app.use("/client", eventosClient);

// ===== ADMIN ROUTES (Requieren autenticación y rol admin) =====
app.use("/admin", arbitroAdmin);
app.use("/admin", equipoAdmin);
app.use("/admin", partidoAdmin);
app.use("/admin", jugadoresAdmin);
app.use("/admin", clasificacionAdmin);
app.use("/admin", configuracionEventosAdmin);

// ===== ÁRBITRO ROUTES (Requieren autenticación y rol árbitro) =====
app.use("/arbitro", panelArbitro); // ✅ NUEVO - Panel principal del árbitro
app.use("/arbitro", eventosArbitro);
app.use("/arbitro", alineacionesArbitro);
app.use("/arbitro", tiempoRealArbitro);

export default app;
