import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let firebaseAdmin = null;

// Leer el archivo de credenciales desde la variable de entorno
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
    console.warn('⚠️ Firebase Admin no está configurado: falta GOOGLE_APPLICATION_CREDENTIALS');
} else {
    try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        // Inicializar Firebase Admin si no existe ya una app
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin inicializado correctamente');
        }

        firebaseAdmin = admin;
    } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error.message);
    }
}

export default firebaseAdmin || { 
    auth: () => ({ 
        getUser: () => Promise.reject(new Error('Firebase not configured')),
        setCustomUserClaims: () => Promise.reject(new Error('Firebase not configured'))
    }) 
};
