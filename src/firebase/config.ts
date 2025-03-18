// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Substitua com suas próprias credenciais do Firebase
// Para obter as credenciais:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou selecione um existente
// 3. Adicione um app web ao seu projeto
// 4. Copie as configurações do Firebase (firebaseConfig) fornecidas

// Configuração do Firebase
const firebaseConfig = {
  // ATENÇÃO: Estas são as chaves de configuração do Firebase
  // Você deve substituir pelas chaves do seu próprio projeto no console do Firebase
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNSr-vhOj0holP4Uq64KWRPr1zH223wCc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apoioentrega-2aeaf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apoioentrega-2aeaf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apoioentrega-2aeaf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "434152130535",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:434152130535:web:cfa734d0fe4fec301d1f42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 