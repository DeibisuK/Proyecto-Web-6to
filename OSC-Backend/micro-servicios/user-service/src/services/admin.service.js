import * as adminModel from '../models/admin.model.js';
import firebaseAdmin from '../config/firebase.js';

/**
 * Obtiene todos los usuarios combinando datos de Firebase y la BD
 * @returns {Promise<Object>} Objeto con totales y lista de usuarios combinados
 */
export const getAllUsersCombined = async () => {
  try {
    // 1. Obtener usuarios de Firebase
    let firebaseUsers = [];
    try {
      if (firebaseAdmin && firebaseAdmin.auth) {
        let nextPageToken;
        do {
          const listResult = await firebaseAdmin.auth().listUsers(1000, nextPageToken);
          firebaseUsers.push(...listResult.users);
          nextPageToken = listResult.pageToken;
        } while (nextPageToken);
        console.log(`✅ Firebase: ${firebaseUsers.length} usuarios obtenidos`);
      } else {
        console.warn('⚠️ Firebase Admin no disponible');
      }
    } catch (firebaseError) {
      console.error('❌ Error obteniendo usuarios de Firebase:', firebaseError);
      // Continuar aunque Firebase falle
    }

    // 2. Obtener usuarios de la BD
    let dbUsers = [];
    try {
      dbUsers = await adminModel.getAllUsersFromDB();
      console.log(`✅ BD: ${dbUsers.length} usuarios obtenidos`);
    } catch (dbError) {
      console.error('❌ Error obteniendo usuarios de BD:', dbError);
      throw dbError; // Si falla la BD, no podemos continuar
    }

    // 3. Crear mapa de usuarios de BD por uid para fusionar
    const dbUsersByUid = {};
    dbUsers.forEach(dbUser => {
      if (dbUser.uid) {
        dbUsersByUid[dbUser.uid] = dbUser;
      }
    });

    // 4. Combinar usuarios de Firebase con datos de BD
    const combinedUsers = firebaseUsers.map(firebaseUser => {
      const dbUser = dbUsersByUid[firebaseUser.uid];
      
      return {
        // Datos de Firebase
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        disabled: firebaseUser.disabled,
        customClaims: firebaseUser.customClaims || {},
        providerData: firebaseUser.providerData,
        metadata: {
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime
        },
        
        // Datos de BD (si existen)
        id_user: dbUser?.id_user,
        nombre: dbUser?.nombre,
        apellido: dbUser?.apellido,
        id_rol: dbUser?.id_rol,
        rol_nombre: dbUser?.nombre_rol,
        
        // Indicador de fuente
        source: dbUser ? 'firebase+db' : 'firebase-only'
      };
    });

    // 5. Agregar usuarios que solo están en BD (sin cuenta Firebase)
    const dbOnlyUsers = dbUsers
      .filter(dbUser => !dbUser.uid)
      .map(dbUser => ({
        // No tiene uid de Firebase
        uid: null,
        email: dbUser.email,
        displayName: `${dbUser.nombre || ''} ${dbUser.apellido || ''}`.trim(),
        photoURL: null,
        emailVerified: false,
        disabled: false,
        customClaims: {},
        providerData: [],
        metadata: {
          creationTime: dbUser.fecha_registro || null,
          lastSignInTime: null
        },
        
        // Datos de BD
        id_user: dbUser.id_user,
        nombre: dbUser.nombre,
        apellido: dbUser.apellido,
        id_rol: dbUser.id_rol,
        rol_nombre: dbUser.nombre_rol,
        
        // Indicador de fuente
        source: 'db-only'
      }));

    // 6. Combinar todo
    const allUsers = [...combinedUsers, ...dbOnlyUsers];

    return {
      total: allUsers.length,
      firebaseCount: firebaseUsers.length,
      dbCount: dbUsers.length,
      users: allUsers
    };
  } catch (error) {
    console.error('[admin.service] Error in getAllUsersCombined:', error);
    throw error;
  }
};

/**
 * Asigna un rol a un usuario y sincroniza con Firebase Custom Claims
 * @param {string} uid - Firebase UID del usuario
 * @param {number} id_rol - ID del rol a asignar
 * @returns {Promise<Object>} Resultado de la operación
 */
export const assignRole = async (uid, id_rol) => {
  try {
    // 1. Actualizar rol en la BD
    const updatedUser = await adminModel.updateUserRole(uid, id_rol);
    
    if (!updatedUser) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    console.log(`✅ Rol actualizado en BD para usuario ${uid}: id_rol=${id_rol}`);

    // 2. Obtener información del rol
    let roleName = String(id_rol);
    let claimsSynced = false;
    let claimWarning = null;

    try {
      const roleInfo = await adminModel.getRoleById(id_rol);
      if (roleInfo && roleInfo.nombre_rol) {
        roleName = roleInfo.nombre_rol;
        console.log(`✅ Rol obtenido: ${roleName} (ID: ${id_rol})`);
      }
    } catch (roleError) {
      console.warn('⚠️ No se pudo obtener nombre del rol:', roleError.message);
    }

    // 3. Sincronizar con Firebase Custom Claims
    try {
      if (firebaseAdmin && firebaseAdmin.auth) {
        await firebaseAdmin.auth().setCustomUserClaims(uid, {
          role: roleName,
          id_rol: Number(id_rol)
        });
        claimsSynced = true;
        console.log(`✅ Custom claims actualizados en Firebase para ${uid}`);
      } else {
        claimWarning = 'Firebase Admin no disponible';
        console.warn('⚠️', claimWarning);
      }
    } catch (claimError) {
      claimWarning = `Error al sincronizar claims: ${claimError.message}`;
      console.error('❌', claimWarning);
    }

    return {
      success: true,
      uid,
      updated: updatedUser,
      claimsSynced,
      claimWarning
    };
  } catch (error) {
    console.error('[admin.service] Error in assignRole:', error);
    throw error;
  }
};
