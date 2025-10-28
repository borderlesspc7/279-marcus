export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  nutritionistId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  createdAt: Date;
  updatedAt: Date;
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
  status?: "scheduled" | "completed" | "cancelled" | "no-show";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}
