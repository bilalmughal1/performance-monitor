import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-oauth";
import { createClient } from "@supabase/supabase-js";

// Build-safe Supabase initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=missing_params`
        );
    }

    try {
        if (!supabaseAdmin) {
            throw new Error("Supabase not configured");
        }

        const { siteId, userId, service } = JSON.parse(state);

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            throw new Error("Failed to get tokens");
        }

        // Store tokens in database with site_id
        await supabaseAdmin
            .from('google_integrations')
            .upsert({
                user_id: userId,
                site_id: siteId,
                service,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
                scope: tokens.scope,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'site_id,service'
            });

        // Redirect back to site detail page
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/sites/${siteId}?success=${service}`
        );
    } catch (error: any) {
        console.error("OAuth callback error:", error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent(error.message)}`
        );
    }
}
