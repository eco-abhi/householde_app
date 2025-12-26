import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';
import Member from '@/lib/models/Member'; // Import Member model for populate

// GET all reminders
export async function GET() {
    try {
        await connectToDatabase();
        const reminders = await Reminder.find().populate('assignee').sort({ dueDate: 1 });
        return NextResponse.json({ success: true, data: reminders });
    } catch (error: any) {
        console.error('======= Error fetching reminders =======');
        console.error('Error:', error);
        console.error('Message:', error.message);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch reminders' },
            { status: 500 }
        );
    }
}

// POST create a new reminder
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Handle empty assignee string
        if (body.assignee === '' || body.assignee === null || body.assignee === undefined) {
            delete body.assignee;
        }

        const reminder = await Reminder.create(body);

        // Populate assignee if it exists
        if (reminder.assignee) {
            await reminder.populate('assignee');
        }

        return NextResponse.json({ success: true, data: reminder }, { status: 201 });
    } catch (error: any) {
        console.error('======= Error creating reminder =======');
        console.error('Error:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create reminder' },
            { status: 500 }
        );
    }
}

