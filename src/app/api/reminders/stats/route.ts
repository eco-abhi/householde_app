import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';
import '@/lib/models/Member'; // Ensure Member model is registered

export async function GET() {
    try {
        await connectToDatabase();

        // Get all completed reminders with assignees
        const completedReminders = await Reminder.find({ completed: true })
            .populate('assignee')
            .select('points assignee completedAt');

        // Calculate points by member
        const pointsByMember: Record<string, {
            memberId: string;
            memberName: string;
            memberColor: string;
            totalPoints: number;
            completedCount: number;
        }> = {};

        completedReminders.forEach((reminder: any) => {
            if (reminder.assignee) {
                const memberId = reminder.assignee._id.toString();
                if (!pointsByMember[memberId]) {
                    pointsByMember[memberId] = {
                        memberId,
                        memberName: reminder.assignee.name,
                        memberColor: reminder.assignee.color,
                        totalPoints: 0,
                        completedCount: 0,
                    };
                }
                pointsByMember[memberId].totalPoints += reminder.points || 0;
                pointsByMember[memberId].completedCount += 1;
            }
        });

        // Convert to array and sort by points
        const stats = Object.values(pointsByMember).sort((a, b) => b.totalPoints - a.totalPoints);

        return NextResponse.json({
            success: true,
            data: stats,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Error fetching reminder stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

