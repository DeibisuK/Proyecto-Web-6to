/**
 * Script para restaurar claims de rol perdidos
 * Ejecutar con: node restaurar-claims.js
 */

import firebaseAdmin from './src/config/firebase.js';

// Coloca aquí el UID de tu usuario
const UID_USUARIO = 'TU_UID_AQUI';

// Coloca aquí los claims que tenías antes
const CLAIMS_A_RESTAURAR = {
  role: 'Admin',
  id_rol: 1
};

async function restaurarClaims() {
  try {
    console.log('🔧 Restaurando claims...');
    
    // Obtener claims actuales
    const user = await firebaseAdmin.auth().getUser(UID_USUARIO);
    const currentClaims = user.customClaims || {};
    
    console.log('📋 Claims actuales:', currentClaims);
    
    // Combinar con los claims a restaurar
    const updatedClaims = {
      ...currentClaims,
      ...CLAIMS_A_RESTAURAR
    };
    
    // Actualizar claims
    await firebaseAdmin.auth().setCustomUserClaims(UID_USUARIO, updatedClaims);
    
    console.log('✅ Claims restaurados exitosamente:', updatedClaims);
    console.log('\n⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar para que los claims se apliquen.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al restaurar claims:', error);
    process.exit(1);
  }
}

restaurarClaims();
