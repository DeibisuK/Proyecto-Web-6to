# 🔧 Guía de Restauración de Claims de Admin

## Problema
Cuando se implementó el sistema de suscripciones, los claims de Firebase se sobrescribieron, perdiendo el claim de `role: 'Admin'`.

## ✅ Solución Implementada
Ahora el sistema **preserva los claims existentes** (como `role` y `id_rol`) al actualizar los claims de suscripción.

---

## 🚀 Restaurar Claims de Admin

### Opción 1: Usando el Script de Restauración (Recomendado)

1. **Obtener tu UID de Firebase**:
   - Abre DevTools (F12) en el navegador
   - Ve a la consola y ejecuta:
   ```javascript
   const auth = getAuth();
   console.log('Mi UID:', auth.currentUser.uid);
   ```

2. **Editar el script**:
   - Abre: `OSC-Backend/micro-servicios/subscription-service/restaurar-claims.js`
   - Reemplaza `'TU_UID_AQUI'` con tu UID real
   - Los claims ya están configurados para Admin:
   ```javascript
   const CLAIMS_A_RESTAURAR = {
     role: 'Admin',
     id_rol: 1
   };
   ```

3. **Ejecutar el script**:
   ```bash
   cd OSC-Backend/micro-servicios/subscription-service
   node restaurar-claims.js
   ```

4. **Cerrar sesión y volver a iniciar**:
   - Cierra sesión en la aplicación
   - Vuelve a iniciar sesión
   - Los claims de Admin estarán restaurados ✅

---

### Opción 2: Usar el Endpoint de Re-sincronización

1. **Hacer una petición POST** (con Postman o desde la app):
   ```
   POST http://localhost:3000/s/client/re-sincronizar-claims
   Headers:
     Authorization: Bearer TU_TOKEN_DE_FIREBASE
   ```

2. **Cerrar sesión y volver a iniciar**

---

### Opción 3: Directamente desde Firebase Console

1. Ve a Firebase Console → Authentication
2. Encuentra tu usuario
3. Click en los 3 puntos → "Set custom user claims"
4. Agrega:
   ```json
   {
     "role": "Admin",
     "id_rol": 1,
     "premium": true
   }
   ```
5. Cierra sesión y vuelve a iniciar sesión

---

## 🛡️ Prevención Futura

Los cambios ya aplicados aseguran que esto **NO vuelva a pasar**:

### En `firebase-claims.service.js`:

**ANTES** (Sobrescribía todos los claims):
```javascript
const customClaims = {
  premium: hasSuscripcion,
  subscriptionUpdatedAt: new Date().toISOString()
};
await firebaseAdmin.auth().setCustomUserClaims(uid, customClaims);
```

**AHORA** (Preserva claims existentes):
```javascript
// Obtener claims existentes
const user = await firebaseAdmin.auth().getUser(uid);
const existingClaims = user.customClaims || {};

// Crear nuevos claims de suscripción
const subscriptionClaims = {
  premium: hasSuscripcion,
  subscriptionUpdatedAt: new Date().toISOString()
};

// COMBINAR claims existentes con los nuevos
const updatedClaims = {
  ...existingClaims,      // ← Preserva role, id_rol, etc.
  ...subscriptionClaims   // ← Agrega/actualiza solo suscripción
};

await firebaseAdmin.auth().setCustomUserClaims(uid, updatedClaims);
```

---

## 🔍 Verificar Claims Actuales

### En el navegador:
```javascript
const auth = getAuth();
auth.currentUser.getIdTokenResult().then(token => {
  console.log('Mis claims:', token.claims);
});
```

### Desde el backend:
```
GET http://localhost:3000/s/client/mis-claims
Headers:
  Authorization: Bearer TU_TOKEN
```

---

## 📋 Claims Esperados para un Admin con Suscripción

```json
{
  "role": "Admin",
  "id_rol": 1,
  "premium": true,
  "subscriptionType": "mensual",
  "subscriptionExpires": "2025-12-03T00:00:00.000Z",
  "subscriptionPlan": "Plan Premium Mensual",
  "subscriptionUpdatedAt": "2025-11-03T12:00:00.000Z"
}
```

---

## ⚠️ IMPORTANTE

Después de restaurar los claims, **SIEMPRE** debes:
1. ✅ Cerrar sesión
2. ✅ Volver a iniciar sesión
3. ✅ Los claims se aplicarán automáticamente

El token de Firebase se cachea, por eso es necesario cerrar sesión para obtener un nuevo token con los claims actualizados.

---

**Estado**: ✅ Problema identificado y solucionado  
**Acción Requerida**: Restaurar claims usando una de las 3 opciones  
**Prevención**: Implementada - No volverá a ocurrir
