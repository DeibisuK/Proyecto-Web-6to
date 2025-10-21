import '../../../config/dotenv.js'
import app from './app.js';

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Match service is running on http://localhost:${PORT}`);
});
