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
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim();
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

export const getFoods = async (
  searchTerm?: string,
  mealType?: "cafe-manha" | "almoco" | "lanche" | "jantar",
  limitCount?: number
): Promise<Food[]> => {
  try {
    // Buscar todos os alimentos primeiro (sem limite inicial)
    let q = query(collection(db, FOODS_COLLECTION), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    let foods = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Food[];

    console.log(`[getFoods] Total de alimentos no banco: ${foods.length}`);

    // Remover duplicados baseado no ID
    const uniqueFoods = foods.filter((food, index, self) => 
      index === self.findIndex((f) => f.id === food.id)
    );
    foods = uniqueFoods;

    // Remover duplicados baseado no nome (caso haja IDs diferentes mas mesmo nome)
    const uniqueByName = foods.filter((food, index, self) => 
      index === self.findIndex((f) => 
        normalizeString(f.name) === normalizeString(food.name)
      )
    );
    foods = uniqueByName;

    // Filtro por refeição permitida
    if (mealType) {
      foods = foods.filter((food) => {
        // Se o alimento não tem allowedMeals definido, permite em todas as refeições
        if (!food.allowedMeals || food.allowedMeals.length === 0) {
          return true;
        }
        // Caso contrário, verifica se a refeição está na lista
        return food.allowedMeals.includes(mealType);
      });
    }

    // Filtro de busca local (aplicado após o filtro de refeição)
    if (searchTerm) {
      const searchNormalized = normalizeString(searchTerm);
      console.log(`[getFoods] Buscando por: "${searchTerm}" (normalizado: "${searchNormalized}")`);
      console.log(`[getFoods] Alimentos antes da busca: ${foods.length}`);
      
      // Dividir o termo de busca em palavras para busca mais flexível
      const searchWords = searchNormalized.split(/\s+/).filter(word => word.length > 0);
      
      // Mapeamento de termos de busca para categorias relacionadas
      const categoryMapping: Record<string, string[]> = {
        "carne": ["proteínas", "proteina"],
        "proteina": ["proteínas", "proteina"],
        "proteínas": ["proteínas", "proteina"],
        "frango": ["proteínas", "proteina"],
        "peixe": ["proteínas", "proteina"],
        "peixes": ["proteínas", "proteina"],
        "bovina": ["proteínas", "proteina"],
        "porco": ["proteínas", "proteina"],
        "suino": ["proteínas", "proteina"],
        "leite": ["laticínios", "laticinios"],
        "laticinios": ["laticínios", "laticinios"],
        "laticínios": ["laticínios", "laticinios"],
        "queijo": ["laticínios", "laticinios"],
        "queijos": ["laticínios", "laticinios"],
        "iogurte": ["laticínios", "laticinios"],
        "iogurtes": ["laticínios", "laticinios"],
        "fei": ["leguminosas"],
        "feijao": ["leguminosas"],
        "feijão": ["leguminosas"],
        "feijoes": ["leguminosas"],
        "feijões": ["leguminosas"],
        "leguminosa": ["leguminosas"],
        "leguminosas": ["leguminosas"],
      };
      
      // Obter categorias relacionadas ao termo de busca
      const relatedCategories = categoryMapping[searchNormalized] || [];
      if (relatedCategories.length > 0) {
        console.log(`[getFoods] Categorias relacionadas encontradas:`, relatedCategories);
      }
      
      const beforeFilter = foods.length;
      foods = foods.filter((food) => {
        const foodNameNormalized = normalizeString(food.name);
        const foodCategoryNormalized = normalizeString(food.category);
        
        // Verificar se a categoria está relacionada ao termo de busca
        const isRelatedCategory = relatedCategories.some(cat => 
          foodCategoryNormalized.includes(cat)
        );
        
        // Se houver múltiplas palavras, todas devem estar presentes
        if (searchWords.length > 1) {
          return searchWords.every(word => 
            foodNameNormalized.includes(word) || 
            foodCategoryNormalized.includes(word)
          ) || isRelatedCategory;
        }
        
        // Busca simples: verifica se o termo está no nome, categoria ou se é uma categoria relacionada
        // Busca também em palavras individuais do nome (para encontrar "Leite Desnatado" quando buscar "leite")
        const nameWords = foodNameNormalized.split(/\s+/);
        const matchesInName = nameWords.some(word => word.includes(searchNormalized));
        
        const matches = (
          foodNameNormalized.includes(searchNormalized) ||
          foodCategoryNormalized.includes(searchNormalized) ||
          matchesInName ||
          // Verifica se é uma categoria relacionada
          isRelatedCategory
        );
        
        return matches;
      });
      
      console.log(`[getFoods] Alimentos após busca: ${foods.length} (filtrados de ${beforeFilter})`);
      console.log(`[getFoods] Alimentos encontrados:`, foods.map(f => f.name));
    }

    // Aplicar limite apenas no final, após todos os filtros
    if (limitCount && limitCount > 0) {
      foods = foods.slice(0, limitCount);
    }

    console.log(`[getFoods] Resultado final: ${foods.length} alimentos`, {
      searchTerm,
      mealType,
      limitCount,
      alimentos: foods.map(f => f.name)
    });

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
      // ========== FRUTAS ==========
      { name: "Maçã", category: "Frutas", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Banana", category: "Frutas", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: "unidades", unitWeight: 120, allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Laranja", category: "Frutas", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, unit: "unidades", unitWeight: 150, allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Mamão", category: "Frutas", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Abacaxi", category: "Frutas", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Melancia", category: "Frutas", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Morango", category: "Frutas", calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Uva", category: "Frutas", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Pera", category: "Frutas", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Kiwi", category: "Frutas", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, unit: "unidades", unitWeight: 75, allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Manga", category: "Frutas", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Abacate", category: "Frutas", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      
      // ========== PROTEÍNAS - CARNES ==========
      { name: "Peito de Frango (grelhado)", category: "Proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Coxa de Frango (grelhada)", category: "Proteínas", calories: 180, protein: 26, carbs: 0, fat: 8, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Sobrecoxa de Frango (grelhada)", category: "Proteínas", calories: 200, protein: 24, carbs: 0, fat: 11, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Carne Bovina (magra)", category: "Proteínas", calories: 250, protein: 26, carbs: 0, fat: 17, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Alcatra (grelhada)", category: "Proteínas", calories: 240, protein: 27, carbs: 0, fat: 14, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Maminha (grelhada)", category: "Proteínas", calories: 220, protein: 28, carbs: 0, fat: 11, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Patinho (grelhado)", category: "Proteínas", calories: 200, protein: 29, carbs: 0, fat: 9, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Salmão (grelhado)", category: "Proteínas", calories: 206, protein: 22, carbs: 0, fat: 12, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Tilápia (grelhada)", category: "Proteínas", calories: 128, protein: 26, carbs: 0, fat: 2.7, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Atum (enlatado em água)", category: "Proteínas", calories: 116, protein: 26, carbs: 0, fat: 1, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Sardinha (enlatada)", category: "Proteínas", calories: 208, protein: 25, carbs: 0, fat: 11, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Porco (lombo grelhado)", category: "Proteínas", calories: 242, protein: 27, carbs: 0, fat: 14, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Ovo (cozido)", category: "Proteínas", calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: "unidades", unitWeight: 50, allowedMeals: ["cafe-manha", "almoco", "jantar"] },
      { name: "Ovo (frito)", category: "Proteínas", calories: 196, protein: 13, carbs: 1.1, fat: 15, unit: "unidades", unitWeight: 50, allowedMeals: ["cafe-manha", "almoco", "jantar"] },
      { name: "Ovo (mexido)", category: "Proteínas", calories: 166, protein: 11, carbs: 1.1, fat: 12, unit: "gramas", allowedMeals: ["cafe-manha", "almoco", "jantar"] },
      { name: "Tofu", category: "Proteínas", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Peito de Peru", category: "Proteínas", calories: 135, protein: 30, carbs: 0, fat: 1, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      
      // ========== LEGUMINOSAS ==========
      { name: "Feijão Preto (cozido)", category: "Leguminosas", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Feijão Carioca (cozido)", category: "Leguminosas", calories: 130, protein: 8.6, carbs: 24, fat: 0.5, fiber: 8.5, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Feijão Vermelho (cozido)", category: "Leguminosas", calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Lentilha (cozida)", category: "Leguminosas", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Grão-de-bico (cozido)", category: "Leguminosas", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Ervilha (cozida)", category: "Leguminosas", calories: 84, protein: 5.4, carbs: 15, fat: 0.2, fiber: 5.1, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Soja (cozida)", category: "Leguminosas", calories: 173, protein: 16.6, carbs: 10, fat: 9, fiber: 6, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      
      // ========== CARBOIDRATOS ==========
      { name: "Arroz Branco (cozido)", category: "Carboidratos", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Arroz Integral (cozido)", category: "Carboidratos", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Batata Doce (cozida)", category: "Carboidratos", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Batata Inglesa (cozida)", category: "Carboidratos", calories: 87, protein: 2, carbs: 20, fat: 0.1, fiber: 1.8, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Batata Inglesa (assada)", category: "Carboidratos", calories: 93, protein: 2.5, carbs: 21, fat: 0.1, fiber: 2.2, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Macarrão (cozido)", category: "Carboidratos", calories: 131, protein: 5, carbs: 25, fat: 1.1, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Macarrão Integral (cozido)", category: "Carboidratos", calories: 124, protein: 5, carbs: 25, fat: 1.3, fiber: 3.2, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Pão", category: "Carboidratos", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Pão Integral", category: "Carboidratos", calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Pão Francês", category: "Carboidratos", calories: 300, protein: 8, carbs: 58, fat: 3, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Pão de Forma", category: "Carboidratos", calories: 253, protein: 8, carbs: 47, fat: 3.1, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Pão de Açúcar", category: "Carboidratos", calories: 290, protein: 8, carbs: 56, fat: 2.5, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Torrada", category: "Carboidratos", calories: 313, protein: 9, carbs: 58, fat: 3.5, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Aveia", category: "Carboidratos", calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Quinoa (cozida)", category: "Carboidratos", calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Cuscuz", category: "Carboidratos", calories: 112, protein: 3.8, carbs: 25, fat: 0.2, fiber: 1.1, unit: "gramas", allowedMeals: ["cafe-manha", "almoco", "jantar"] },
      { name: "Tapioca", category: "Carboidratos", calories: 360, protein: 0.2, carbs: 88, fat: 0, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Mandioca (cozida)", category: "Carboidratos", calories: 125, protein: 1.3, carbs: 30, fat: 0.3, fiber: 1.9, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      { name: "Inhame (cozido)", category: "Carboidratos", calories: 118, protein: 2, carbs: 28, fat: 0.2, fiber: 4.1, unit: "gramas", allowedMeals: ["almoco", "jantar"] },
      
      // ========== VEGETAIS ==========
      { name: "Brócolis (cozido)", category: "Vegetais", calories: 35, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, unit: "gramas" },
      { name: "Espinafre (cozido)", category: "Vegetais", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.3, fiber: 2.2, unit: "gramas" },
      { name: "Cenoura (crua)", category: "Vegetais", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: "gramas" },
      { name: "Cenoura (cozida)", category: "Vegetais", calories: 35, protein: 0.8, carbs: 8, fat: 0.2, fiber: 2.8, unit: "gramas" },
      { name: "Tomate", category: "Vegetais", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: "gramas" },
      { name: "Alface", category: "Vegetais", calories: 15, protein: 1.4, carbs: 3, fat: 0.2, fiber: 1.3, unit: "gramas" },
      { name: "Rúcula", category: "Vegetais", calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, unit: "gramas" },
      { name: "Repolho", category: "Vegetais", calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5, unit: "gramas" },
      { name: "Couve", category: "Vegetais", calories: 27, protein: 2.9, carbs: 4.3, fat: 0.4, fiber: 2, unit: "gramas" },
      { name: "Couve-flor (cozida)", category: "Vegetais", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, unit: "gramas" },
      { name: "Abobrinha (cozida)", category: "Vegetais", calories: 15, protein: 1.1, carbs: 3.4, fat: 0.2, fiber: 1, unit: "gramas" },
      { name: "Berinjela (cozida)", category: "Vegetais", calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 2.5, unit: "gramas" },
      { name: "Pepino", category: "Vegetais", calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, unit: "gramas" },
      { name: "Pimentão", category: "Vegetais", calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 1.5, unit: "gramas" },
      { name: "Cebola (cozida)", category: "Vegetais", calories: 44, protein: 1.4, carbs: 10, fat: 0.2, fiber: 1.7, unit: "gramas" },
      { name: "Alho", category: "Vegetais", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, unit: "gramas" },
      { name: "Chuchu (cozido)", category: "Vegetais", calories: 19, protein: 0.7, carbs: 4.5, fat: 0.1, fiber: 1.7, unit: "gramas" },
      { name: "Vagem (cozida)", category: "Vegetais", calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 3.4, unit: "gramas" },
      { name: "Beterraba (cozida)", category: "Vegetais", calories: 44, protein: 1.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: "gramas" },
      
      // ========== LATICÍNIOS ==========
      { name: "Leite Desnatado", category: "Laticínios", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Leite Integral", category: "Laticínios", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.2, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Leite Semidesnatado", category: "Laticínios", calories: 46, protein: 3.3, carbs: 4.9, fat: 1.5, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Iogurte Natural", category: "Laticínios", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Iogurte Desnatado", category: "Laticínios", calories: 45, protein: 10, carbs: 3.6, fat: 0.1, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Iogurte Grego", category: "Laticínios", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Queijo Cottage", category: "Laticínios", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Queijo Minas", category: "Laticínios", calories: 243, protein: 17, carbs: 3, fat: 18, unit: "gramas", allowedMeals: ["cafe-manha", "lanche", "almoco", "jantar"] },
      { name: "Queijo Mussarela", category: "Laticínios", calories: 300, protein: 22, carbs: 2, fat: 22, unit: "gramas", allowedMeals: ["cafe-manha", "lanche", "almoco", "jantar"] },
      { name: "Queijo Prato", category: "Laticínios", calories: 360, protein: 25, carbs: 2, fat: 28, unit: "gramas", allowedMeals: ["cafe-manha", "lanche", "almoco", "jantar"] },
      { name: "Queijo Ricotta", category: "Laticínios", calories: 174, protein: 11, carbs: 3, fat: 13, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Requeijão", category: "Laticínios", calories: 257, protein: 9, carbs: 3, fat: 23, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Cream Cheese", category: "Laticínios", calories: 342, protein: 6, carbs: 4, fat: 34, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      
      // ========== OLEAGINOSAS ==========
      { name: "Amendoim", category: "Oleaginosas", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, unit: "gramas" },
      { name: "Castanha do Pará", category: "Oleaginosas", calories: 659, protein: 14, carbs: 12, fat: 67, fiber: 7.5, unit: "gramas" },
      { name: "Amêndoas", category: "Oleaginosas", calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, unit: "gramas" },
      { name: "Castanha de Caju", category: "Oleaginosas", calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, unit: "gramas" },
      { name: "Nozes", category: "Oleaginosas", calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, unit: "gramas" },
      { name: "Avelã", category: "Oleaginosas", calories: 628, protein: 15, carbs: 17, fat: 61, fiber: 10, unit: "gramas" },
      { name: "Pistache", category: "Oleaginosas", calories: 562, protein: 20, carbs: 28, fat: 45, fiber: 10, unit: "gramas" },
      
      // ========== GORDURAS E ÓLEOS ==========
      { name: "Azeite de Oliva", category: "Gorduras", calories: 884, protein: 0, carbs: 0, fat: 100, unit: "gramas" },
      { name: "Óleo de Coco", category: "Gorduras", calories: 862, protein: 0, carbs: 0, fat: 100, unit: "gramas" },
      { name: "Manteiga", category: "Gorduras", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
      { name: "Margarina", category: "Gorduras", calories: 720, protein: 0.2, carbs: 0.7, fat: 80, unit: "gramas", allowedMeals: ["cafe-manha", "lanche"] },
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

