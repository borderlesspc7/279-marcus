export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role?: "admin" | "user";
  phone?: string;
  defaultConsultationValue?: number; // Valor padrão de consulta em reais
  trialEndDate?: Date; // Data de término do período de trial (10 dias após cadastro)
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
