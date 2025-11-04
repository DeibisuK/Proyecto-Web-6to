import '../../../config/dotenv.js';
import app from './app.js';

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`🚀 Subscription Service ejecutándose en puerto ${PORT}`);
});
