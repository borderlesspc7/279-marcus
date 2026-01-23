export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  nutritionistId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "no-show" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  requestedBy?: string; // UID do cliente que solicitou
  serviceId?: string; // ID do serviço selecionado
  serviceName?: string; // Nome do serviço (para manter histórico)
  servicePrice?: number; // Preço do serviço (para manter histórico)
}

export interface CreateAppointmentData {
  clientId: string;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
}

export interface UpdateAppointmentData {
  date?: Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: "pending" | "scheduled" | "completed" | "cancelled" | "no-show" | "rejected";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}
