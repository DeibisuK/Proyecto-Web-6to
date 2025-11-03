import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let firebaseAdmin = null;

// Leer el archivo de credenciales desde la variable de entorno
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
    // Firebase Admin no estará disponible
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
    } catch (error) {
        // Error al inicializar Firebase Admin
    }
}

export default firebaseAdmin || { auth: () => ({ getUser: () => Promise.reject(new Error('Firebase not configured')) }) };
