import "../../../config/dotenv.js";

import app from "./app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // API Gateway started
});
