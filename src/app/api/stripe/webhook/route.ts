
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize admin client for webhooks (bypasses RLS)
// Note: This needs to be safe for build time when env vars might be missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        if (!supabaseAdmin) {
            console.error("Supabase Admin not initialized");
            return new NextResponse("Server Config Error", { status: 500 });
        }

        await supabaseAdmin
            .from("profiles")
            .update({
                stripe_customer_id: subscription.customer as string,
                is_pro: true,
                subscription_id: subscription.id,
            })
            .eq("id", session.metadata.userId);
    }

    if (event.type === "invoice.payment_succeeded") {
        if (!supabaseAdmin) return new NextResponse("Server Config Error", { status: 500 });

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();

        if (profile) {
            await supabaseAdmin
                .from("profiles")
                .update({
                    is_pro: true,
                })
                .eq("id", profile.id);
        }
    }

    // Handle cancellations
    if (event.type === "customer.subscription.deleted") {
        if (!supabaseAdmin) return new NextResponse("Server Config Error", { status: 500 });

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();

        if (profile) {
            await supabaseAdmin
                .from("profiles")
                .update({
                    is_pro: false,
                })
                .eq("id", profile.id);
        }
    }

    return new NextResponse(null, { status: 200 });
}
