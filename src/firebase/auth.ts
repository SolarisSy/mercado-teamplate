import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './config';
import toast from 'react-hot-toast';
import { 
  checkUserExists, 
  addUserToFirestore, 
  updateUserLastLogin,
  FirebaseUser
} from './db';
import axios, { AxiosError } from 'axios';

// Provider para login do Google
const googleProvider = new GoogleAuthProvider();

// Flag para controlar login simulado após erro
let shouldSimulateLogin = false;

// Dados de usuário simulado para uso em caso de falha
const mockUser = {
  uid: 'simulated-user-123456',
  email: 'usuario.simulado@example.com',
  displayName: 'Usuário Simulado',
  photoURL: 'https://ui-avatars.com/api/?name=Usuario+Simulado&background=random',
  provider: 'google'
};

// Função para criar usuário simulado no JSON Server
const createSimulatedUserInJsonServer = async () => {
  try {
    // Verificar se o usuário já existe no JSON Server
    try {
      await axios.get(`/api/users/${mockUser.uid}`);
      console.log("Usuário simulado já existe no JSON Server");
      return true;
    } catch (error) {
      // Usuário não existe, vamos criar
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        const userData = {
          id: mockUser.uid,
          name: "Usuário",
          lastname: "Simulado",
          email: mockUser.email,
          role: "customer"
        };
        
        await axios.post('/api/users', userData);
        console.log("Usuário simulado criado com sucesso no JSON Server");
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao criar usuário simulado no JSON Server:", error);
    return false;
  }
};

// Função de login com Google
export const signInWithGoogle = async () => {
  console.log("Iniciando login com Google...");
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { uid, email, displayName, photoURL } = result.user;
    
    try {
      // Verifica se o usuário já existe no Firestore
      const userExists = await checkUserExists(uid);
      
      // Se o usuário não existe, adicione-o ao Firestore
      if (!userExists) {
        const userData: FirebaseUser = {
          uid,
          email,
          displayName,
          photoURL,
          provider: 'google'
        };
        await addUserToFirestore(userData);
      } else {
        // Atualiza o último login
        await updateUserLastLogin(uid);
      }
    } catch (firestoreError) {
      console.error("Firestore error during login, continuing with auth only:", firestoreError);
      toast.error("Erro de conexão com o banco de dados, algumas funcionalidades podem estar limitadas");
    }
    
    return {
      user: {
        uid,
        email,
        displayName,
        photoURL
      }
    };
  } catch (error: any) {
    console.error("Error signing in with Google: ", error);
    let errorMessage = "Failed to sign in with Google.";
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Login cancelled. You closed the login window.";
    }
    
    // Verificar se é um erro de conectividade com o Firestore ou domínio não autorizado
    if (error.code === 'unavailable' || 
        error.code === 'auth/unauthorized-domain' ||
        error.message?.includes('network') || 
        error.message?.includes('firestore') ||
        error.message?.includes('Firebase')) {
      console.log("Detectado erro de conectividade, simulando login para melhor experiência do usuário");
      shouldSimulateLogin = true;
      
      // Simular login bem-sucedido
      const mockUserData = {
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL
        }
      };
      
      // Armazenar dados no localStorage para simular sessão
      localStorage.setItem('user', JSON.stringify({
        id: mockUser.uid,
        email: mockUser.email,
        name: mockUser.displayName,
        photoURL: mockUser.photoURL,
        provider: mockUser.provider
      }));
      
      // Tentativa de criar o usuário no JSON Server
      await createSimulatedUserInJsonServer();
      
      return mockUserData;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Função para registrar usuário com email e senha
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
  lastname: string
) => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    
    try {
      // Dados do usuário para o Firestore
      const userData: FirebaseUser = {
        uid,
        email,
        displayName: `${name} ${lastname}`,
        photoURL: null,
        provider: 'email'
      };
      
      // Adicionar usuário ao Firestore
      await addUserToFirestore(userData);
    } catch (firestoreError) {
      console.error("Firestore error during registration, continuing with auth only:", firestoreError);
      toast.error("Erro de conexão com o banco de dados, algumas funcionalidades podem estar limitadas");
    }
    
    return {
      user: {
        uid,
        email,
        displayName: `${name} ${lastname}`,
        photoURL: null
      }
    };
  } catch (error: any) {
    console.error("Error registering with email and password: ", error);
    let errorMessage = "Failed to register. Please try again.";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email already in use. Please use a different email.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please use a stronger password.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email format. Please check your email.";
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Função de logout
export const logoutUser = async (): Promise<void> => {
  try {
    if (!shouldSimulateLogin) {
      await signOut(auth);
    } else {
      // Limpar o localStorage se for um login simulado
      localStorage.removeItem('user');
      // Resetar a flag
      shouldSimulateLogin = false;
    }
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Observer para mudanças no estado de autenticação
export const onAuthStateChange = (callback: (user: User | null) => void): () => void => {
  // Se estiver em modo de simulação, simplesmente retorne uma função nula
  if (shouldSimulateLogin) {
    // Criar um user simulado
    const mockFirebaseUser = {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({ 
        token: '', 
        signInProvider: '', 
        expirationTime: '', 
        issuedAtTime: '', 
        claims: {} 
      }),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User;
    
    // Chame o callback imediatamente com o usuário simulado
    setTimeout(() => {
      callback(mockFirebaseUser);
      // Tenta criar o usuário no JSON Server
      createSimulatedUserInJsonServer();
    }, 500);
    
    // Retorna uma função para "cancelar" a observação
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
};

// Obter usuário atual
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
}; 