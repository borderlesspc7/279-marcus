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
}

export interface CreateAppointmentData {
  clientId: string;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
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
