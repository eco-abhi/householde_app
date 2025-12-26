import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';
import '@/lib/models/Member';

// PUT update all exercises matching name, bodyPart, and member
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { filter, updates } = await request.json();

        if (!filter?.name || !filter?.bodyPart || !filter?.member) {
            return NextResponse.json(
                { success: false, error: 'Filter with name, bodyPart, and member is required' },
                { status: 400 }
            );
        }

        // Update all exercises matching the filter
        const result = await Exercise.updateMany(filter, { $set: updates });

        // Return updated exercises
        const updatedExercises = await Exercise.find(filter).populate('member');

        return NextResponse.json({ 
            success: true, 
            data: updatedExercises,
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error('❌ [API] Error bulk updating exercises:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update exercises' },
            { status: 500 }
        );
    }
}

