import '../../../config/dotenv.js'
import app from './app.js';
import iniciarScheduler2FA from './schedulers/two-factor.scheduler.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ User Service corriendo en puerto ${PORT}`);
  
  // Iniciar scheduler de limpieza 2FA
  iniciarScheduler2FA();
});
