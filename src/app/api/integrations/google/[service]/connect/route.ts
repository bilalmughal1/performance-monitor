import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-oauth";

export async function GET(
    req: Request,
    context: { params: Promise<{ service: string }> }
) {
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

    const authUrl = getAuthUrl(service, userId);

    return NextResponse.redirect(authUrl);
}
