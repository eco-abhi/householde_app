'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recipe, MEAL_TYPES } from '@/types/recipe';
import {
    ChefHat, Clock, Users, Pencil, Trash2, ArrowLeft,
    ExternalLink, Check, Loader2, Flame, AlertCircle
} from 'lucide-react';

const mealBadgeStyles: Record<string, string> = {
    breakfast: 'from-amber-500 to-amber-600 shadow-amber-200/50',
    lunch: 'from-emerald-500 to-emerald-600 shadow-emerald-200/50',
    dinner: 'from-indigo-500 to-indigo-600 shadow-indigo-200/50',
    snack: 'from-orange-500 to-orange-600 shadow-orange-200/50',
    dessert: 'from-pink-500 to-pink-600 shadow-pink-200/50',
};

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const response = await fetch(`/api/recipes/${id}`);
            const data = await response.json();
            if (data.success) {
                setRecipe(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this recipe? This action cannot be undone.')) return;
        try {
            const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
            if (response.ok) {
                router.push('/recipes');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleStep = (index: number) => {
        setCheckedSteps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Get emoji for meal type
    const getMealEmoji = (type: string) => {
        const found = MEAL_TYPES.find(m => m.value === type);
        return found?.icon || '🍽️';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-8 lg:p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h2>
                    <p className="text-gray-500 mb-6">This recipe may have been deleted or doesn't exist.</p>
                    <Link
                        href="/recipes"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Recipes
                    </Link>
                </div>
            </div>
        );
    }

    const totalTime = recipe.prepTime + recipe.cookTime;

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/recipes"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all mb-6 active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Recipes
                </Link>

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
                    {/* Image */}
                    <div className="relative aspect-[21/9] bg-gray-100">
                        {recipe.imageUrl ? (
                            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <ChefHat className="w-20 h-20 text-gray-300" />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Meal Type Badges */}
                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                            {(recipe.mealTypes || []).map((type) => (
                                <span
                                    key={type}
                                    className={`px-4 py-2 bg-gradient-to-r ${mealBadgeStyles[type] || 'from-emerald-500 to-emerald-600 shadow-emerald-200/50'} text-white rounded-full text-sm font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm`}
                                >
                                    {getMealEmoji(type)} {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{recipe.title}</h1>
                            <div className="flex gap-2 shrink-0">
                                <Link
                                    href={`/recipes/${id}/edit`}
                                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-200/50 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-semibold border border-red-200 transition-all flex items-center active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-600 text-lg mb-6 leading-relaxed">{recipe.description}</p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-50/80 rounded-2xl border border-gray-100">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="font-semibold text-gray-900">{totalTime} min</span>
                                <span className="text-gray-400">({recipe.prepTime}+{recipe.cookTime})</span>
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-50/80 rounded-2xl border border-gray-100">
                                <Users className="w-5 h-5 text-cyan-600" />
                                <span className="font-semibold text-gray-900">{recipe.servings} servings</span>
                            </div>
                            {recipe.calories && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-orange-50/80 rounded-2xl border border-orange-100">
                                    <Flame className="w-5 h-5 text-orange-600" />
                                    <span className="font-semibold text-gray-900">{recipe.calories} cal</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {recipe.tags && recipe.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                                {recipe.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-50/80 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Source */}
                        {recipe.sourceUrl && (
                            <a
                                href={recipe.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-50/80 hover:from-purple-100 hover:to-purple-100/80 text-purple-700 rounded-2xl text-sm font-semibold border border-purple-200 transition-all active:scale-95"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Original Source
                            </a>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ingredients */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 lg:sticky lg:top-24">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full" />
                                <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
                            </div>
                            <ul className="space-y-3">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                                        <span className="text-gray-700">
                                            <strong className="font-semibold text-gray-900">{ing.amount}</strong> {ing.unit} {ing.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                                <h2 className="text-xl font-bold text-gray-900">Instructions</h2>
                            </div>
                            <ol className="space-y-3">
                                {recipe.instructions.map((instruction, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => toggleStep(idx)}
                                        className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 ${checkedSteps.has(idx) ? 'opacity-60 bg-emerald-50/50' : ''
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all shadow-md ${checkedSteps.has(idx)
                                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200/50 scale-95'
                                                : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200/50'
                                            }`}>
                                            {checkedSteps.has(idx) ? <Check className="w-5 h-5" /> : idx + 1}
                                        </div>
                                        <p className={`text-gray-700 leading-relaxed ${checkedSteps.has(idx) ? 'line-through' : ''}`}>
                                            {instruction}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}