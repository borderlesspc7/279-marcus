export interface User {
  uid: string;
  name: string;
  email: string;
  // ⚠️ NUNCA inclua password aqui! Senhas são gerenciadas pelo Firebase Authentication
  createdAt: Date;
  updatedAt: Date;
  role?: "admin" | "user";
  phone?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword?: string;
  phone?: string;
  role?: "admin" | "user";
}
