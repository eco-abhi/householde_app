import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// GET single store
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const store = await Store.findById(id);

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error('Error fetching store:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch store' },
            { status: 500 }
        );
    }
}

// PUT update store
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const store = await Store.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error('Error updating store:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update store' },
            { status: 500 }
        );
    }
}

// DELETE store
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const store = await Store.findByIdAndDelete(id);

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting store:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete store' },
            { status: 500 }
        );
    }
}

