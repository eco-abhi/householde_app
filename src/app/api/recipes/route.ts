import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';

// GET all recipes or filter by meal type / ingredients
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('Database connection failed:', dbError);
        return NextResponse.json(
            { success: false, error: 'Database connection failed. Make sure MongoDB is running.' },
            { status: 503 }
        );
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const mealType = searchParams.get('mealType');
        const ingredients = searchParams.get('ingredients');
        const search = searchParams.get('search');

        const query: Record<string, unknown> = {};

        // Filter by meal type - now searches in mealTypes array
        if (mealType && mealType !== 'all') {
            query.mealTypes = mealType;
        }

        if (ingredients) {
            const ingredientList = ingredients.split(',').map((i) => i.trim().toLowerCase());
            query['ingredients.name'] = {
                $regex: ingredientList.join('|'),
                $options: 'i',
            };
        }

        if (search) {
            query.$text = { $search: search };
        }

        const recipes = await Recipe.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recipes' },
            { status: 500 }
        );
    }
}

// POST create a new recipe
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('Database connection failed:', dbError);
        return NextResponse.json(
            { success: false, error: 'Database connection failed. Make sure MongoDB is running.' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();

        const recipe = await Recipe.create(body);

        return NextResponse.json({ success: true, data: recipe }, { status: 201 });
    } catch (error) {
        console.error('Error creating recipe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create recipe' },
            { status: 500 }
        );
    }
}
