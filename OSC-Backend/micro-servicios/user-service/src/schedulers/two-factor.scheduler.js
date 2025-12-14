// ============================================
// SCHEDULER 2FA - Tareas programadas
// ============================================

import cron from 'node-cron';
import TwoFactorService from '../services/two-factor.service.js';

/**
 * Limpia códigos 2FA expirados cada hora
 * Cron: 0 * * * * (cada hora en el minuto 0)
 */
export function iniciarScheduler2FA() {
  console.log('🕐 Iniciando scheduler de limpieza 2FA...');

  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🧹 Ejecutando limpieza de códigos 2FA expirados...');
    const resultado = await TwoFactorService.limpiarCodigosExpirados();
    
    if (resultado.success) {
      console.log(`✅ Códigos limpiados: ${resultado.cantidad}`);
    } else {
      console.error('❌ Error en limpieza de códigos:', resultado.error);
    }
  });

  console.log('✅ Scheduler 2FA iniciado correctamente');
}

export default iniciarScheduler2FA;
