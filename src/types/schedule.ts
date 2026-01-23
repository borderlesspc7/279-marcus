export interface TimeSlot {
  id: string;
  startTime: string; // formato HH:mm
  endTime: string;   // formato HH:mm
}

export interface DaySchedule {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=domingo, 6=sábado
  isActive: boolean; // se está trabalhando neste dia
  slots: TimeSlot[]; // múltiplos intervalos de trabalho
}

export interface NutritionistSchedule {
  id: string;
  nutritionistId: string;
  daySchedules: DaySchedule[]; // 7 dias (domingo a sábado)
  updatedAt: Date;
}

export interface CreateScheduleData {
  daySchedules: DaySchedule[];
}
