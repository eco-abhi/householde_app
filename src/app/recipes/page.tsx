'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Recipe, MealType, MEAL_TYPES } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import { ChefHat, Search, Loader2, Plus, X } from 'lucide-react';

function RecipesContent() {
    const searchParams = useSearchParams();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Initialize from URL params and fetch recipes
    useEffect(() => {
        const meal = searchParams.get('meal') as MealType | null;
        if (meal && MEAL_TYPES.some(t => t.value === meal)) {
            setSelectedMealType(meal);
        }
        if (!initialized) {
            fetchRecipes();
            setInitialized(true);
        }
    }, [searchParams, initialized]);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/recipes');
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            if (data.success) {
                setRecipes(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter recipes - a recipe matches if it has the selected meal type
    // Handles both old mealType (string) and new mealTypes (array) for backward compatibility
    const filteredRecipes = recipes.filter((recipe) => {
        // Meal type filter
        if (selectedMealType !== 'all') {
            // Support both old mealType (string) and new mealTypes (array)
            const types = recipe.mealTypes || [];
            const oldType = (recipe as Recipe & { mealType?: string }).mealType;

            const hasType = types.includes(selectedMealType) || oldType === selectedMealType;
            if (!hasType) return false;
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                recipe.title.toLowerCase().includes(q) ||
                recipe.description.toLowerCase().includes(q) ||
                recipe.tags?.some((tag) => tag.toLowerCase().includes(q))
            );
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">Recipe Collection</h1>
                        <p className="text-sm sm:text-base text-slate-500 truncate">
                            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                            {searchQuery && ` matching "${searchQuery}"`}
                            {selectedMealType !== 'all' && ` in ${selectedMealType}`}
                        </p>
                    </div>
                    <Link
                        href="/recipes/new"
                        className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all active:scale-95 shrink-0 text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Recipe</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-3 sm:p-4 md:p-5 mb-6 sm:mb-8">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search recipes..."
                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}
                        </div>

                        {/* Meal Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full overflow-hidden">
                            <span className="text-xs sm:text-sm font-semibold text-slate-600 shrink-0">Filter:</span>
                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedMealType('all')}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${selectedMealType === 'all'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    All
                                </button>
                                {MEAL_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedMealType(type.value)}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${selectedMealType === type.value
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="text-sm sm:text-base">{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 sm:py-20">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading recipes...</p>
                        </div>
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">
                            {searchQuery || selectedMealType !== 'all' ? 'No results found' : 'No recipes yet'}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6 max-w-md mx-auto px-2">
                            {searchQuery
                                ? 'Try adjusting your search or filters to find what you\'re looking for'
                                : selectedMealType !== 'all'
                                    ? `No ${selectedMealType} recipes found. Try a different category or add a new recipe.`
                                    : 'Get started by adding your first recipe to build your collection'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/recipes/new"
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all active:scale-95 text-sm sm:text-base"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Recipe
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                        {filteredRecipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RecipesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center overflow-x-hidden px-4">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading recipes...</p>
                </div>
            </div>
        }>
            <RecipesContent />
        </Suspense>
    );
}
