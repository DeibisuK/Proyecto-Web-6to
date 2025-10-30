import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env raíz primero
dotenv.config({ path: path.join(__dirname, '../.env') });

// Cargar .env local (sobrescribe si hay duplicados)
dotenv.config();