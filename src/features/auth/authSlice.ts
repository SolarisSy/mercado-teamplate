import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define o tipo do estado inicial
interface AuthState {
  isLoggedIn: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    photoURL: string | null;
    provider: string;
  } | null;
}

// Verifica se existe um usuário no localStorage ao inicializar
const checkInitialAuthState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        isLoggedIn: true,
        user: {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email || 'usuario@example.com',
          photoURL: user.photoURL,
          provider: user.provider || 'google'
        }
      };
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
  }
  
  return {
    isLoggedIn: false,
    user: null
  };
};

// Estado inicial
const initialState: AuthState = checkInitialAuthState();

// Criar um slice para autenticação
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
      
      // Se o usuário não estiver logado, remover o usuário
      if (!action.payload) {
        state.user = null;
        localStorage.removeItem('user');
      } else if (!state.user) {
        // Se não houver usuário no estado, mas estiver logado, tentar buscar do localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            state.user = JSON.parse(storedUser);
          }
        } catch (error) {
          console.error('Error retrieving user from localStorage:', error);
        }
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      
      // Salvar o usuário no localStorage
      if (action.payload) {
        try {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving user to localStorage:', error);
        }
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

// Exportar ações
export const { setLoginStatus, setUser, logout } = authSlice.actions;

// Exportar o reducer
export default authSlice.reducer; 