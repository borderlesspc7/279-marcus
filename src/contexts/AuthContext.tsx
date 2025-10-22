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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(null);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.login(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as FirebaseError | string);
      setError(message);
      setLoading(false);
      setUser(null);
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

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
