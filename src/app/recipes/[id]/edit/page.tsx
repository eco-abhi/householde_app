'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

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

    const handleSubmit = async (data: RecipeFormData) => {
        setIsSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update');
            }

            router.push(`/recipes/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSaving(false);
        }
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
                    <p className="text-gray-500 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
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

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/recipes/${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all mb-6 active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Recipe
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Edit Recipe</h1>
                    <p className="text-gray-500 text-lg">Update your recipe details below.</p>
                </div>

                {error && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-3xl flex items-start gap-3 shadow-lg shadow-red-100/50">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 pt-1.5">
                            <h3 className="font-semibold text-red-900 mb-1">Error Updating Recipe</h3>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        </div>
    );
}