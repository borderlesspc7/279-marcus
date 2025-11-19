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
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Food } from "../types/food";

const FOODS_COLLECTION = "foods";

// ========== FUNÇÃO AUXILIAR PARA NORMALIZAR ACENTOS ==========

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
};

// ========== CRUD DE ALIMENTOS ==========

export const createFood = async (foodData: Omit<Food, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const foodDoc = {
      ...foodData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, FOODS_COLLECTION), foodDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar alimento:", error);
    throw error;
  }
};

export const getFoods = async (searchTerm?: string, limitCount?: number): Promise<Food[]> => {
  try {
    let q = query(collection(db, FOODS_COLLECTION), orderBy("name", "asc"));

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);

    let foods = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Food[];

    // Filtro de busca local (caso não tenha índice no Firestore)
    if (searchTerm) {
      const searchNormalized = normalizeString(searchTerm);
      foods = foods.filter(
        (food) =>
          normalizeString(food.name).includes(searchNormalized) ||
          normalizeString(food.category).includes(searchNormalized)
      );
    }

    return foods;
  } catch (error) {
    console.error("Erro ao buscar alimentos:", error);
    throw error;
  }
};

export const getFoodById = async (foodId: string): Promise<Food | null> => {
  try {
    const docRef = doc(db, FOODS_COLLECTION, foodId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Food;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar alimento:", error);
    throw error;
  }
};

export const updateFood = async (
  foodId: string,
  data: Partial<Omit<Food, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const docRef = doc(db, FOODS_COLLECTION, foodId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar alimento:", error);
    throw error;
  }
};

export const deleteFood = async (foodId: string): Promise<void> => {
  try {
    const docRef = doc(db, FOODS_COLLECTION, foodId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    throw error;
  }
};

// ========== INICIALIZAÇÃO DE ALIMENTOS BÁSICOS ==========

export const initializeDefaultFoods = async (): Promise<void> => {
  try {
    // Verificar se já existem alimentos
    const existingFoods = await getFoods();
    if (existingFoods.length > 0) {
      return; // Já existem alimentos, não precisa inicializar
    }

    const defaultFoods: Omit<Food, "id" | "createdAt" | "updatedAt">[] = [
      // Frutas
      { name: "Maçã", category: "Frutas", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: "gramas" },
      { name: "Banana", category: "Frutas", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: "unidades", unitWeight: 120 },
      { name: "Laranja", category: "Frutas", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, unit: "unidades", unitWeight: 150 },
      { name: "Mamão", category: "Frutas", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, unit: "gramas" },
      
      // Proteínas
      { name: "Peito de Frango (grelhado)", category: "Proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: "gramas" },
      { name: "Ovo (cozido)", category: "Proteínas", calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: "unidades", unitWeight: 50 },
      { name: "Salmão (grelhado)", category: "Proteínas", calories: 206, protein: 22, carbs: 0, fat: 12, unit: "gramas" },
      { name: "Carne Bovina (magra)", category: "Proteínas", calories: 250, protein: 26, carbs: 0, fat: 17, unit: "gramas" },
      { name: "Tofu", category: "Proteínas", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, unit: "gramas" },
      
      // Carboidratos
      { name: "Arroz Branco (cozido)", category: "Carboidratos", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "gramas" },
      { name: "Arroz Integral (cozido)", category: "Carboidratos", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, unit: "gramas" },
      { name: "Batata Doce (cozida)", category: "Carboidratos", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, unit: "gramas" },
      { name: "Macarrão (cozido)", category: "Carboidratos", calories: 131, protein: 5, carbs: 25, fat: 1.1, unit: "gramas" },
      { name: "Pão", category: "Carboidratos", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, unit: "gramas" },
      { name: "Pão Integral", category: "Carboidratos", calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, unit: "gramas" },
      { name: "Pão Francês", category: "Carboidratos", calories: 300, protein: 8, carbs: 58, fat: 3, unit: "gramas" },
      { name: "Pão de Forma", category: "Carboidratos", calories: 253, protein: 8, carbs: 47, fat: 3.1, unit: "gramas" },
      
      // Vegetais
      { name: "Brócolis (cozido)", category: "Vegetais", calories: 35, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, unit: "gramas" },
      { name: "Espinafre (cozido)", category: "Vegetais", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.3, fiber: 2.2, unit: "gramas" },
      { name: "Cenoura (crua)", category: "Vegetais", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: "gramas" },
      { name: "Tomate", category: "Vegetais", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: "gramas" },
      
      // Laticínios
      { name: "Leite Desnatado", category: "Laticínios", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, unit: "gramas" },
      { name: "Iogurte Natural", category: "Laticínios", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "gramas" },
      { name: "Queijo Cottage", category: "Laticínios", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, unit: "gramas" },
      
      // Oleaginosas
      { name: "Amendoim", category: "Oleaginosas", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, unit: "gramas" },
      { name: "Castanha do Pará", category: "Oleaginosas", calories: 659, protein: 14, carbs: 12, fat: 67, fiber: 7.5, unit: "gramas" },
      { name: "Amêndoas", category: "Oleaginosas", calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, unit: "gramas" },
    ];

    // Adicionar todos os alimentos
    for (const food of defaultFoods) {
      await createFood(food);
    }

    console.log("Alimentos padrão inicializados com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar alimentos padrão:", error);
    throw error;
  }
};

