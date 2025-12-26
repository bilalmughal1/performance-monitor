import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-oauth";

export async function GET(
    req: Request,
    context: { params: Promise<{ service: string }> }
) {
    try {
        const params = await context.params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const service = params.service as 'analytics' | 'searchConsole' | 'ads';

        if (!['analytics', 'searchConsole', 'ads'].includes(service)) {
            return NextResponse.json({ error: "Invalid service" }, { status: 400 });
        }

        // Check environment variables
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_BASE_URL) {
            console.error('Missing OAuth credentials in connect route');
            return NextResponse.json({
                error: "OAuth not configured. Please contact support."
            }, { status: 500 });
        }

        const authUrl = getAuthUrl(service, userId);

        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('OAuth connect error:', error);
        return NextResponse.json({
            error: "Failed to initiate OAuth flow",
            details: error.message
        }, { status: 500 });
    }
}
