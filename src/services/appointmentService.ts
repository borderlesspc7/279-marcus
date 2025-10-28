import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
} from "../types/appointment";

const APPOINTMENTS_COLLECTION = "appointments";

export const createAppointment = async (
  appointmentData: CreateAppointmentData,
  nutritionistId: string
): Promise<string> => {
  try {
    const hasConflict = await checkTimeConflict(
      nutritionistId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (hasConflict) {
      throw new Error("Já existe um agendamento neste horário");
    }

    const appointmentDoc = {
      clientId: appointmentData.clientId,
      clientName: appointmentData.clientName,
      nutritionistId,
      date: Timestamp.fromDate(appointmentData.date),
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      notes: appointmentData.notes || "",
      status: "scheduled",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, APPOINTMENTS_COLLECTION),
      appointmentDoc
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
};

export const getAppointmentsByNutritionist = async (
  nutritionistId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> => {
  try {
    let q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("date", "asc")
    );

    if (startDate) {
      q = query(q, where("date", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("date", "<=", Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    throw error;
  }
};

export const getAppointmentById = async (
  appointmentId: string
): Promise<Appointment | null> => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    throw error;
  }
};

export const getAppointmentsByClient = async (
  clientId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    throw error;
  }
};

export const updateAppointment = async (
  appointmentId: string,
  data: UpdateAppointmentData
): Promise<void> => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
};

export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
};

export const cancelAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    await updateAppointment(appointmentId, { status: "cancelled" });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    throw error;
  }
};

export const completeAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    await updateAppointment(appointmentId, { status: "completed" });
  } catch (error) {
    console.error("Erro ao completar agendamento:", error);
    throw error;
  }
};

export const checkTimeConflict = async (
  nutritionistId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay)),
      where("status", "==", "scheduled")
    );

    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      if (excludeAppointmentId && doc.id === excludeAppointmentId) {
        continue;
      }

      const appointment = doc.data();
      const existingStart = appointment.startTime;
      const existingEnd = appointment.endTime;

      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar conflito de horário:", error);
    throw error;
  }
};

export const getTodayAppointments = async (
  nutritionistId: string
): Promise<Appointment[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getAppointmentsByNutritionist(nutritionistId, today, tomorrow);
};

export const getUpcomingAppointments = async (
  nutritionistId: string,
  days: number = 7
): Promise<Appointment[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return getAppointmentsByNutritionist(nutritionistId, today, futureDate);
};
