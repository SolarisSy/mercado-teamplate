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
import customFetch from '../axios/custom';

// Sempre usar modo de login local para ambiente de produção
// Esta abordagem garante que o aplicativo funcione mesmo sem Firebase
const ALWAYS_USE_LOCAL_AUTH = true;

// Provider para login do Google
const googleProvider = new GoogleAuthProvider();

// Dados do usuário padrão
const DEFAULT_USER = {
  uid: 'local-user-123456',
  email: 'usuario.local@example.com',
  displayName: 'Usuário Local',
  photoURL: 'https://ui-avatars.com/api/?name=Usuario+Local&background=random',
  provider: 'local'
};

// Função para criar usuário no JSON Server
const createLocalUser = async () => {
  try {
    // Verificar se o usuário já existe no JSON Server
    try {
      const response = await customFetch.get(`/users/${DEFAULT_USER.uid}`);
      console.log("Usuário local já existe no banco de dados");
      return response.data;
    } catch (error) {
      // Usuário não existe, vamos criar
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        const userData = {
          id: DEFAULT_USER.uid,
          name: "Usuário",
          lastname: "Local",
          email: DEFAULT_USER.email,
          role: "customer",
          password: "localuser", // Senha padrão para login tradicional
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const response = await customFetch.post('/users', userData);
        console.log("Usuário local criado com sucesso no banco de dados");
        return response.data;
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao gerenciar usuário local:", error);
    // Retornar objeto básico em caso de falha
    return {
      id: DEFAULT_USER.uid,
      name: "Usuário",
      lastname: "Local",
      email: DEFAULT_USER.email,
      role: "customer"
    };
  }
};

// Tipos para as respostas de autenticação
interface AuthResponse {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
}

// Login com Provedor Local
export const loginWithLocalProvider = async (): Promise<AuthResponse> => {
  try {
    console.log("Iniciando login com provedor local...");
    
    // Buscar ou criar o usuário local
    const localUser = await createLocalUser();
    
    // Salvar no localStorage
    localStorage.setItem('user', JSON.stringify({
      id: localUser.id,
      name: localUser.name,
      email: localUser.email,
      photoURL: DEFAULT_USER.photoURL,
      provider: DEFAULT_USER.provider
    }));
    
    return {
      user: {
        uid: localUser.id,
        email: localUser.email,
        displayName: `${localUser.name} ${localUser.lastname || ''}`,
        photoURL: DEFAULT_USER.photoURL
      }
    };
  } catch (error) {
    console.error("Erro no login local:", error);
    toast.error("Ocorreu um erro no login. Tente novamente.");
    throw error;
  }
};

// Função de login com Google - redirecionada para login local se ALWAYS_USE_LOCAL_AUTH for true
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  console.log("Iniciando login com Google...");
  
  // Se estiver configurado para sempre usar autenticação local
  if (ALWAYS_USE_LOCAL_AUTH) {
    console.log("Redirecionando para autenticação local");
    return loginWithLocalProvider();
  }
  
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
    console.error("Erro no login com Google:", error);
    toast.error("Ocorreu um erro no login com Google. Usando login local.");
    
    // Em caso de erro, usar o provedor local
    return loginWithLocalProvider();
  }
};

// Função para registrar usuário com email e senha
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
  lastname: string
): Promise<AuthResponse> => {
  // Se estiver configurado para sempre usar autenticação local
  if (ALWAYS_USE_LOCAL_AUTH) {
    try {
      // Criar usuário diretamente no JSON Server
      const userData = {
        id: `local-${Date.now()}`,
        name,
        lastname,
        email,
        password,
        role: "customer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await customFetch.post('/users', userData);
      console.log("Usuário registrado com sucesso no banco de dados local");
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        provider: 'email'
      }));
      
      return {
        user: {
          uid: userData.id,
          email: userData.email,
          displayName: `${name} ${lastname}`,
          photoURL: null
        }
      };
    } catch (error) {
      console.error("Erro ao registrar usuário local:", error);
      toast.error("Ocorreu um erro no registro. Tente novamente.");
      throw error;
    }
  }
  
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
    
    // Se houver erro no Firebase, tentar registro local
    if (ALWAYS_USE_LOCAL_AUTH) {
      return registerWithEmailAndPassword(email, password, name, lastname);
    }
    
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
    // Se não estiver usando autenticação local, fazer logout no Firebase
    if (!ALWAYS_USE_LOCAL_AUTH) {
      await signOut(auth);
    }
    
    // Sempre limpar o localStorage
    localStorage.removeItem('user');
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Observer para mudanças no estado de autenticação
export const onAuthStateChange = (callback: (user: User | null) => void): () => void => {
  // Se estiver usando autenticação local, simular o estado do usuário
  if (ALWAYS_USE_LOCAL_AUTH) {
    setTimeout(() => {
      // Verificar se existe um usuário no localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Criar um user simulado baseado nos dados do localStorage
        const userData = JSON.parse(storedUser);
        const mockFirebaseUser = {
          uid: userData.id,
          email: userData.email,
          displayName: userData.name,
          photoURL: userData.photoURL,
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
        
        callback(mockFirebaseUser);
      } else {
        callback(null);
      }
    }, 300);
    
    // Retorna uma função para "cancelar" a observação
    return () => {};
  }
  
  // Usar o observer padrão do Firebase se não estiver usando autenticação local
  return onAuthStateChanged(auth, callback);
};

// Obter usuário atual
export const getCurrentUser = (): User | null => {
  if (ALWAYS_USE_LOCAL_AUTH) {
    // Verificar se existe um usuário no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Criar um user simulado baseado nos dados do localStorage
      const userData = JSON.parse(storedUser);
      return {
        uid: userData.id,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photoURL,
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
    }
    return null;
  }
  
  return auth.currentUser;
}; 