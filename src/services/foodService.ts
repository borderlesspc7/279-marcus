import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
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
    // Remover campos undefined (Firestore não aceita undefined)
    const cleanFoodData: Record<string, unknown> = {};
    
    Object.entries(foodData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanFoodData[key] = value;
      }
    });

    const foodDoc = {
      ...cleanFoodData,
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
    console.log(`[getFoods] 🔍 Buscando alimentos do FIRESTORE (coleção: ${FOODS_COLLECTION})`);
    console.log(`[getFoods] Parâmetros: searchTerm="${searchTerm || 'nenhum'}", mealType="${mealType || 'nenhum'}", limit=${limitCount || 'nenhum'}`);
    
    // Buscar todos os alimentos primeiro (sem limite inicial)
    let q = query(collection(db, FOODS_COLLECTION), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    let foods = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Food[];

    console.log(`[getFoods] ✅ Total de alimentos encontrados no FIRESTORE: ${foods.length}`);

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

    console.log(`[getFoods] ✅ Resultado final do FIRESTORE: ${foods.length} alimentos`, {
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

// ========== IMPORTAÇÃO EM LOTE DE ALIMENTOS ==========

/**
 * Importa alimentos em lote para o Firestore
 * @param foods Array de alimentos para importar (sem id, createdAt, updatedAt)
 * @param skipDuplicates Se true, pula alimentos que já existem (baseado no nome)
 * @param batchSize Tamanho do lote para processamento (padrão: 500)
 * @returns Objeto com estatísticas da importação
 */
export const importFoodsBatch = async (
  foods: Omit<Food, "id" | "createdAt" | "updatedAt">[],
  skipDuplicates: boolean = true,
  batchSize: number = 500
): Promise<{
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
}> => {
  const stats = {
    total: foods.length,
    imported: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [] as string[],
  };

  try {
    // Se skipDuplicates estiver ativo, verificar alimentos existentes
    let existingFoods: Food[] = [];
    if (skipDuplicates) {
      existingFoods = await getFoods();
      console.log(`[importFoodsBatch] Encontrados ${existingFoods.length} alimentos existentes no banco`);
    }

    // Processar em lotes para evitar sobrecarga
    for (let i = 0; i < foods.length; i += batchSize) {
      const batch = foods.slice(i, i + batchSize);
      console.log(`[importFoodsBatch] Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(foods.length / batchSize)} (${batch.length} alimentos)`);

      for (const food of batch) {
        try {
          // Verificar duplicatas se necessário
          if (skipDuplicates) {
            const isDuplicate = existingFoods.some(
              (existing) => normalizeString(existing.name) === normalizeString(food.name)
            );

            if (isDuplicate) {
              stats.skipped++;
              continue;
            }
          }

          // Criar alimento
          await createFood(food);
          stats.imported++;

          // Adicionar à lista de existentes para evitar duplicatas no mesmo batch
          if (skipDuplicates) {
            existingFoods.push({
              ...food,
              id: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Food);
          }
        } catch (error) {
          stats.errors++;
          const errorMsg = `Erro ao importar "${food.name}": ${error instanceof Error ? error.message : String(error)}`;
          stats.errorDetails.push(errorMsg);
          console.error(`[importFoodsBatch] ${errorMsg}`);
        }
      }
    }

    console.log(`[importFoodsBatch] Importação concluída:`, stats);
    return stats;
  } catch (error) {
    console.error("[importFoodsBatch] Erro geral na importação:", error);
    throw error;
  }
};

/**
 * Função auxiliar para determinar allowedMeals baseado na categoria
 * Esta função pode ser usada para preencher automaticamente allowedMeals
 */
export const getDefaultAllowedMeals = (category: string): ("cafe-manha" | "almoco" | "lanche" | "jantar")[] => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes("fruta")) {
    return ["cafe-manha", "lanche"];
  }
  
  if (categoryLower.includes("proteína") || categoryLower.includes("carne") || categoryLower.includes("peixe") || categoryLower.includes("frango")) {
    return ["almoco", "jantar"];
  }
  
  if (categoryLower.includes("leguminosa") || categoryLower.includes("feijão") || categoryLower.includes("lentilha")) {
    return ["almoco", "jantar"];
  }
  
  if (categoryLower.includes("carboidrato") || categoryLower.includes("arroz") || categoryLower.includes("batata")) {
    return ["almoco", "jantar"];
  }
  
  if (categoryLower.includes("laticínio") || categoryLower.includes("leite") || categoryLower.includes("queijo") || categoryLower.includes("iogurte")) {
    return ["cafe-manha", "lanche"];
  }
  
  // Padrão: permite em todas as refeições
  return ["cafe-manha", "almoco", "lanche", "jantar"];
};

