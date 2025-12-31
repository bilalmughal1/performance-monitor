import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PsiResponse = {
  lighthouseResult?: {
    categories?: {
      [key: string]: {
        score: number;
      };
    };
    audits?: {
      [key: string]: {
        numericValue: number;
      };
    };
    finalUrl?: string;
    lighthouseVersion?: string;
  };
  loadingExperience?: {
    metrics?: {
      INTERACTION_TO_NEXT_PAINT?: {
        percentile: number;
      };
    };
  };
  originLoadingExperience?: {
    metrics?: {
      INTERACTION_TO_NEXT_PAINT?: {
        percentile: number;
      };
    };
  };
  id?: string;
};

function normalizeUrl(input: string) {
  const raw = input.trim();
  if (!raw) return null;

  try {
    const withScheme =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`;
    const u = new URL(withScheme);
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function getCategoryScore(psi: PsiResponse, key: string) {
  const v = psi?.lighthouseResult?.categories?.[key]?.score;
  if (typeof v !== "number") return null;
  return Math.round(v * 100);
}

function getLabMs(psi: PsiResponse, auditId: string) {
  const v = psi?.lighthouseResult?.audits?.[auditId]?.numericValue;
  return typeof v === "number" ? v : null;
}

function getFieldInpP75Ms(psi: PsiResponse) {
  const v =
    psi?.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile ??
    psi?.originLoadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT
      ?.percentile;

  return typeof v === "number" ? v : null;
}

function getPageTitle(psi: PsiResponse) {
  return psi?.lighthouseResult?.finalUrl
    ? psi.lighthouseResult.finalUrl
    : psi?.id ?? null;
}

function getFinalUrl(psi: PsiResponse) {
  const urlFromResult = psi?.lighthouseResult?.finalUrl;
  if (typeof urlFromResult === "string") return urlFromResult;
  if (typeof psi?.id === "string") return psi.id;
  return null;
}

function getLighthouseVersion(psi: PsiResponse) {
  return psi?.lighthouseResult?.lighthouseVersion ?? null;
}

export async function POST(req: Request) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing PAGESPEED_API_KEY" },
      { status: 500 }
    );
  }

  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json(
      { error: "Missing Supabase server env vars" },
      { status: 500 }
    );
  }

  interface RequestBody {
    siteId?: string;
    url?: string;
    strategy?: string;
  }

  let body: RequestBody = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const siteId = String(body.siteId || "");
  const url = String(body.url || "");
  const strategy = String(body.strategy || "");

  if (!siteId || !url || !strategy) {
    return NextResponse.json(
      { error: "siteId, url, strategy required" },
      { status: 400 }
    );
  }

  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (strategy !== "mobile" && strategy !== "desktop") {
    return NextResponse.json(
      { error: "strategy must be mobile or desktop" },
      { status: 400 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization" },
      { status: 401 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  const token = authHeader.slice("Bearer ".length);
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(
    token
  );

  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userData.user.id;

  // simple per-user rate limit: 30 runs in the past hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentRuns, error: recentErr } = await supabaseAdmin
    .from("runs")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if (recentErr) {
    return NextResponse.json(
      { error: "Failed to check rate limit", details: recentErr.message },
      { status: 500 }
    );
  }

  if (recentRuns?.length >= 30) {
    return NextResponse.json(
      { error: "Rate limit exceeded, try again in a bit" },
      { status: 429 }
    );
  }

  const psiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(normalizedUrl)}` +
    `&strategy=${encodeURIComponent(strategy)}` +
    `&category=performance&category=seo&category=accessibility&category=best-practices` +
    `&key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let resp: Response;
  try {
    resp = await fetch(psiUrl, { method: "GET", signal: controller.signal });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "PageSpeed API timeout" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "PageSpeed API request failed", details: String(err) },
      { status: 502 }
    );
  }
  clearTimeout(timeout);

  const rawText = await resp.text();
  if (!resp.ok) {
    return NextResponse.json(
      { error: "PageSpeed API failed", details: rawText.slice(0, 2000) },
      { status: 502 }
    );
  }

  let psi: PsiResponse;
  try {
    psi = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "PageSpeed returned non JSON", details: rawText.slice(0, 2000) },
      { status: 502 }
    );
  }

  const performance = getCategoryScore(psi, "performance");
  const seo = getCategoryScore(psi, "seo");
  const accessibility = getCategoryScore(psi, "accessibility");
  const bestPractices = getCategoryScore(psi, "best-practices");

  const lcp = getLabMs(psi, "largest-contentful-paint");
  const cls = getLabMs(psi, "cumulative-layout-shift");

  const inpLabMs = getLabMs(psi, "interaction-to-next-paint");
  const inpFieldP75Ms = getFieldInpP75Ms(psi);

  const finalUrl = getFinalUrl(psi);
  const title = getPageTitle(psi);
  const lighthouseVersion = getLighthouseVersion(psi);

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("runs")
    .insert({
      site_id: siteId,
      user_id: userId,
      strategy,
      performance,
      seo,
      accessibility,
      best_practices: bestPractices,
      lcp,
      cls,
      inp_lab_ms: inpLabMs,
      inp_field_p75_ms: inpFieldP75Ms,
      final_url: finalUrl,
      page_title: title,
      lighthouse_version: lighthouseVersion,
      raw: psi,
    })
    .select("*")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // cleanup, keep latest 50 per site per strategy
  const { data: oldRuns } = await supabaseAdmin
    .from("runs")
    .select("id")
    .eq("site_id", siteId)
    .eq("strategy", strategy)
    .order("created_at", { ascending: false })
    .range(50, 1000);

  if (oldRuns && oldRuns.length > 0) {
    const ids = oldRuns.map((r) => r.id);
    await supabaseAdmin.from("runs").delete().in("id", ids);
  }

  return NextResponse.json({ run: inserted });
}
