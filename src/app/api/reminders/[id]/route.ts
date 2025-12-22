import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';

// Helper to calculate next due date
function getNextDueDate(currentDue: Date, recurrence: string): Date {
    const nextDue = new Date(currentDue);

    switch (recurrence) {
        case 'daily':
            nextDue.setDate(nextDue.getDate() + 1);
            break;
        case 'every_other_day':
            nextDue.setDate(nextDue.getDate() + 2);
            break;
        case 'weekly':
            nextDue.setDate(nextDue.getDate() + 7);
            break;
        case 'biweekly':
            nextDue.setDate(nextDue.getDate() + 14);
            break;
        case 'monthly':
            nextDue.setMonth(nextDue.getMonth() + 1);
            break;
        case 'quarterly':
            nextDue.setMonth(nextDue.getMonth() + 3);
            break;
        case 'yearly':
            nextDue.setFullYear(nextDue.getFullYear() + 1);
            break;
    }

    return nextDue;
}

// GET single reminder
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const reminder = await Reminder.findById(id);

        if (!reminder) {
            return NextResponse.json(
                { success: false, error: 'Reminder not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: reminder });
    } catch (error) {
        console.error('Error fetching reminder:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reminder' },
            { status: 500 }
        );
    }
}

// PUT update reminder (including complete with auto-renew)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        // If marking as completed and has recurrence, auto-renew
        if (body.completed === true) {
            const existingReminder = await Reminder.findById(id);

            if (existingReminder && existingReminder.recurrence !== 'none') {
                // Calculate next due date from today (not from old due date)
                const nextDue = getNextDueDate(new Date(), existingReminder.recurrence);

                body.completed = false;
                body.dueDate = nextDue;
                body.completedAt = undefined;
            } else {
                body.completedAt = new Date();
            }
        }

        const reminder = await Reminder.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!reminder) {
            return NextResponse.json(
                { success: false, error: 'Reminder not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: reminder });
    } catch (error) {
        console.error('Error updating reminder:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update reminder' },
            { status: 500 }
        );
    }
}

// DELETE reminder
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const reminder = await Reminder.findByIdAndDelete(id);

        if (!reminder) {
            return NextResponse.json(
                { success: false, error: 'Reminder not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete reminder' },
            { status: 500 }
        );
    }
}

