import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";

const app = express();
const corsOptions = {
  origin: "https://osc.dkun.dev", // Permitir solo a tu frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
};

// Aplicar el middleware
app.use(cors(corsOptions));
app.use(express.json());

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
