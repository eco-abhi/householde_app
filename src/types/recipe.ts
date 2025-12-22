export interface Ingredient {
    name: string;
    amount: string;
    unit: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Recipe {
    _id?: string;
    title: string;
    description: string;
    mealTypes: MealType[];  // Changed to array for multiple meal types
    ingredients: Ingredient[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    calories?: number;
    imageUrl?: string;
    sourceUrl?: string;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RecipeFormData {
    title: string;
    description: string;
    mealTypes: MealType[];  // Changed to array
    ingredients: Ingredient[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    calories?: number;
    imageUrl?: string;
    sourceUrl?: string;
    tags: string[];
}

export const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍿' },
    { value: 'dessert', label: 'Dessert', icon: '🍰' },
];
