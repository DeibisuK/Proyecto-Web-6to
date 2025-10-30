import "./dotenv.js";
import app from "./app.js";

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Buy service is running on http://localhost:${PORT}`);
});
