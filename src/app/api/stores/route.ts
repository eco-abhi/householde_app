import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// GET all stores
export async function GET() {
    try {
        await connectToDatabase();
        const stores = await Store.find().sort({ name: 1 });
        return NextResponse.json({ success: true, data: stores });
    } catch (error) {
        console.error('Error fetching stores:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stores' },
            { status: 500 }
        );
    }
}

// POST create a new store
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const store = await Store.create(body);
        return NextResponse.json({ success: true, data: store }, { status: 201 });
    } catch (error) {
        console.error('Error creating store:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create store' },
            { status: 500 }
        );
    }
}

