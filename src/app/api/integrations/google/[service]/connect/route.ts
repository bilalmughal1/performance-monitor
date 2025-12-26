import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-oauth";
import { createClient } from "@supabase/supabase-js";

export async function GET(
    req: Request,
    context: { params: Promise<{ service: string }> }
) {
    try {
        const params = await context.params;
        const { searchParams } = new URL(req.url);
        const siteId = searchParams.get('siteId');
        const userId = searchParams.get('userId');

        if (!siteId || !userId) {
            return NextResponse.json({
                error: "Site ID and User ID required"
            }, { status: 400 });
        }

        const service = params.service as 'analytics' | 'searchConsole' | 'ads';

        if (!['analytics', 'searchConsole', 'ads'].includes(service)) {
            return NextResponse.json({ error: "Invalid service" }, { status: 400 });
        }

        // Verify user owns this site
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data: site } = await supabase
                .from('sites')
                .select('*')
                .eq('id', siteId)
                .eq('user_id', userId)
                .single();

            if (!site) {
                return NextResponse.json({
                    error: "Unauthorized - site not found or access denied"
                }, { status: 403 });
            }
        }

        // Check environment variables
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_BASE_URL) {
            console.error('Missing OAuth credentials in connect route');
            return NextResponse.json({
                error: "OAuth not configured. Please contact support."
            }, { status: 500 });
        }

        const authUrl = getAuthUrl(service, siteId, userId);

        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('OAuth connect error:', error);
        return NextResponse.json({
            error: "Failed to initiate OAuth flow",
            details: error.message
        }, { status: 500 });
    }
}
