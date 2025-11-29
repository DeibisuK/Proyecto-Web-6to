import '../../../config/dotenv.js';
import app from './app.js';
import { iniciarSchedulerTorneos } from './schedulers/torneo.scheduler.js';

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => {
  console.log(`✅ Notification Service corriendo en http://localhost:${PORT}`);
  console.log(`🔔 Scheduler de notificaciones automáticas activo`);
  
  // Iniciar scheduler de torneos
  iniciarSchedulerTorneos();
});
