// server.js
import '../../../config/dotenv.js'
import app from "./app.js";

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  // Cloudinary service started
});
