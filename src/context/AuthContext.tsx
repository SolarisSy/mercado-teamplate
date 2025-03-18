import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";
import toast from 'react-hot-toast';

// Definindo o tipo para o contexto de autenticação
type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
};

// Criando o contexto
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true
});

// Hook para uso do contexto
export const useAuth = () => useContext(AuthContext);

// Provider do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    try {
      // Observa mudanças no estado de autenticação
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
        setCurrentUser(user);
        setLoading(false);
        
        // Se houver um usuário autenticado
        if (user) {
          try {
            // Verifica se já existe um usuário no localStorage
            const storedUser = localStorage.getItem('user');
            
            // Se não existir ou for de um usuário diferente, atualiza
            if (!storedUser || JSON.parse(storedUser).id !== user.uid) {
              const userData = {
                id: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0],
                photoURL: user.photoURL,
                provider: 'google'
              };
              
              console.log("Updating localStorage with user data:", userData);
              localStorage.setItem('user', JSON.stringify(userData));
              store.dispatch(setLoginStatus(true));
            }
          } catch (error) {
            console.error("Error updating user data:", error);
            toast.error("Erro ao atualizar dados do usuário");
          }
        }
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
        toast.error("Erro ao verificar autenticação");
      });

      // Cleanup da subscription quando o componente for desmontado
      return () => {
        console.log("Cleaning up auth state listener");
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setLoading(false);
      toast.error("Erro ao configurar autenticação");
    }
  }, []);

  // Retorna o provider com o usuário atual e o estado de loading
  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 