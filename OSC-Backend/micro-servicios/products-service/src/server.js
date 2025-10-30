import "./dotenv.js";
import app from "./app.js";

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Products service is running on http://localhost:${PORT}`);
});
