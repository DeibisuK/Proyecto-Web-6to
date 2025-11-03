import '../../../config/dotenv.js';
import app from './app.js';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  // Products service started
});
