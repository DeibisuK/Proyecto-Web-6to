import '../../../config/dotenv.js';
import app from './app.js';

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🏟️  Court service running on port ${PORT}`);
});
