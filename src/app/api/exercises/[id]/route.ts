import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';
import '@/lib/models/Member'; // Ensure Member model is registered for populate

// GET single exercise
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const exercise = await Exercise.findById(id).populate('member');

        if (!exercise) {
            return NextResponse.json(
                { success: false, error: 'Exercise not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: exercise });
    } catch (error: any) {
        console.error('Error fetching exercise:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch exercise' },
            { status: 500 }
        );
    }
}

// PUT update exercise
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const exercise = await Exercise.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('member');

        if (!exercise) {
            return NextResponse.json(
                { success: false, error: 'Exercise not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: exercise });
    } catch (error: any) {
        console.error('Error updating exercise:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update exercise' },
            { status: 500 }
        );
    }
}

// DELETE exercise
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const exercise = await Exercise.findByIdAndDelete(id);

        if (!exercise) {
            return NextResponse.json(
                { success: false, error: 'Exercise not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: exercise });
    } catch (error: any) {
        console.error('Error deleting exercise:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete exercise' },
            { status: 500 }
        );
    }
}

