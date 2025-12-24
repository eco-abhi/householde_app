// components/RecipeCard.tsx
'use client';

import { Clock, Heart, Flame, Users } from 'lucide-react';
import { Recipe, MEAL_TYPES } from '@/types/recipe';
import Link from 'next/link';

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    // Get emoji for meal type
    const getMealEmoji = (type: string) => {
        const found = MEAL_TYPES.find(m => m.value === type);
        return found?.icon || '🍽️';
    };

    // Handle both old mealType (string) and new mealTypes (array)
    const oldType = (recipe as Recipe & { mealType?: string }).mealType;
    const mealTypes = recipe.mealTypes?.length ? recipe.mealTypes : (oldType ? [oldType] : []);

    return (
        <Link href={`/recipes/${recipe._id}`} className="block w-full">
            <div className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-100 active:scale-[0.98] w-full">

                {/* Image Container */}
                <div className="relative aspect-4/5 overflow-hidden bg-gray-100 w-full">
                    <img
                        src={recipe.imageUrl || '/placeholder-recipe.webp'}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Meal Type Badges */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2rem)]">
                        {mealTypes.slice(0, 2).map((type) => (
                            <div
                                key={type}
                                className="backdrop-blur-xl bg-white/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/50 shadow-lg"
                            >
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-800">
                                    {getMealEmoji(type)} {type}
                                </span>
                            </div>
                        ))}
                        {mealTypes.length > 2 && (
                            <div className="backdrop-blur-xl bg-white/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/50 shadow-lg">
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">
                                    +{mealTypes.length - 2}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Bottom Content (Inside Image) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs font-semibold mb-2">
                            <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-full text-white">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {recipe.prepTime + recipe.cookTime}m
                            </span>
                            {recipe.calories && (
                                <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-full text-white">
                                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {recipe.calories}
                                </span>
                            )}
                            <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-full text-white">
                                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {recipe.servings}
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight line-clamp-2 text-white drop-shadow-lg">
                            {recipe.title}
                        </h3>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 flex justify-between items-center bg-linear-to-b from-gray-50/50 to-white">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200/50 shrink-0">
                            {recipe.ingredients.length}
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate">Ingredients</span>
                    </div>
                    <button
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all group-hover:scale-110 shrink-0"
                        onClick={(e) => e.preventDefault()}
                    >
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
}