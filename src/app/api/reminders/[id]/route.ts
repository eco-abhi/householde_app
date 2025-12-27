import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';
import '@/lib/models/Member'; // Ensure Member model is registered for populate

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
        const reminder = await Reminder.findById(id).populate('assignee');

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

// PUT update reminder (including complete with auto-clone for recurring)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        // Handle empty assignee string
        if (body.assignee === '' || body.assignee === null || body.assignee === undefined) {
            delete body.assignee;
        }

        // If marking as completed and has recurrence, clone it
        if (body.completed === true) {
            const existingReminder = await Reminder.findById(id);

            if (existingReminder && existingReminder.recurrence !== 'none') {
                // Mark the current reminder as completed
                body.completedAt = new Date();
                
                // Update the existing reminder
                await Reminder.findByIdAndUpdate(id, body, {
                    new: true,
                    runValidators: true,
                });

                // Calculate next due date from today
                const nextDue = getNextDueDate(new Date(), existingReminder.recurrence);

                // Create a new reminder (clone) with next due date
                const newReminder = await Reminder.create({
                    title: existingReminder.title,
                    description: existingReminder.description,
                    dueDate: nextDue,
                    completed: false,
                    recurrence: existingReminder.recurrence,
                    category: existingReminder.category,
                    priority: existingReminder.priority,
                    assignee: existingReminder.assignee,
                });

                // Populate assignee if it exists
                if (newReminder.assignee) {
                    await newReminder.populate('assignee');
                }

                // Return the new reminder (the one that's still pending)
                return NextResponse.json({ success: true, data: newReminder });
            } else {
                // Non-recurring reminder, just mark as completed
                body.completedAt = new Date();
            }
        }

        // Regular update (non-completion or non-recurring)
        let reminder = await Reminder.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!reminder) {
            return NextResponse.json(
                { success: false, error: 'Reminder not found' },
                { status: 404 }
            );
        }

        // Populate assignee if it exists
        if (reminder.assignee) {
            await reminder.populate('assignee');
        }

        return NextResponse.json({ success: true, data: reminder });
    } catch (error: any) {
        console.error('Error updating reminder:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update reminder' },
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

