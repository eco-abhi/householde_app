import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShoppingItem {
    _id: mongoose.Types.ObjectId;
    name: string;
    quantity?: string;
    checked: boolean;
    createdAt: Date;
}

export interface IStore extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    color: string;
    event: string;
    items: IShoppingItem[];
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingItemSchema = new Schema<IShoppingItem>(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
        },
        quantity: {
            type: String,
            trim: true,
        },
        checked: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

const StoreSchema = new Schema<IStore>(
    {
        name: {
            type: String,
            required: [true, 'Store name is required'],
            trim: true,
            unique: true,
        },
        color: {
            type: String,
            default: '#059669', // emerald-600
        },
        event: {
            type: String,
            default: 'General',
            trim: true,
        },
        items: [ShoppingItemSchema],
    },
    {
        timestamps: true,
    }
);

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);

export default Store;

