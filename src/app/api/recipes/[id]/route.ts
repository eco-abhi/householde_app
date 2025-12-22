import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';

// GET single recipe by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: recipe });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recipe' },
            { status: 500 }
        );
    }
}

// PUT update a recipe
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();

        const recipe = await Recipe.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: recipe });
    } catch (error) {
        console.error('Error updating recipe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update recipe' },
            { status: 500 }
        );
    }
}

// DELETE a recipe
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const recipe = await Recipe.findByIdAndDelete(id);

        if (!recipe) {
            return NextResponse.json(
                { success: false, error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete recipe' },
            { status: 500 }
        );
    }
}

