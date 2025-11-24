/**
 * Script de Importação de Alimentos da TACO
 * 
 * Este script importa os alimentos da Tabela Brasileira de Composição de Alimentos (TACO)
 * para o Firestore.
 * 
 * Uso:
 * 1. Certifique-se de que os dados da TACO estão no arquivo data/taco-foods.json
 * 2. Execute este script através de uma página administrativa ou via console do navegador
 * 
 * NOTA: Os dados nutricionais completos devem ser extraídos do PDF TACO e
 * organizados no formato JSON apropriado.
 */

import { importFoodsBatch, getDefaultAllowedMeals } from "../services/foodService";
import type { Food } from "../types/food";

// Tipo para dados de importação (pode ter valores nutricionais opcionais)
type TacoFoodImport = Omit<Food, "id" | "createdAt" | "updatedAt"> & {
  // Campos opcionais que podem ser preenchidos automaticamente
  autoAllowedMeals?: boolean; // Se true, usa getDefaultAllowedMeals
};

/**
 * Importa alimentos da TACO a partir de um array de dados
 * 
 * @param tacoFoods Array de alimentos da TACO para importar
 * @param options Opções de importação
 */
export const importTacoFoods = async (
  tacoFoods: TacoFoodImport[],
  options: {
    skipDuplicates?: boolean;
    batchSize?: number;
    autoFillAllowedMeals?: boolean;
  } = {}
): Promise<{
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
}> => {
  const {
    skipDuplicates = true,
    batchSize = 500,
    autoFillAllowedMeals = true,
  } = options;

  console.log(`[importTacoFoods] Iniciando importação de ${tacoFoods.length} alimentos da TACO`);

  // Processar alimentos: preencher allowedMeals se necessário
  const processedFoods: Omit<Food, "id" | "createdAt" | "updatedAt">[] = tacoFoods.map((food) => {
    // Construir objeto sem campos undefined (Firestore não aceita undefined)
    const processed: Omit<Food, "id" | "createdAt" | "updatedAt"> = {
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      unit: food.unit,
    };

    // Adicionar campos opcionais apenas se não forem undefined
    if (food.fiber !== undefined) {
      processed.fiber = food.fiber;
    }

    if (food.unitWeight !== undefined) {
      processed.unitWeight = food.unitWeight;
    }

    // Preencher allowedMeals
    if (food.allowedMeals && food.allowedMeals.length > 0) {
      processed.allowedMeals = food.allowedMeals;
    } else if (autoFillAllowedMeals) {
      processed.allowedMeals = getDefaultAllowedMeals(processed.category);
    }

    // Se autoAllowedMeals estiver explicitamente definido como true, sobrescrever
    if (food.autoAllowedMeals === true) {
      processed.allowedMeals = getDefaultAllowedMeals(processed.category);
    }

    return processed;
  });

  // Importar em lote
  const result = await importFoodsBatch(processedFoods, skipDuplicates, batchSize);

  console.log(`[importTacoFoods] Importação concluída:`, result);
  return result;
};

/**
 * Função auxiliar para validar dados de alimento antes da importação
 */
export const validateTacoFood = (food: TacoFoodImport): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!food.name || food.name.trim().length === 0) {
    errors.push("Nome do alimento é obrigatório");
  }

  if (!food.category || food.category.trim().length === 0) {
    errors.push("Categoria é obrigatória");
  }

  if (typeof food.calories !== "number" || food.calories < 0) {
    errors.push("Calorias deve ser um número não negativo");
  }

  if (typeof food.protein !== "number" || food.protein < 0) {
    errors.push("Proteína deve ser um número não negativo");
  }

  if (typeof food.carbs !== "number" || food.carbs < 0) {
    errors.push("Carboidratos deve ser um número não negativo");
  }

  if (typeof food.fat !== "number" || food.fat < 0) {
    errors.push("Gordura deve ser um número não negativo");
  }

  if (food.fiber !== undefined && (typeof food.fiber !== "number" || food.fiber < 0)) {
    errors.push("Fibra deve ser um número não negativo (se fornecido)");
  }

  if (!food.unit || (food.unit !== "gramas" && food.unit !== "unidades")) {
    errors.push("Unidade deve ser 'gramas' ou 'unidades'");
  }

  if (food.unit === "unidades" && (!food.unitWeight || food.unitWeight <= 0)) {
    errors.push("unitWeight é obrigatório quando unit é 'unidades'");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida um array de alimentos e retorna apenas os válidos
 */
export const validateTacoFoods = (
  foods: TacoFoodImport[]
): {
  valid: TacoFoodImport[];
  invalid: Array<{ food: TacoFoodImport; errors: string[] }>;
} => {
  const valid: TacoFoodImport[] = [];
  const invalid: Array<{ food: TacoFoodImport; errors: string[] }> = [];

  for (const food of foods) {
    const validation = validateTacoFood(food);
    if (validation.valid) {
      valid.push(food);
    } else {
      invalid.push({ food, errors: validation.errors });
    }
  }

  return { valid, invalid };
};

