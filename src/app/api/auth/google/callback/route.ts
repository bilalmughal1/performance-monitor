import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-oauth";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

        let parsed: { siteId: string; userId: string; service: 'analytics' | 'searchConsole' | 'ads' };

        if (process.env.GOOGLE_STATE_SECRET) {
            try {
                const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
                const { payload, sig } = decoded as { payload: string; sig: string };
                const expected = crypto
                    .createHmac("sha256", process.env.GOOGLE_STATE_SECRET)
                    .update(payload)
                    .digest("hex");
                if (expected !== sig) {
                    throw new Error("Invalid state signature");
                }
                parsed = JSON.parse(payload);
            } catch {
                throw new Error("Invalid state");
            }
        } else {
            parsed = JSON.parse(state);
        }

        const { siteId, userId, service } = parsed;

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
    } catch (error: unknown) {
        console.error("OAuth callback error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=${encodeURIComponent(errorMessage)}`
        );
    }
}
