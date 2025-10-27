export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: "masculino" | "feminino" | "outro";
  createdAt: Date;
  updatedAt: Date;
  nutritionistId: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: "exame-sangue" | "bioimpedancia" | "outro";
  fileUrl: string;
  uploadedAt: Date;
}

export interface CreateClientData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: "masculino" | "feminino" | "outro";
}
