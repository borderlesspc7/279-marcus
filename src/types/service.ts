export interface Service {
  id: string;
  nutritionistId: string;
  name: string; // ex: "Consulta Individual"
  duration: number; // duração em minutos
  price: number; // valor em reais
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  name: string;
  duration: number;
  price: number;
}

export interface UpdateServiceData {
  name?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}
