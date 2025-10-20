import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let firebaseAdmin = null;

// Leer el archivo de credenciales desde la variable de entorno
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS no está definida. Firebase Admin no estará disponible.');
} else {
    try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        // Inicializar Firebase Admin
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        firebaseAdmin = admin;
        console.log('Firebase Admin SDK inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error.message);
    }
}

export default firebaseAdmin || { auth: () => ({ getUser: () => Promise.reject(new Error('Firebase not configured')) }) };
