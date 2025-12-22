import mongoose, { Schema, Document, Model } from 'mongoose';

export type RecurrenceType =
    | 'none'
    | 'daily'
    | 'every_other_day'
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly';

export interface IReminder extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    dueDate: Date;
    completed: boolean;
    completedAt?: Date;
    recurrence: RecurrenceType;
    category: 'replace' | 'maintenance' | 'general';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
    {
        title: {
            type: String,
            required: [true, 'Reminder title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
        recurrence: {
            type: String,
            enum: ['none', 'daily', 'every_other_day', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
            default: 'none',
        },
        category: {
            type: String,
            enum: ['replace', 'maintenance', 'general'],
            default: 'general',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
    }
);

// Helper method to calculate next due date based on recurrence
ReminderSchema.methods.getNextDueDate = function (): Date | null {
    if (this.recurrence === 'none') return null;

    const currentDue = new Date(this.dueDate);

    switch (this.recurrence) {
        case 'daily':
            currentDue.setDate(currentDue.getDate() + 1);
            break;
        case 'every_other_day':
            currentDue.setDate(currentDue.getDate() + 2);
            break;
        case 'weekly':
            currentDue.setDate(currentDue.getDate() + 7);
            break;
        case 'biweekly':
            currentDue.setDate(currentDue.getDate() + 14);
            break;
        case 'monthly':
            currentDue.setMonth(currentDue.getMonth() + 1);
            break;
        case 'quarterly':
            currentDue.setMonth(currentDue.getMonth() + 3);
            break;
        case 'yearly':
            currentDue.setFullYear(currentDue.getFullYear() + 1);
            break;
    }

    return currentDue;
};

const Reminder: Model<IReminder> = mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);

export default Reminder;

