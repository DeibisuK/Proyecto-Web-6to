import '../../../config/dotenv.js'
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // User service started
});
