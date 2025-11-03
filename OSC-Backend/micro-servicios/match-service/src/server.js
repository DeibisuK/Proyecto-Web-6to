import '../../../config/dotenv.js'
import app from './app.js';

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  // Match service started
});
