'use client';

import { useState } from 'react';
import { Recipe, RecipeFormData, MealType, MEAL_TYPES, Ingredient } from '@/types/recipe';
import { Plus, Minus, Save, Loader2, Sparkles, X } from 'lucide-react';
import AIExtractor from './AIExtractor';

interface RecipeFormProps {
    initialData?: Recipe;
    onSubmit: (data: RecipeFormData) => Promise<void>;
    isLoading?: boolean;
}

const emptyIngredient: Ingredient = { name: '', amount: '', unit: '' };

export default function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
    const [showAI, setShowAI] = useState(false);

    // Handle both old mealType (string) and new mealTypes (array) for backward compatibility
    const getInitialMealTypes = (): MealType[] => {
        if (initialData?.mealTypes?.length) return initialData.mealTypes;
        const oldType = (initialData as Recipe & { mealType?: MealType })?.mealType;
        if (oldType) return [oldType];
        return ['dinner'];
    };

    const [formData, setFormData] = useState<RecipeFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        mealTypes: getInitialMealTypes(),
        ingredients: initialData?.ingredients?.length ? initialData.ingredients : [{ ...emptyIngredient }],
        instructions: initialData?.instructions?.length ? initialData.instructions : [''],
        prepTime: initialData?.prepTime || 15,
        cookTime: initialData?.cookTime || 30,
        servings: initialData?.servings || 4,
        calories: initialData?.calories || undefined,
        imageUrl: initialData?.imageUrl || '',
        sourceUrl: initialData?.sourceUrl || '',
        tags: initialData?.tags || [],
    });
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['prepTime', 'cookTime', 'servings', 'calories'].includes(name)
                ? (value === '' ? undefined : Number(value))
                : value,
        }));
    };

    const toggleMealType = (mealType: MealType) => {
        setFormData((prev) => {
            const current = prev.mealTypes;
            if (current.includes(mealType)) {
                // Don't allow removing the last one
                if (current.length === 1) return prev;
                return { ...prev, mealTypes: current.filter(t => t !== mealType) };
            } else {
                return { ...prev, mealTypes: [...current, mealType] };
            }
        });
    };

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
        }));
    };

    const addIngredient = () => {
        setFormData((prev) => ({ ...prev, ingredients: [...prev.ingredients, { ...emptyIngredient }] }));
    };

    const removeIngredient = (index: number) => {
        if (formData.ingredients.length === 1) return;
        setFormData((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
    };

    const handleInstructionChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            instructions: prev.instructions.map((inst, i) => (i === index ? value : inst)),
        }));
    };

    const addInstruction = () => {
        setFormData((prev) => ({ ...prev, instructions: [...prev.instructions, ''] }));
    };

    const removeInstruction = (index: number) => {
        if (formData.instructions.length === 1) return;
        setFormData((prev) => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const handleAIExtract = (data: Partial<RecipeFormData>) => {
        setFormData((prev) => ({
            ...prev,
            ...data,
            mealTypes: data.mealTypes?.length ? data.mealTypes : prev.mealTypes,
            ingredients: data.ingredients?.length ? data.ingredients : prev.ingredients,
            instructions: data.instructions?.length ? data.instructions : prev.instructions,
            tags: data.tags?.length ? data.tags : prev.tags,
        }));
        setShowAI(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = {
            ...formData,
            ingredients: formData.ingredients.filter((i) => i.name.trim()),
            instructions: formData.instructions.filter((i) => i.trim()),
        };
        onSubmit(cleaned);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* AI Button */}
            <button
                type="button"
                onClick={() => setShowAI(!showAI)}
                className="mb-6 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-200/60 transition-all flex items-center gap-2.5 active:scale-95"
            >
                <Sparkles className="w-5 h-5" />
                Fill with AI
            </button>

            {showAI && <AIExtractor onExtract={handleAIExtract} onClose={() => setShowAI(false)} />}

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
                        Basic Info
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                placeholder="Enter recipe name"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none resize-none"
                                placeholder="Brief description of your recipe"
                            />
                        </div>

                        {/* Meal Types - Multi-select */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Meal Types</label>
                            <div className="flex flex-wrap gap-2">
                                {MEAL_TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => toggleMealType(t.value)}
                                        className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${formData.mealTypes.includes(t.value)
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Servings</label>
                            <input
                                type="number"
                                name="servings"
                                value={formData.servings}
                                onChange={handleChange}
                                required
                                min={1}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (min)</label>
                            <input
                                type="number"
                                name="prepTime"
                                value={formData.prepTime}
                                onChange={handleChange}
                                required
                                min={0}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cook Time (min)</label>
                            <input
                                type="number"
                                name="cookTime"
                                value={formData.cookTime}
                                onChange={handleChange}
                                required
                                min={0}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories (per serving)</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories || ''}
                                onChange={handleChange}
                                min={0}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL</label>
                            <input
                                type="url"
                                name="sourceUrl"
                                value={formData.sourceUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                placeholder="Original recipe URL"
                            />
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full" />
                        Ingredients
                    </h2>
                    <div className="space-y-3">
                        {formData.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={ing.amount}
                                    onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                                    placeholder="Amt"
                                    className="w-20 px-3 py-3 rounded-2xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none text-sm"
                                />
                                <input
                                    value={ing.unit}
                                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                                    placeholder="Unit"
                                    className="w-24 px-3 py-3 rounded-2xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none text-sm"
                                />
                                <input
                                    value={ing.name}
                                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                    placeholder="Ingredient name"
                                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(idx)}
                                    disabled={formData.ingredients.length === 1}
                                    className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center active:scale-95"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-4 px-4 py-2.5 rounded-2xl text-emerald-600 hover:bg-emerald-50 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Ingredient
                    </button>
                </div>

                {/* Instructions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                        Instructions
                    </h2>
                    <div className="space-y-4">
                        {formData.instructions.map((inst, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md shadow-orange-200/50">
                                    {idx + 1}
                                </div>
                                <textarea
                                    value={inst}
                                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                                    placeholder={`Step ${idx + 1}`}
                                    rows={2}
                                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none resize-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeInstruction(idx)}
                                    disabled={formData.instructions.length === 1}
                                    className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center active:scale-95"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addInstruction}
                        className="mt-4 px-4 py-2.5 rounded-2xl text-emerald-600 hover:bg-emerald-50 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Step
                    </button>
                </div>

                {/* Tags */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                        Tags
                    </h2>
                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-50/80 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center text-red-500 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                            placeholder="Add a tag (e.g., vegetarian, quick, comfort food)"
                            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-200/50 transition-all active:scale-95"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-200/60 transition-all flex items-center gap-3 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                {initialData ? 'Update' : 'Save'} Recipe
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}