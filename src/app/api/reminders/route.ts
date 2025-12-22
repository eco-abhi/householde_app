import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';

// GET all reminders
export async function GET() {
    try {
        await connectToDatabase();
        const reminders = await Reminder.find().sort({ dueDate: 1 });
        return NextResponse.json({ success: true, data: reminders });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reminders' },
            { status: 500 }
        );
    }
}

// POST create a new reminder
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const reminder = await Reminder.create(body);
        return NextResponse.json({ success: true, data: reminder }, { status: 201 });
    } catch (error) {
        console.error('Error creating reminder:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create reminder' },
            { status: 500 }
        );
    }
}

