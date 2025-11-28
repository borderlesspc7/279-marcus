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

export interface DietSubstitution {
  id: string;
  dietId: string;
  clientId: string;
  nutritionistId: string;
  mealName: "cafe-manha" | "almoco" | "lanche" | "jantar";
  originalFoodId: string;
  originalFoodName: string;
  requestedFoodId?: string;
  requestedFoodName?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubstitutionData {
  dietId: string;
  clientId: string;
  nutritionistId: string;
  mealName: "cafe-manha" | "almoco" | "lanche" | "jantar";
  originalFoodId: string;
  originalFoodName: string;
  requestedFoodId?: string;
  requestedFoodName?: string;
  reason: string;
}

const SUBSTITUTIONS_COLLECTION = "dietSubstitutions";

export const createSubstitutionRequest = async (
  substitutionData: CreateSubstitutionData
): Promise<string> => {
  try {
    const substitutionDoc = {
      ...substitutionData,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, SUBSTITUTIONS_COLLECTION),
      substitutionDoc
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar solicitação de substituição:", error);
    throw error;
  }
};

export const getSubstitutionsByClient = async (
  clientId: string
): Promise<DietSubstitution[]> => {
  try {
    const q = query(
      collection(db, SUBSTITUTIONS_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as DietSubstitution[];
  } catch (error) {
    console.error("Erro ao buscar substituições:", error);
    throw error;
  }
};

export const getSubstitutionsByNutritionist = async (
  nutritionistId: string
): Promise<DietSubstitution[]> => {
  try {
    const q = query(
      collection(db, SUBSTITUTIONS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as DietSubstitution[];
  } catch (error) {
    console.error("Erro ao buscar substituições:", error);
    throw error;
  }
};

export const getSubstitutionById = async (
  substitutionId: string
): Promise<DietSubstitution | null> => {
  try {
    const docRef = doc(db, SUBSTITUTIONS_COLLECTION, substitutionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as DietSubstitution;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar substituição:", error);
    throw error;
  }
};

export const updateSubstitutionStatus = async (
  substitutionId: string,
  status: "pending" | "approved" | "rejected" | "completed"
): Promise<void> => {
  try {
    const docRef = doc(db, SUBSTITUTIONS_COLLECTION, substitutionId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar status da substituição:", error);
    throw error;
  }
};

export const deleteSubstitution = async (
  substitutionId: string
): Promise<void> => {
  try {
    const docRef = doc(db, SUBSTITUTIONS_COLLECTION, substitutionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar substituição:", error);
    throw error;
  }
};

