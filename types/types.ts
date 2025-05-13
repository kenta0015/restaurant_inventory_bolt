export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  alertLevel: number;
  expiryDate: string | null;
  lastChecked: string;
  category?: string;
  comment?: string; // ← ✅ 追加
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

// ✅ New lightweight version used in MealLog JOINs
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
}

// ✅ Updated to use RecipeSummary instead of full Recipe
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
}

export interface PrepSheet {
  id: string;
  date: string;
  weekday: string;
  tasks: PrepTask[];
  totalEstimatedTime: number;
  status: 'in-progress' | 'completed';
}
