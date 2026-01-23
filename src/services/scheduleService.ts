import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { NutritionistSchedule, DaySchedule, CreateScheduleData } from "../types/schedule";

const SCHEDULES_COLLECTION = "nutritionistSchedules";

/**
 * Retorna configuração padrão de agenda (8h-18h, segunda a sexta)
 */
export const getDefaultSchedule = (): DaySchedule[] => {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday: weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    isActive: weekday >= 1 && weekday <= 5, // Segunda a sexta ativas por padrão
    slots: weekday >= 1 && weekday <= 5 ? [
      {
        id: `${weekday}-slot-1`,
        startTime: "08:00",
        endTime: "18:00",
      },
    ] : [],
  }));
};

/**
 * Criar ou atualizar configuração de agenda
 */
export const createOrUpdateSchedule = async (
  nutritionistId: string,
  scheduleData: CreateScheduleData
): Promise<NutritionistSchedule> => {
  try {
    // Usar o nutritionistId como ID do documento para facilitar buscas
    const scheduleRef = doc(db, SCHEDULES_COLLECTION, nutritionistId);

    const scheduleDoc = {
      nutritionistId,
      daySchedules: scheduleData.daySchedules,
      updatedAt: Timestamp.now(),
    };

    await setDoc(scheduleRef, scheduleDoc, { merge: true });

    // Retornar o documento atualizado
    const updatedDoc = await getDoc(scheduleRef);
    const data = updatedDoc.data();

    return {
      id: updatedDoc.id,
      nutritionistId: data!.nutritionistId,
      daySchedules: data!.daySchedules,
      updatedAt: data!.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Erro ao salvar configuração de agenda:", error);
    throw error;
  }
};

/**
 * Buscar configuração de agenda de um nutricionista
 */
export const getScheduleByNutritionist = async (
  nutritionistId: string
): Promise<NutritionistSchedule | null> => {
  try {
    // Buscar diretamente pelo ID do documento (que é o nutritionistId)
    const scheduleRef = doc(db, SCHEDULES_COLLECTION, nutritionistId);
    const docSnap = await getDoc(scheduleRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        nutritionistId: data.nutritionistId,
        daySchedules: data.daySchedules,
        updatedAt: data.updatedAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar configuração de agenda:", error);
    throw error;
  }
};

/**
 * Buscar ou criar configuração padrão se não existir
 */
export const getOrCreateSchedule = async (
  nutritionistId: string
): Promise<NutritionistSchedule> => {
  try {
    const existingSchedule = await getScheduleByNutritionist(nutritionistId);

    if (existingSchedule) {
      return existingSchedule;
    }

    // Criar configuração padrão
    const defaultSchedule = getDefaultSchedule();
    return await createOrUpdateSchedule(nutritionistId, {
      daySchedules: defaultSchedule,
    });
  } catch (error) {
    console.error("Erro ao buscar ou criar configuração:", error);
    throw error;
  }
};

/**
 * Calcular horários mínimo e máximo de trabalho (para uso no calendário)
 */
export const getMinMaxWorkingHours = (
  schedule: NutritionistSchedule
): { minHour: number; maxHour: number } => {
  let minHour = 8;
  let maxHour = 18;

  schedule.daySchedules.forEach((day) => {
    if (day.isActive && day.slots.length > 0) {
      day.slots.forEach((slot) => {
        const [startHour] = slot.startTime.split(":").map(Number);
        const [endHour] = slot.endTime.split(":").map(Number);

        if (startHour < minHour) minHour = startHour;
        if (endHour > maxHour) maxHour = endHour;
      });
    }
  });

  return { minHour, maxHour };
};

/**
 * Verificar se um horário está disponível em um dia específico
 */
export const isTimeSlotAvailable = (
  schedule: NutritionistSchedule,
  weekday: number,
  time: string
): boolean => {
  const daySchedule = schedule.daySchedules.find((d) => d.weekday === weekday);

  if (!daySchedule || !daySchedule.isActive) {
    return false;
  }

  const [hour, minute] = time.split(":").map(Number);
  const timeInMinutes = hour * 60 + minute;

  return daySchedule.slots.some((slot) => {
    const [startHour, startMinute] = slot.startTime.split(":").map(Number);
    const [endHour, endMinute] = slot.endTime.split(":").map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  });
};
