import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { pin } = await request.json();

        // Validate PIN against environment variable
        if (pin === process.env.HOUSEHOLD_PIN) {
            const cookieStore = await cookies();

            // Set secure auth cookie (valid for 30 days)
            // SameSite=none is required for iframe/cross-origin contexts
            cookieStore.set('household-auth', process.env.AUTH_SECRET!, {
                httpOnly: true,
                secure: true, // Always secure for SameSite=none
                sameSite: 'none', // Allow cross-origin (required for iframes)
                maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        // Invalid PIN
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

