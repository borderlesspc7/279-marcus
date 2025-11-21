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
import { getFoodById } from "./foodService";
import type { Diet, CreateDietData, Meal, MealFood } from "../types/food";

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
    const diets: Diet[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const meals = await loadMealsWithFoods(data.meals || []);

      diets.push({
        id: docSnap.id,
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        meals,
        height: data.height,
        weight: data.weight,
        nutritionistId: data.nutritionistId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Diet);
    }

    return diets;
  } catch (error) {
    console.error("Erro ao buscar dietas:", error);
    throw error;
  }
};

// Função auxiliar para carregar dados completos dos alimentos nas refeições
const loadMealsWithFoods = async (mealsData: any[]): Promise<Meal[]> => {
  const meals: Meal[] = [];
  const mealNames = ["cafe-manha", "almoco", "lanche", "jantar"];

  for (let index = 0; index < mealNames.length; index++) {
    const mealName = mealNames[index] as "cafe-manha" | "almoco" | "lanche" | "jantar";
    const mealData = mealsData.find((m) => m.name === mealName) || { name: mealName, foods: [] };
    
    const mealFoods: MealFood[] = [];

    for (const mealFoodData of mealData.foods || []) {
      try {
        const food = await getFoodById(mealFoodData.foodId);
        if (food) {
          mealFoods.push({
            foodId: mealFoodData.foodId,
            food,
            quantity: mealFoodData.quantity,
            unit: mealFoodData.unit,
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar alimento ${mealFoodData.foodId}:`, error);
      }
    }

    meals.push({
      id: `${mealName}-${index + 1}`,
      name: mealName,
      foods: mealFoods,
    });
  }

  return meals;
};

export const getDietById = async (dietId: string): Promise<Diet | null> => {
  try {
    const docRef = doc(db, DIETS_COLLECTION, dietId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const meals = await loadMealsWithFoods(data.meals || []);

      return {
        id: docSnap.id,
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        meals,
        height: data.height,
        weight: data.weight,
        nutritionistId: data.nutritionistId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
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

export const getDietsByNutritionist = async (nutritionistId: string): Promise<Diet[]> => {
  try {
    const q = query(
      collection(db, DIETS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const diets: Diet[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const meals = await loadMealsWithFoods(data.meals || []);

      diets.push({
        id: docSnap.id,
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        meals,
        height: data.height,
        weight: data.weight,
        nutritionistId: data.nutritionistId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Diet);
    }

    return diets;
  } catch (error) {
    console.error("Erro ao buscar dietas:", error);
    throw error;
  }
};

