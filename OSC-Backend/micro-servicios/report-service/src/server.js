import '../../../config/dotenv.js';
import app from './app.js';

const PORT = process.env.PORT || 4009;

app.listen(PORT, () => {
  console.log(`🚀 Report service running on port ${PORT}`);
});
