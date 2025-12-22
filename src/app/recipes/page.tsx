'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Recipe, MealType, MEAL_TYPES } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import { ChefHat, Search, Loader2, Plus, X } from 'lucide-react';

export default function RecipesPage() {
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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">Recipe Collection</h1>
                        <p className="text-slate-500">
                            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                            {searchQuery && ` matching "${searchQuery}"`}
                            {selectedMealType !== 'all' && ` in ${selectedMealType}`}
                        </p>
                    </div>
                    <Link
                        href="/recipes/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all active:scale-95 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add Recipe
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 mb-8">
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, description, or tags..."
                                className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Meal Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-600 shrink-0">Filter:</span>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedMealType('all')}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${selectedMealType === 'all'
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
                                        className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${selectedMealType === type.value
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span>{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-slate-500 font-medium">Loading recipes...</p>
                        </div>
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ChefHat className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {searchQuery || selectedMealType !== 'all' ? 'No results found' : 'No recipes yet'}
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try adjusting your search or filters to find what you\'re looking for'
                                : selectedMealType !== 'all'
                                    ? `No ${selectedMealType} recipes found. Try a different category or add a new recipe.`
                                    : 'Get started by adding your first recipe to build your collection'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/recipes/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Recipe
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredRecipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
