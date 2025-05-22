export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  alertLevel: number;
  expiryDate: string | null;
  lastChecked: string;
  category?: string;
  comment?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
  estimatedTime: number;
}

export interface MealLog {
  id: string;
  recipe: RecipeSummary;
  date: string;
  quantity: number;
  manualOverrideServings: number | null;
  notes: string | null;
}

export interface PrepSuggestion {
  id: string;
  recipeId: string;
  recipeName: string;
  suggestedQuantity: number;
  userQuantity: number;
  weekday: string;
  date: string;
  status: 'pending' | 'approved' | 'completed';
  hasShortage: boolean;
}

export interface IngredientShortage {
  ingredientName: string;
  required: number;
  available: number;
  unit: string;
}

// 🔁 Original PrepTask (still used for ingredient-based workflows)
export interface PrepTask {
  id: string;
  recipeId: string;
  recipeName: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedTime: number;
  isCompleted: boolean;
  completedQuantity: number;

  // ✅ 以下を追加
  recipe: Recipe;
  shortages: Array<{
    name: string;
    necessaryAmount: number;
    unit: string;
    currentStock: number;
  }>;
  necessaryPrepInfo: {
    necessaryIngredients: Array<{
      name: string;
      necessaryAmount: number;
      unit: string;
      currentStock: number;
    }>;
    canPrepWithCurrentStock: boolean;
  };
}

// 🆕 NEW: Recipe-based batch model
export interface RecipePrepTask {
  id: string;
  recipeId: string;
  recipeName: string;
  prepQuantity: number;
  estimatedTime: number;
  totalIngredientWeight: number;
  isCompleted: boolean;
}

export interface PrepSheet {
  id: string;
  date: string;
  weekday: string;
  tasks: PrepTask[];
  totalEstimatedTime: number;
  status: 'in-progress' | 'completed';
}
