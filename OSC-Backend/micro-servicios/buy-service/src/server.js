import '../../../config/dotenv.js';
import app from './app.js';

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  // Buy service started
});
