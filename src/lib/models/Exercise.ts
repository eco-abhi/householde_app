import mongoose, { Schema, Document, Model } from 'mongoose';

export type BodyPart = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio' | 'full_body';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface IExercise extends Document {
    _id: mongoose.Types.ObjectId;
    member: mongoose.Types.ObjectId;
    name: string;
    bodyPart: BodyPart;
    dayOfWeek?: DayOfWeek; // Optional - exercises can be in library without a day
    sets?: number;
    reps?: string;
    weight?: string;
    duration?: string;
    notes?: string;
    link?: string;
    completed?: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: [true, 'Member is required'],
        },
        name: {
            type: String,
            required: [true, 'Exercise name is required'],
            trim: true,
        },
        bodyPart: {
            type: String,
            enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body'],
            required: [true, 'Body part is required'],
        },
        dayOfWeek: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: false, // Optional - exercises can be in library without a day
        },
        sets: {
            type: Number,
        },
        reps: {
            type: String,
            trim: true,
        },
        weight: {
            type: String,
            trim: true,
        },
        duration: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        link: {
            type: String,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Delete existing model to avoid OverwriteModelError in development
if (mongoose.models.Exercise) {
    delete mongoose.models.Exercise;
}

const Exercise: Model<IExercise> = mongoose.model<IExercise>('Exercise', ExerciseSchema);

export default Exercise;

