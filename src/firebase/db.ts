import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { db } from './config';
import toast from 'react-hot-toast';

// Interface para usuários
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  createdAt?: any;
  lastLoginAt?: any;
}

// Verificar se um usuário existe no Firestore
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking if user exists:", error);
    // Em caso de erro de conexão, vamos assumir que o usuário não existe
    // mas permitir o fluxo continuar sem interrompê-lo
    return false;
  }
};

// Adicionar um novo usuário ao Firestore
export const addUserToFirestore = async (user: FirebaseUser): Promise<void> => {
  try {
    const { uid } = user;
    
    // Adicionar timestamp de criação
    const userData: FirebaseUser = {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', uid), userData);
    console.log("User added to Firestore successfully");
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    // Não lançamos o erro aqui para não interromper o fluxo de login
    // No entanto, notificamos o usuário sobre o problema
    toast.error("Falha ao salvar dados de perfil. Algumas funcionalidades podem estar limitadas.");
  }
};

// Atualizar o timestamp de login do usuário
export const updateUserLastLogin = async (uid: string): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    console.log("User last login updated successfully");
  } catch (error) {
    console.error("Error updating user last login:", error);
    // Não lançamos o erro aqui para não interromper o fluxo
  }
};

// Função para recuperar todos os usuários
// Esta função pode ser usada para debug ou administração
export const getAllUsers = async (): Promise<FirebaseUser[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as FirebaseUser);
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}; 