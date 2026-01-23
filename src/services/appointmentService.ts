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
import {
  createIncome,
  checkIfIncomeExistsForAppointment,
} from "./financialService";
import type { User } from "../types/user";

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
      serviceId: appointmentData.serviceId || null,
      serviceName: appointmentData.serviceName || null,
      servicePrice: appointmentData.servicePrice || null,
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
    // Buscar agendamento atual para verificar mudança de status
    const currentAppointment = await getAppointmentById(appointmentId);
    
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(docRef, updateData);

    // Se o status mudou para "completed", criar receita automaticamente
    if (
      data.status === "completed" &&
      currentAppointment &&
      currentAppointment.status !== "completed"
    ) {
      try {
        // Verificar se já existe receita para esta consulta
        const incomeExists = await checkIfIncomeExistsForAppointment(
          appointmentId
        );

        if (!incomeExists) {
          // Buscar valor padrão de consulta do perfil do nutricionista
          let consultationValue = 200; // Valor padrão fallback
          try {
            const userDoc = await getDoc(
              doc(db, "users", currentAppointment.nutritionistId)
            );
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              if (userData.defaultConsultationValue) {
                consultationValue = userData.defaultConsultationValue;
              }
            }
          } catch (error) {
            console.warn(
              "Erro ao buscar valor padrão de consulta, usando valor padrão:",
              error
            );
          }
          
          await createIncome({
            nutritionistId: currentAppointment.nutritionistId,
            amount: consultationValue,
            description: `Consulta com ${currentAppointment.clientName}`,
            date: currentAppointment.date,
            appointmentId: appointmentId,
            clientId: currentAppointment.clientId,
            clientName: currentAppointment.clientName,
          });

          console.log(
            `[updateAppointment] Receita criada automaticamente para consulta ${appointmentId} (valor: R$ ${consultationValue})`
          );
        }
      } catch (error) {
        // Não falhar a atualização do agendamento se houver erro ao criar receita
        console.error(
          "Erro ao criar receita automaticamente:",
          error
        );
      }
    }
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

// Criar solicitação de agendamento (status pending)
export const createAppointmentRequest = async (
  appointmentData: CreateAppointmentData,
  nutritionistId: string,
  requestedBy: string // UID do cliente que está solicitando
): Promise<string> => {
  try {
    const appointmentDoc = {
      clientId: appointmentData.clientId,
      clientName: appointmentData.clientName,
      nutritionistId,
      date: Timestamp.fromDate(appointmentData.date),
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      notes: appointmentData.notes || "",
      status: "pending",
      requestedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, APPOINTMENTS_COLLECTION),
      appointmentDoc
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar solicitação de agendamento:", error);
    throw error;
  }
};

// Buscar solicitações pendentes para um nutricionista
export const getPendingAppointmentRequests = async (
  nutritionistId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
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
    console.error("Erro ao buscar solicitações pendentes:", error);
    throw error;
  }
};

// Aprovar solicitação de agendamento
export const approveAppointmentRequest = async (
  appointmentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, {
      status: "scheduled",
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao aprovar solicitação:", error);
    throw error;
  }
};

// Rejeitar solicitação de agendamento
export const rejectAppointmentRequest = async (
  appointmentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, {
      status: "rejected",
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao rejeitar solicitação:", error);
    throw error;
  }
};

// Buscar agendamentos de um cliente
export const getAppointmentsByClientAuthUid = async (
  authUid: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("requestedBy", "==", authUid),
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
