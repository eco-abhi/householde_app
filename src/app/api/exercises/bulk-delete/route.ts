import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Exercise from '@/lib/models/Exercise';

// DELETE all exercises matching name, bodyPart, and member
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { name, bodyPart, member } = await request.json();

        if (!name || !bodyPart || !member) {
            return NextResponse.json(
                { success: false, error: 'Name, bodyPart, and member are required' },
                { status: 400 }
            );
        }

        // Delete all exercises matching these criteria
        const result = await Exercise.deleteMany({ name, bodyPart, member });

        return NextResponse.json({ 
            success: true, 
            data: { deletedCount: result.deletedCount }
        });
    } catch (error: any) {
        console.error('❌ [API] Error bulk deleting exercises:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete exercises' },
            { status: 500 }
        );
    }
}

