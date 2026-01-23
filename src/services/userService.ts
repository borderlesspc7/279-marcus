import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { User } from "../types/user";

/**
 * Atualiza os horários de trabalho do usuário
 * @param userId - ID do usuário
 * @param workStartTime - Horário de início (formato HH:mm, ex: "08:00")
 * @param workEndTime - Horário de término (formato HH:mm, ex: "18:00")
 * @returns Dados atualizados do usuário
 */
export const updateUserSchedule = async (
  userId: string,
  workStartTime: string,
  workEndTime: string
): Promise<User> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      workStartTime,
      workEndTime,
      updatedAt: new Date(),
    });

    // Buscar dados atualizados do usuário
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("Usuário não encontrado");
    }

    const userData = userDoc.data();
    const convertedUser: User = {
      ...userData,
      createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
      updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
      trialEndDate: userData.trialEndDate?.toDate ? userData.trialEndDate.toDate() : userData.trialEndDate,
    } as User;

    return convertedUser;
  } catch (error) {
    console.error("Erro ao atualizar horários do usuário:", error);
    throw new Error("Erro ao atualizar horários. Tente novamente.");
  }
};
