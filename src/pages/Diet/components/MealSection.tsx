import React, { useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { FoodSearch } from "./FoodSearch";
import { Button } from "../../../components/ui/Button/Button";
import type { Meal, MealFood, Food } from "../../../types/food";
import "./MealSection.css";

interface MealSectionProps {
  meal: Meal;
  onUpdate: (meal: Meal) => void;
  readOnly?: boolean;
}

const mealNames: Record<Meal["name"], string> = {
  "cafe-manha": "Café da Manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

export const MealSection: React.FC<MealSectionProps> = ({ meal, onUpdate, readOnly = false }) => {
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  const handleAddFood = (food: Food) => {
    const newFood: MealFood = {
      foodId: food.id,
      food,
      quantity: food.unit === "unidades" ? 1 : 100, // Default: 1 unidade ou 100g
      unit: food.unit,
    };

    const updatedMeal: Meal = {
      ...meal,
      foods: [...meal.foods, newFood],
    };

    onUpdate(updatedMeal);
  };

  const handleRemoveFood = (foodId: string) => {
    const updatedMeal: Meal = {
      ...meal,
      foods: meal.foods.filter((f) => f.foodId !== foodId),
    };

    onUpdate(updatedMeal);
  };

  const handleStartEdit = (food: MealFood) => {
    setEditingFoodId(food.foodId);
    setEditingQuantity(food.quantity);
  };

  const handleSaveEdit = () => {
    if (!editingFoodId || editingQuantity <= 0) return;

    const updatedMeal: Meal = {
      ...meal,
      foods: meal.foods.map((f) =>
        f.foodId === editingFoodId
          ? { ...f, quantity: editingQuantity }
          : f
      ),
    };

    onUpdate(updatedMeal);
    setEditingFoodId(null);
    setEditingQuantity(0);
  };

  const calculateMealTotals = () => {
    return meal.foods.reduce(
      (totals, mealFood) => {
        const multiplier =
          mealFood.unit === "unidades" && mealFood.food.unitWeight
            ? (mealFood.quantity * mealFood.food.unitWeight) / 100
            : mealFood.quantity / 100;

        return {
          calories: totals.calories + mealFood.food.calories * multiplier,
          protein: totals.protein + mealFood.food.protein * multiplier,
          carbs: totals.carbs + mealFood.food.carbs * multiplier,
          fat: totals.fat + mealFood.food.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = calculateMealTotals();

  return (
    <div className="meal-section">
      <div className="meal-section__header">
        <h3 className="meal-section__title">{mealNames[meal.name]}</h3>
        <div className="meal-section__totals">
          <span className="meal-section__total-item">
            {totals.calories.toFixed(0)} kcal
          </span>
          <span className="meal-section__total-item">
            P: {totals.protein.toFixed(1)}g
          </span>
          <span className="meal-section__total-item">
            C: {totals.carbs.toFixed(1)}g
          </span>
          <span className="meal-section__total-item">
            G: {totals.fat.toFixed(1)}g
          </span>
        </div>
      </div>

      {!readOnly && (
        <div className="meal-section__search">
          <FoodSearch 
            onSelect={handleAddFood} 
            placeholder="Adicionar alimento..." 
            mealType={meal.name}
          />
        </div>
      )}

      <div className="meal-section__foods">
        {meal.foods.length === 0 ? (
          <div className="meal-section__empty">
            <p>Nenhum alimento adicionado ainda</p>
          </div>
        ) : (
          meal.foods.map((mealFood) => (
            <div key={mealFood.foodId} className="meal-section__food">
              <div className="meal-section__food-info">
                <span className="meal-section__food-name">
                  {mealFood.food.name}
                </span>
                <span className="meal-section__food-category">
                  {mealFood.food.category}
                </span>
              </div>

              {editingFoodId === mealFood.foodId ? (
                <div className="meal-section__food-edit">
                  <input
                    type="number"
                    min="0"
                    step={mealFood.unit === "unidades" ? 1 : 10}
                    value={editingQuantity}
                    onChange={(e) => setEditingQuantity(Number(e.target.value))}
                    className="meal-section__food-input"
                  />
                  <span className="meal-section__food-unit">
                    {mealFood.unit === "unidades" ? "un." : "g"}
                  </span>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleSaveEdit}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setEditingFoodId(null);
                      setEditingQuantity(0);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="meal-section__food-quantity">
                  <span>
                    {mealFood.quantity}{" "}
                    {mealFood.unit === "unidades" ? "un." : "g"}
                  </span>
                  {!readOnly && (
                    <div className="meal-section__food-actions">
                      <button
                        className="meal-section__food-btn meal-section__food-btn--edit"
                        onClick={() => handleStartEdit(mealFood)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="meal-section__food-btn meal-section__food-btn--delete"
                        onClick={() => handleRemoveFood(mealFood.foodId)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="meal-section__food-nutrition">
                <span>
                  {(
                    (mealFood.unit === "unidades" && mealFood.food.unitWeight
                      ? (mealFood.quantity * mealFood.food.unitWeight) / 100
                      : mealFood.quantity / 100) * mealFood.food.calories
                  ).toFixed(0)}{" "}
                  kcal
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

