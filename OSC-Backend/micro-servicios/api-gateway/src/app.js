import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import compression from "compression";

const app = express();
const corsOptions = {
  origin: ["https://osc.dkun.dev", "http://localhost:4200"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-no-compression"], // Agregué x-no-compression por si acaso
  credentials: true // A veces necesario si usas cookies/tokens
};

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// 1. Aplicar CORS
app.use(cors(corsOptions));

// 2. IMPORTANTE: Manejar explícitamente las peticiones OPTIONS aquí
// Esto evita que el proxy intente manejar el preflight check
app.options('*', cors(corsOptions));

app.use(express.json());

// Verificar que las URLs existan antes de iniciar (para debugging)
if (!process.env.USER_SERVICE_URL) console.warn("⚠️ CUIDADO: USER_SERVICE_URL no está definida");

// Rutas de microservicios
app.use("/p", proxy(process.env.PRODUCT_SERVICE_URL || ""));
app.use("/u", proxy(process.env.USER_SERVICE_URL || ""));
app.use("/c", proxy(process.env.COURT_SERVICE_URL || ""));
app.use("/m", proxy(process.env.MATCH_SERVICE_URL || ""));
app.use("/b", proxy(process.env.BUY_SERVICE_URL || ""));
app.use("/i", proxy(process.env.CLOUDINARY_SERVICE_URL || ""));
app.use("/s", proxy(process.env.SUBSCRIPTION_SERVICE_URL || ""));
app.use("/n", proxy(process.env.NOTIFICATION_SERVICE_URL || ""));
app.use("/r", proxy(process.env.REPORT_SERVICE_URL || "http://localhost:3009"));

export default app;
