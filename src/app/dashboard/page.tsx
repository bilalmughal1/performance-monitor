"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BusinessImpactCard } from "./business-impact";

type SiteRow = {
  id: string;
  user_id: string;
  url: string;
  name: string | null;
  created_at: string;
};

type RunRow = {
  id: string;
  site_id: string;
  user_id: string;
  strategy: string;
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  best_practices: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  inp_lab_ms: number | null;
  inp_field_p75_ms: number | null;
  status?: string | null;
  error_message?: string | null;
  final_url?: string | null;
  page_title?: string | null;
  created_at: string;
};

function normalizeUrl(input: string) {
  const raw = input.trim();
  if (!raw) return null;

  // allow users to paste without scheme
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const u = new URL(withScheme);

    // only allow http/https
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    // must have hostname like example.com
    if (!u.hostname) return null;

    // remove hash
    u.hash = "";

    return u.toString();
  } catch {
    return null;
  }
}

type Strategy = "mobile" | "desktop";
type InpSource = "lab" | "field p75" | null;

function fmtNum(v: number | null, digits = 2) {
  if (v === null || typeof v !== "number" || Number.isNaN(v)) return "NA";
  const p = Math.pow(10, digits);
  return String(Math.round(v * p) / p);
}

function getInpDisplay(run: RunRow): { v: number | null; src: InpSource } {
  if (
    typeof run.inp_lab_ms === "number" &&
    !Number.isNaN(run.inp_lab_ms)
  ) {
    return { v: run.inp_lab_ms, src: "lab" };
  }

  if (
    typeof run.inp_field_p75_ms === "number" &&
    !Number.isNaN(run.inp_field_p75_ms)
  ) {
    return { v: run.inp_field_p75_ms, src: "field p75" };
  }

  if (typeof run.inp === "number" && !Number.isNaN(run.inp)) {
    return { v: run.inp, src: null };
  }

  return { v: null, src: null };
}

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [runningSiteId, setRunningSiteId] = useState<string>("");
  const [deletingSiteId, setDeletingSiteId] = useState<string>("");

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [runsBySite, setRunsBySite] = useState<Record<string, RunRow[]>>({});

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [addPreview, setAddPreview] = useState("");

  const [savingSite, setSavingSite] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [editingSiteId, setEditingSiteId] = useState("");
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const siteCount = useMemo(() => sites.length, [sites]);
  const noSites = !loading && sites.length === 0;

  const flatRuns = useMemo(() => {
    return Object.values(runsBySite).flat();
  }, [runsBySite]);

  const last7dISO = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), []);

  const totalRunsLast7 = useMemo(
    () => flatRuns.filter((r) => r.created_at >= last7dISO).length,
    [flatRuns, last7dISO]
  );

  const avgPerfLast7 = useMemo(() => {
    const subset = flatRuns.filter((r) => r.created_at >= last7dISO && typeof r.performance === "number");
    if (!subset.length) return null;
    return subset.reduce((acc, r) => acc + (r.performance ?? 0), 0) / subset.length;
  }, [flatRuns, last7dISO]);

  const worstSiteLast7 = useMemo(() => {
    const map: Record<string, { perf: number; count: number }> = {};
    flatRuns.forEach((r) => {
      if (r.created_at < last7dISO) return;
      if (typeof r.performance !== "number") return;
      if (!map[r.site_id]) map[r.site_id] = { perf: 0, count: 0 };
      map[r.site_id].perf += r.performance;
      map[r.site_id].count += 1;
    });
    const entries = Object.entries(map).map(([site_id, v]) => ({
      site_id,
      avg: v.count ? v.perf / v.count : 0,
    }));
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b.avg < a.avg ? b : a));
  }, [flatRuns, last7dISO]);

  const lastRunTime = useMemo(() => {
    const sorted = [...flatRuns].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted[0]?.created_at ?? null;
  }, [flatRuns]);

  function hostnameFromUrl(u?: string | null) {
    if (!u) return "";
    try {
      return new URL(u).hostname;
    } catch {
      return "";
    }
  }

  function metricStatus(metric: "lcp" | "inp" | "cls" | "perf", value: number | null) {
    if (value === null || Number.isNaN(value)) return { label: "NA", className: "text-zinc-400 border-zinc-700" };
    if (metric === "lcp") {
      if (value <= 2500) return { label: "good", className: "text-emerald-300 border-emerald-500/50" };
      if (value <= 4000) return { label: "needs improvement", className: "text-amber-300 border-amber-500/50" };
      return { label: "poor", className: "text-red-300 border-red-500/50" };
    }
    if (metric === "inp") {
      if (value <= 200) return { label: "good", className: "text-emerald-300 border-emerald-500/50" };
      if (value <= 500) return { label: "needs improvement", className: "text-amber-300 border-amber-500/50" };
      return { label: "poor", className: "text-red-300 border-red-500/50" };
    }
    if (metric === "cls") {
      if (value <= 0.1) return { label: "good", className: "text-emerald-300 border-emerald-500/50" };
      if (value <= 0.25) return { label: "needs improvement", className: "text-amber-300 border-amber-500/50" };
      return { label: "poor", className: "text-red-300 border-red-500/50" };
    }
    // perf
    if (value >= 90) return { label: "good", className: "text-emerald-300 border-emerald-500/50" };
    if (value >= 50) return { label: "needs improvement", className: "text-amber-300 border-amber-500/50" };
    return { label: "poor", className: "text-red-300 border-red-500/50" };
  }

  function MetricPill({
    label,
    value,
    metric,
  }: {
    label: string;
    value: number | null;
    metric: "lcp" | "inp" | "cls" | "perf";
  }) {
    const status = metricStatus(metric, value);
    return (
      <span className={`rounded border px-2 py-1 text-xs ${status.className}`}>
        {label}: {value === null || Number.isNaN(value) ? "NA" : fmtNum(value, metric === "cls" ? 3 : 0)}
      </span>
    );
  }

  async function requireUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
      return null;
    }
    setEmail(data.user.email ?? "");
    setUserId(data.user.id);
    return data.user;
  }

  async function loadSitesAndRuns() {
    setLoading(true);
    setError("");

    const { data: sitesData, error: sitesErr } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (sitesErr) {
      setLoading(false);
      setError(sitesErr.message);
      return;
    }

    const list = (sitesData ?? []) as SiteRow[];
    setSites(list);

    if (list.length === 0) {
      setRunsBySite({});
      setLoading(false);
      return;
    }

    const ids = list.map((s) => s.id);
    const { data: runsData, error: runsErr } = await supabase
      .from("runs")
      .select("*")
      .in("site_id", ids)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (runsErr) {
      setError(runsErr.message);
      return;
    }

    const grouped: Record<string, RunRow[]> = {};
    for (const r of (runsData ?? []) as RunRow[]) {
      if (!grouped[r.site_id]) grouped[r.site_id] = [];
      grouped[r.site_id].push(r);
    }

    setRunsBySite(grouped);
  }

  useEffect(() => {
    (async () => {
      const user = await requireUser();
      if (!user) return;
      await loadSitesAndRuns();
    })();
  }, [router]);

  async function handleAddSite() {
    setSavingSite(true);
    setError("");

    const cleanUrl = url.trim();
    const normalized = normalizeUrl(cleanUrl);

    if (!normalized) {
      setSavingSite(false);
      setError("Enter a valid URL, example, https://example.com");
      return;
    }

    const { error: insertErr } = await supabase.from("sites").insert({
      user_id: userId,
      url: normalized,
      name: name.trim() ? name.trim() : null,
    });

    setSavingSite(false);

    if (insertErr) {
      const msg = String(insertErr.message || "");
      const isDuplicate =
        msg.includes("sites_user_url_unique") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("unique constraint");

      setError(isDuplicate ? "This site already exists" : insertErr.message);
      return;
    }

    setName("");
    setUrl("");
    setAddPreview("");
    await loadSitesAndRuns();
  }

  function startEdit(site: SiteRow) {
    setEditError("");
    setEditingSiteId(site.id);
    setEditName(site.name ?? "");
    setEditUrl(site.url);
    const preview = normalizeUrl(site.url);
    setEditPreview(preview ?? "");
  }

  function cancelEdit() {
    setEditingSiteId("");
    setEditName("");
    setEditUrl("");
    setEditError("");
    setEditPreview("");
    setSavingEdit(false);
  }

  async function handleSaveEdit(site: SiteRow) {
    setSavingEdit(true);
    setEditError("");

    const normalized = normalizeUrl(editUrl.trim());
    if (!normalized) {
      setSavingEdit(false);
      setEditError("Enter a valid URL, example, https://example.com");
      return;
    }

    const { error: updErr } = await supabase
      .from("sites")
      .update({
        name: editName.trim() ? editName.trim() : null,
        url: normalized,
      })
      .eq("id", site.id)
      .eq("user_id", userId);

    setSavingEdit(false);

    if (updErr) {
      const msg = String(updErr.message || "");
      const isDuplicate =
        msg.includes("sites_user_url_unique") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("unique constraint");
      setEditError(isDuplicate ? "This site already exists" : updErr.message);
      return;
    }

    cancelEdit();
    await loadSitesAndRuns();
  }

  async function handleRunNow(site: SiteRow, strategyOverride?: Strategy) {
    const normalized = normalizeUrl(site.url);
    if (!normalized) {
      setError("Saved site URL is invalid, edit and save again");
      return;
    }

    setError("");
    setRunningSiteId(site.id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError("You are not logged in");
        router.push("/login");
        return;
      }

      const resp = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteId: site.id,
          url: normalized,
          strategy: strategyOverride ?? strategy,
        }),
      });

      const json = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(json?.error || "Run failed");
        return;
      }

      await loadSitesAndRuns();
    } catch (e: any) {
      setError(e?.message || "Run failed");
    } finally {
      setRunningSiteId("");
    }
  }

  async function handleDeleteSite(site: SiteRow) {
    if (deletingSiteId) return;

    setError("");

    const ok = window.confirm(`Delete this site?\n${site.url}`);
    if (!ok) return;

    setDeletingSiteId(site.id);

    try {
      const { error: delErr } = await supabase
        .from("sites")
        .delete()
        .eq("id", site.id);

      if (delErr) {
        setError(delErr.message);
        return;
      }

      setSites((prev) => prev.filter((s) => s.id !== site.id));
      setRunsBySite((prev) => {
        const next = { ...prev };
        delete next[site.id];
        return next;
      });
    } finally {
      setDeletingSiteId("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-400">Signed in as, {email}</p>
            <p className="text-sm text-zinc-400">Sites, {siteCount}</p>
          </div>

          <button onClick={handleLogout} className="border px-4 py-2">
            Logout
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs uppercase text-zinc-500">Last run</div>
            <div className="text-lg font-semibold">
              {lastRunTime ? new Date(lastRunTime).toLocaleString() : "No runs yet"}
            </div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs uppercase text-zinc-500">Total sites</div>
            <div className="text-lg font-semibold">{siteCount}</div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs uppercase text-zinc-500">Runs last 7 days</div>
            <div className="text-lg font-semibold">{totalRunsLast7}</div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs uppercase text-zinc-500">Avg perf last 7d</div>
            <div className="text-lg font-semibold">
              {avgPerfLast7 === null ? "NA" : Math.round(avgPerfLast7)}
            </div>
            <div className="text-xs text-zinc-500">
              {worstSiteLast7
                ? `Worst: ${sites.find((s) => s.id === worstSiteLast7.site_id)?.name ??
                sites.find((s) => s.id === worstSiteLast7.site_id)?.url ??
                "Unknown"
                } (${Math.round(worstSiteLast7.avg)})`
                : "No recent data"}
            </div>
          </div>
        </div>

        <div className="space-y-3 border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Add website</h2>

            <label className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Strategy</span>
              <select
                id="strategy"
                name="strategy"
                aria-label="Strategy"
                className="border bg-transparent px-3 py-2"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as Strategy)}
              >
                <option value="mobile">mobile</option>
                <option value="desktop">desktop</option>
              </select>
            </label>
          </div>

          <input
            className="w-full border px-3 py-2"
            placeholder="Name, optional"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              const val = e.target.value;
              setUrl(val);
              const prev = normalizeUrl(val.trim());
              setAddPreview(prev ?? "");
            }}
          />

          {error ? <p className="text-red-500">{error}</p> : null}
          {addPreview ? (
            <p className="text-sm text-zinc-400">Will save as {addPreview}</p>
          ) : null}

          <button
            onClick={handleAddSite}
            disabled={savingSite || !userId}
            className="bg-black px-4 py-2 text-white"
          >
            {savingSite ? "Saving..." : "Add site"}
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your websites</h2>

          {loading ? (
            <p className="text-sm text-zinc-400">Loading your sites...</p>
          ) : noSites ? (
            <div className="text-sm text-zinc-400">
              No sites yet. Add a site above to start monitoring. You can add both mobile and desktop runs per site.
              <div className="mt-2">
                <button
                  onClick={() => {
                    setName("Example Site");
                    setUrl("https://example.com");
                    setAddPreview("https://example.com");
                  }}
                  className="mt-2 rounded border border-zinc-700 px-3 py-2 text-xs"
                >
                  Add example URL
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map((s) => {
                const runs = runsBySite[s.id] ?? [];
                const latest = runs[0] ?? null;
                const history = runs.slice(0, 5);

                return (
                  <div key={s.id} className="border p-3 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">
                          {s.name ?? "Untitled"}
                        </div>
                        <div className="text-sm text-zinc-400">{s.url}</div>
                        {latest?.final_url ? (
                          <div className="text-xs text-zinc-500">
                            Host: {hostnameFromUrl(latest.final_url)}
                          </div>
                        ) : null}
                        {latest?.page_title ? (
                          <div className="text-xs text-zinc-500">
                            Title: {latest.page_title}
                          </div>
                        ) : null}
                        {latest ? (
                          <div className="text-xs text-zinc-500">
                            Last run: {new Date(latest.created_at).toLocaleString()} | {latest.strategy}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRunNow(s)}
                            disabled={
                              runningSiteId === s.id || deletingSiteId === s.id
                            }
                            className="border px-4 py-2"
                          >
                            {runningSiteId === s.id ? "Running..." : "Run now"}
                          </button>
                          <button
                            onClick={() => handleRunNow(s, "mobile")}
                            disabled={
                              runningSiteId === s.id || deletingSiteId === s.id
                            }
                            className="border px-3 py-2 text-xs"
                          >
                            Mobile
                          </button>
                          <button
                            onClick={() => handleRunNow(s, "desktop")}
                            disabled={
                              runningSiteId === s.id || deletingSiteId === s.id
                            }
                            className="border px-3 py-2 text-xs"
                          >
                            Desktop
                          </button>
                        </div>
                        <Link
                          className="border px-4 py-2"
                          href={`/sites/${s.id}`}
                        >
                          History
                        </Link>
                        <button
                          onClick={() => startEdit(s)}
                          disabled={runningSiteId === s.id}
                          className="border px-4 py-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteSite(s)}
                          disabled={runningSiteId === s.id}
                          className="border px-4 py-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingSiteId === s.id ? (
                      <div className="space-y-2 border p-3">
                        <div className="text-sm font-semibold">Edit site</div>
                        <input
                          className="w-full border px-3 py-2"
                          placeholder="Name, optional"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <input
                          className="w-full border px-3 py-2"
                          placeholder="https://example.com"
                          value={editUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditUrl(val);
                            const prev = normalizeUrl(val.trim());
                            setEditPreview(prev ?? "");
                          }}
                        />
                        {editError ? (
                          <p className="text-red-500 text-sm">{editError}</p>
                        ) : null}
                        {editPreview ? (
                          <p className="text-sm text-zinc-400">
                            Will save as {editPreview}
                          </p>
                        ) : null}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(s)}
                            disabled={savingEdit}
                            className="border px-4 py-2"
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="border px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {latest ? (
                      <div className="text-sm text-zinc-300 space-y-2">
                        <div>
                          Latest, {latest.strategy}, perf{" "}
                          {latest.performance ?? "NA"}, seo {latest.seo ?? "NA"},
                          a11y {latest.accessibility ?? "NA"}, bp{" "}
                          {latest.best_practices ?? "NA"}, lcp{" "}
                          {fmtNum(latest.lcp)} ms
                          {(() => {
                            const inp = getInpDisplay(latest);
                            return (
                              <>
                                , inp {inp.v === null ? "NA" : fmtNum(inp.v)} ms
                                {inp.src ? ` (${inp.src})` : ""}
                              </>
                            );
                          })()}
                          , cls {fmtNum(latest.cls, 3)}{" "}
                          {latest.status ? `| ${latest.status}` : ""}
                          {latest.error_message ? ` | ${latest.error_message}` : ""}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <MetricPill label="Perf" value={latest.performance} metric="perf" />
                          <MetricPill label="LCP" value={latest.lcp} metric="lcp" />
                          <MetricPill label="INP" value={getInpDisplay(latest).v} metric="inp" />
                          <MetricPill label="CLS" value={latest.cls} metric="cls" />
                          <MetricPill label="SEO" value={latest.seo} metric="perf" />
                          <MetricPill label="A11y" value={latest.accessibility} metric="perf" />
                          <MetricPill label="BP" value={latest.best_practices} metric="perf" />
                        </div>

                        <BusinessImpactCard lcpMs={latest.lcp} />
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-400">No runs yet</div>
                    )}

                    {history.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-zinc-400">Recent runs</div>
                        <div className="space-y-1">
                          {history.map((r) => (
                            <div key={r.id} className="text-sm text-zinc-300">
                              {new Date(r.created_at).toLocaleString()},{" "}
                              {r.strategy}, perf {r.performance ?? "NA"}, seo{" "}
                              {r.seo ?? "NA"}, a11y {r.accessibility ?? "NA"},
                              bp {r.best_practices ?? "NA"}, lcp {fmtNum(r.lcp)}{" "}
                              ms
                              {(() => {
                                const inp = getInpDisplay(r);
                                return (
                                  <>
                                    , inp {inp.v === null ? "NA" : fmtNum(inp.v)}{" "}
                                    ms{inp.src ? ` (${inp.src})` : ""}
                                  </>
                                );
                              })()}
                              , cls {fmtNum(r.cls, 3)}{" "}
                              {r.status ? `| ${r.status}` : ""}
                              {r.error_message ? ` | ${r.error_message}` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
