import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  Auth,
  connectAuthEmulator,
  getAuth,
  initializeAuth
} from 'firebase/auth';
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from 'firebase/functions';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAbkeyGBEQ4PBmAvcSOF7dwJblEImV2vpc",
  authDomain: "fiap-tech-challenge-3-bytebank.firebaseapp.com",
  projectId: "fiap-tech-challenge-3-bytebank",
  storageBucket: "fiap-tech-challenge-3-bytebank.firebasestorage.app",
  messagingSenderId: "673832118783",
  appId: "1:673832118783:web:e5d5401ee8aaf2e0531fca",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
};

const isDevelopment =
  process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATOR === 'true' ||
  process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATOR === '1';

const functionsEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_HOST ?? '127.0.0.1';
const functionsEmulatorPort = parsePort(process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_PORT, 5001);

const authEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_HOST ?? '127.0.0.1';
const authEmulatorPort = parsePort(process.env.EXPO_PUBLIC_FIREBASE_AUTH_PORT, 9099);

// Inicializar Firebase
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Inicializar Auth com persistência AsyncStorage
  try {
    const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
    auth = initializeAuth(app, {
      persistence: reactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Se initializeAuth falhar (já inicializado), usar getAuth
    auth = getAuth(app);
  }
  
  functions = getFunctions(app);

  // Conectar ao emulador em desenvolvimento (silenciosamente)
  if (isDevelopment && auth && functions) {
    try {
      // Tentar conectar ao Auth Emulator
      connectAuthEmulator(auth, `http://${authEmulatorHost}:${authEmulatorPort}`, {
        disableWarnings: true,
      });

      // Tentar conectar ao Functions Emulator
      connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
      
      // Emulador conectado com sucesso (modo silencioso)
    } catch (emulatorError) {
      // Emulador não disponível - continuar em modo desenvolvimento (silencioso)
    }
  }
  
} catch (error) {
  console.warn('Erro ao inicializar Firebase:', error);
  app = null;
  auth = null;
  functions = null;
}

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase App não está configurado');
  }
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth não está configurado');
  }
  return auth;
};

export const getFirebaseFunctions = (): Functions => {
  if (!functions) {
    throw new Error('Firebase Functions não está configurado');
  }
  return functions;
};

export const isFirebaseAvailable = (): boolean => {
  return auth !== null;
};

// Exportar instâncias para compatibilidade
export { app, auth, functions };

