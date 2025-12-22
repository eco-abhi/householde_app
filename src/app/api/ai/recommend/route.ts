import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { ingredients, mealType, preferences } = body;

        // First, get all recipes from the database
        // Filter by mealTypes array if specified
        const allRecipes = await Recipe.find(
            mealType && mealType !== 'all' ? { mealTypes: mealType } : {}
        ).lean();

        if (allRecipes.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    recommendations: [],
                    suggestions: [],
                    message: 'No recipes found in database. Add some recipes first!',
                },
            });
        }

        // Use AI to rank and recommend recipes based on available ingredients
        const recipeSummaries = allRecipes.map((r) => ({
            id: r._id.toString(),
            title: r.title,
            ingredients: r.ingredients.map((i: { name: string }) => i.name).join(', '),
            mealTypes: r.mealTypes,
        }));

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful chef assistant. Given a list of available ingredients and recipes, recommend the best recipes that can be made. 
          
Return a JSON object with:
- "recommendations": array of recipe IDs that can be made with available ingredients, ordered by best match
- "suggestions": array of objects with {recipeId, missingIngredients: []} for recipes that need just a few more ingredients
- "tips": optional cooking tips based on available ingredients

Always return valid JSON.`,
                },
                {
                    role: 'user',
                    content: `Available ingredients: ${ingredients.join(', ')}
${preferences ? `Preferences: ${preferences}` : ''}

Available recipes:
${JSON.stringify(recipeSummaries, null, 2)}

Which recipes can I make or almost make?`,
                },
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;
        const aiResponse = responseText ? JSON.parse(responseText) : { recommendations: [], suggestions: [] };

        // Get full recipe details for recommendations
        const recommendedRecipes = allRecipes.filter((r) =>
            aiResponse.recommendations?.includes(r._id.toString())
        );

        const suggestedRecipes = aiResponse.suggestions?.map((s: { recipeId: string; missingIngredients: string[] }) => {
            const recipe = allRecipes.find((r) => r._id.toString() === s.recipeId);
            return recipe ? { ...recipe, missingIngredients: s.missingIngredients } : null;
        }).filter(Boolean);

        return NextResponse.json({
            success: true,
            data: {
                recommendations: recommendedRecipes,
                suggestions: suggestedRecipes || [],
                tips: aiResponse.tips,
            },
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);

        // Fallback: return recipes based on simple ingredient matching
        try {
            await connectToDatabase();
            const body = await request.json();
            const { mealType } = body;

            const query: Record<string, unknown> = {};
            if (mealType && mealType !== 'all') {
                query.mealTypes = mealType;
            }

            const recipes = await Recipe.find(query).limit(10);

            return NextResponse.json({
                success: true,
                data: {
                    recommendations: recipes,
                    suggestions: [],
                    message: 'AI recommendations unavailable, showing recent recipes',
                },
            });
        } catch {
            return NextResponse.json(
                { success: false, error: 'Failed to get recommendations' },
                { status: 500 }
            );
        }
    }
}
