import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron will send a GET request
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: { persistSession: false },
        }
    );

    // 1. Fetch all sites
    // In a real SaaS, filtering by "Pro" users would happen here.
    // For MVP: We run for everyone (or limit to 50 to avoid timeout).
    const { data: sites, error: sitesErr } = await supabaseAdmin
        .from("sites")
        .select("id, url, user_id")
        .limit(50); // safety limit for single cron execution

    if (sitesErr || !sites) {
        return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
    }

    const results = [];

    // 2. Loop and run PageSpeed
    // We reuse the logic from the main route by calling the PSI API directly here
    // to avoid self-calling overhead, or we can refactor the runner logic.
    // For simplicity/speed in MVP, let's just trigger them or invoke the implementation directly.
    // To keep it clean, we'll implement a simplified runner here.

    const apiKey = process.env.PAGESPEED_API_KEY;

    for (const site of sites) {
        try {
            const strategy = "mobile"; // default to mobile for auto-runs
            const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
                site.url
            )}&strategy=${strategy}&category=performance&category=seo&key=${apiKey}`;

            const resp = await fetch(psiUrl);
            if (!resp.ok) {
                results.push({ site: site.url, status: "failed_psi" });
                continue;
            }

            const psi = await resp.json();

            const performance = Math.round(
                (psi.lighthouseResult?.categories?.performance?.score ?? 0) * 100
            );
            const seo = Math.round(
                (psi.lighthouseResult?.categories?.seo?.score ?? 0) * 100
            );
            const lcp = psi.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? null;
            const cls = psi.lighthouseResult?.audits?.["cumulative-layout-shift"]?.numericValue ?? null;
            // We can grab more metrics if needed

            // 3. Save result
            await supabaseAdmin.from("runs").insert({
                site_id: site.id,
                user_id: site.user_id,
                strategy,
                performance,
                seo,
                lcp,
                cls,
                final_url: psi.lighthouseResult?.finalUrl,
                page_title: psi.lighthouseResult?.finalUrl, // simplified
                raw: psi, // store full result for deep dive
            });

            results.push({ site: site.url, status: "ok", performance });
        } catch (e: any) {
            console.error(`Failed run for ${site.url}`, e);
            results.push({ site: site.url, status: "error", msg: e.message });
        }
    }

    return NextResponse.json({ success: true, ran: results.length, details: results });
}
