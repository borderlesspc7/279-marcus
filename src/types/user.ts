export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role?: "admin" | "nutritionist" | "user";
  phone?: string;
  defaultConsultationValue?: number; // Valor padrão de consulta em reais
  trialEndDate?: Date; // Data de término do período de trial (10 dias após cadastro)
  workStartTime?: string; // Horário de início do trabalho (formato HH:mm, ex: "08:00")
  workEndTime?: string; // Horário de término do trabalho (formato HH:mm, ex: "18:00")
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
  role?: "admin" | "nutritionist" | "user";
}
