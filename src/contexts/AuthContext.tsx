import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/user";
import type { ReactNode } from "react";
import type { FirebaseError } from "firebase/app";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
  reloadUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observar mudanças no estado de autenticação do Firebase
  // Isso mantém a sessão mesmo após refresh (F5)
  useEffect(() => {
    const unsubscribe = authService.observeAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup: desinscrever quando o componente for desmontado
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("🟢 AuthContext.login chamado com:", credentials.email);
      setLoading(true);
      setError(null);
      console.log("🟢 Chamando authService.login...");
      const user = await authService.login(credentials);
      console.log("🟢 authService.login retornou user:", user ? user.email : "null");
      setUser(user);
      setLoading(false);
      console.log("🟢 Login concluído no AuthContext!");
    } catch (error) {
      console.error("🔴 Erro no AuthContext.login:", error);
      const message = getFirebaseErrorMessage(error as FirebaseError | string);
      setError(message);
      setLoading(false);
      setUser(null);
      throw error; // Re-lançar para o componente poder tratar
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(credentials);
      // Não faz login automático - usuário precisa fazer login manualmente
      setUser(null);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as FirebaseError | string);
      setError(message);
      setLoading(false);
      setUser(null);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logOut();
      setUser(null);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as FirebaseError | string);
      setError(message);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const reloadUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logOut,
    clearError,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
