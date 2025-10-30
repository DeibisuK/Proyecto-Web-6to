// server.js
import "./dotenv.js";
import app from "./app.js";

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
