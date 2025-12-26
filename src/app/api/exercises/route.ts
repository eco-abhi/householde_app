import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';
import '@/lib/models/Member'; // Ensure Member model is registered for populate

// GET all exercises
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');
        const dayOfWeek = searchParams.get('dayOfWeek');

        const query: Record<string, unknown> = {};
        if (memberId) query.member = memberId;
        if (dayOfWeek) query.dayOfWeek = dayOfWeek;

        const exercises = await Exercise.find(query)
            .populate('member')
            .sort({ dayOfWeek: 1, order: 1 });

        return NextResponse.json({ success: true, data: exercises });
    } catch (error: any) {
        console.error('❌ [API] Error fetching exercises:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch exercises' },
            { status: 500 }
        );
    }
}

// POST create new exercise
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // If dayOfWeek is not provided or is empty, remove it to save to library
        if (!body.dayOfWeek) {
            delete body.dayOfWeek;
        }

        const exercise = await Exercise.create(body);
        await exercise.populate('member');

        return NextResponse.json({ success: true, data: exercise }, { status: 201 });
    } catch (error: any) {
        console.error('❌ [API] Error creating exercise:', error);
        console.error('❌ [API] Error details:', error.message);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create exercise' },
            { status: 500 }
        );
    }
}

