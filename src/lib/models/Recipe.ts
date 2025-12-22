import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecipe extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert')[];
    ingredients: {
        name: string;
        amount: string;
        unit: string;
    }[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    calories?: number;
    imageUrl?: string;
    sourceUrl?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
    {
        title: {
            type: String,
            required: [true, 'Please provide a recipe title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a recipe description'],
            trim: true,
        },
        mealTypes: [{
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
        }],
        ingredients: [
            {
                name: { type: String, required: true },
                amount: { type: String, required: true },
                unit: { type: String, default: '' },
            },
        ],
        instructions: [{ type: String, required: true }],
        prepTime: {
            type: Number,
            required: [true, 'Please provide prep time in minutes'],
            min: 0,
        },
        cookTime: {
            type: Number,
            required: [true, 'Please provide cook time in minutes'],
            min: 0,
        },
        servings: {
            type: Number,
            required: [true, 'Please provide number of servings'],
            min: 1,
        },
        calories: {
            type: Number,
            min: 0,
        },
        imageUrl: {
            type: String,
            default: '',
        },
        sourceUrl: {
            type: String,
            default: '',
        },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

// Create text index for search functionality
RecipeSchema.index({
    title: 'text',
    description: 'text',
    'ingredients.name': 'text',
    tags: 'text'
});

const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
