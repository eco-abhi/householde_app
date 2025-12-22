'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import { RecipeFormData } from '@/types/recipe';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewRecipePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (data: RecipeFormData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to create recipe');
            }

            router.push(`/recipes/${result.data._id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/recipes"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all mb-6 active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Recipes
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Add New Recipe</h1>
                    <p className="text-gray-500 text-lg">Fill in the details or use AI to extract from a URL.</p>
                </div>

                {error && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-3xl flex items-start gap-3 shadow-lg shadow-red-100/50">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 pt-1.5">
                            <h3 className="font-semibold text-red-900 mb-1">Error Creating Recipe</h3>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
}