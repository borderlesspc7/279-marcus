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
import type { Diet, CreateDietData } from "../types/food";

const DIETS_COLLECTION = "diets";

// ========== CRUD DE DIETAS ==========

export const createDiet = async (
  dietData: CreateDietData,
  nutritionistId: string
): Promise<string> => {
  try {
    // Converter MealFood para formato de armazenamento (apenas foodId)
    const mealsToSave = dietData.meals.map((meal) => ({
      name: meal.name,
      foods: meal.foods.map((mealFood) => ({
        foodId: mealFood.foodId,
        quantity: mealFood.quantity,
        unit: mealFood.unit,
      })),
    }));

    const dietDoc = {
      clientId: dietData.clientId,
      name: dietData.name,
      description: dietData.description || null,
      meals: mealsToSave,
      height: dietData.height || null,
      weight: dietData.weight || null,
      nutritionistId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, DIETS_COLLECTION), dietDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar dieta:", error);
    throw error;
  }
};

export const getDietsByClient = async (clientId: string): Promise<Diet[]> => {
  try {
    const q = query(
      collection(db, DIETS_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Diet[];
  } catch (error) {
    console.error("Erro ao buscar dietas:", error);
    throw error;
  }
};

export const getDietById = async (dietId: string): Promise<Diet | null> => {
  try {
    const docRef = doc(db, DIETS_COLLECTION, dietId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Diet;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dieta:", error);
    throw error;
  }
};

export const updateDiet = async (
  dietId: string,
  data: Partial<Omit<Diet, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const docRef = doc(db, DIETS_COLLECTION, dietId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar dieta:", error);
    throw error;
  }
};

export const deleteDiet = async (dietId: string): Promise<void> => {
  try {
    const docRef = doc(db, DIETS_COLLECTION, dietId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar dieta:", error);
    throw error;
  }
};

