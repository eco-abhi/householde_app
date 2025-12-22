import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// POST add item to store
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const store = await Store.findByIdAndUpdate(
            id,
            { $push: { items: body } },
            { new: true, runValidators: true }
        );

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add item' },
            { status: 500 }
        );
    }
}

// PUT toggle item checked status or update item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { itemId, checked, name, quantity } = await request.json();

        const updateFields: Record<string, unknown> = {};
        if (typeof checked === 'boolean') {
            updateFields['items.$.checked'] = checked;
        }
        if (name !== undefined) {
            updateFields['items.$.name'] = name;
        }
        if (quantity !== undefined) {
            updateFields['items.$.quantity'] = quantity;
        }

        const store = await Store.findOneAndUpdate(
            { _id: id, 'items._id': itemId },
            { $set: updateFields },
            { new: true }
        );

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store or item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

// DELETE remove item from store
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { itemId } = await request.json();

        const store = await Store.findByIdAndUpdate(
            id,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error('Error removing item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove item' },
            { status: 500 }
        );
    }
}

