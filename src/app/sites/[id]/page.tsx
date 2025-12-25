"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CompetitorsSection } from "./competitors";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

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
  strategy: "mobile" | "desktop";
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  best_practices: number | null;
  lcp: number | null;
  inp: number | null;
  inp_lab_ms: number | null;
  inp_field_p75_ms: number | null;
  cls: number | null;
  status?: string | null;
  error_message?: string | null;
  final_url?: string | null;
  page_title?: string | null;
  lighthouse_version?: string | null;
  raw?: any;
  created_at: string;
};

type StrategyFilter = "all" | "mobile" | "desktop";
type InpSource = "lab" | "field p75" | null;
type MetricKey = "performance" | "lcp" | "inp" | "cls" | "seo" | "accessibility" | "best_practices";

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

export default function SiteHistoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const siteId = String(params?.id || "");

  const [site, setSite] = useState<SiteRow | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [strategy, setStrategy] = useState<StrategyFilter>("all");
  const [metric, setMetric] = useState<MetricKey>("performance");
  const [compare, setCompare] = useState<boolean>(false);
  const [datePreset, setDatePreset] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [sortAsc, setSortAsc] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [selectedRun, setSelectedRun] = useState<RunRow | null>(null);

  const pageSize = 25;
  const [page, setPage] = useState(0);

  const canPrev = page > 0;
  const canNext = runs.length === pageSize;

  const title = useMemo(() => site?.name ?? "Untitled", [site]);

  const { fromISO, toISO } = useMemo(() => {
    const now = new Date();
    let from: Date;
    if (datePreset === "7d") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (datePreset === "30d") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (datePreset === "90d") {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      const cf = customFrom ? new Date(customFrom) : null;
      from = cf && !Number.isNaN(cf.getTime()) ? cf : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const to =
      datePreset === "custom" && customTo
        ? new Date(customTo)
        : now;

    return {
      fromISO: from.toISOString(),
      toISO: to.toISOString(),
    };
  }, [datePreset, customFrom, customTo]);

  async function requireUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
      return null;
    }
    setUserId(data.user.id);
    return data.user;
  }

  async function loadSiteAndRuns() {
    setLoading(true);
    setError("");

    const user = await requireUser();
    if (!user) return;

    if (!siteId) {
      setLoading(false);
      setError("Missing site id");
      return;
    }

    const { data: siteData, error: siteErr } = await supabase
      .from("sites")
      .select("*")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteErr) {
      setLoading(false);
      setError(siteErr.message);
      return;
    }

    setSite(siteData as SiteRow);

    let q = supabase
      .from("runs")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: sortAsc });

    if (strategy === "mobile" || strategy === "desktop") {
      q = q.eq("strategy", strategy);
    }

    if (fromISO) {
      q = q.gte("created_at", fromISO);
    }
    if (toISO) {
      q = q.lte("created_at", toISO);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: runsData, error: runsErr } = await q
      .range(from, to)
      .limit(30);

    setLoading(false);

    if (runsErr) {
      setError(runsErr.message);
      return;
    }

    setRuns((runsData ?? []) as RunRow[]);
  }

  useEffect(() => {
    loadSiteAndRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, strategy, page, datePreset, customFrom, customTo, sortAsc]);

  function onChangeStrategy(v: StrategyFilter) {
    setPage(0);
    setStrategy(v);
  }

  const chartData = useMemo(() => {
    const sorted = [...runs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-30);
    return sorted.map((r) => {
      const inp = getInpDisplay(r);
      return {
        created_at: new Date(r.created_at).toLocaleString(),
        performance: r.performance ?? null,
        lcp: r.lcp ?? null,
        inp: inp.v ?? null,
        inp_src: inp.src ?? "",
        strategy: r.strategy,
        cls: r.cls ?? null,
        seo: r.seo ?? null,
        accessibility: r.accessibility ?? null,
        best_practices: r.best_practices ?? null,
      };
    });
  }, [runs]);

  function handleCsvExport() {
    if (!runs.length || !site) return;
    setDownloadingCsv(true);
    const headers = [
      "site_name",
      "site_url",
      "created_at",
      "strategy",
      "perf",
      "seo",
      "a11y",
      "bp",
      "lcp_ms",
      "inp_ms",
      "inp_source",
      "cls",
      "final_url",
      "page_title",
      "lighthouse_version",
    ];
    const rows = runs.map((r) => {
      const inp = getInpDisplay(r);
      return [
        site.name ?? "",
        site.url,
        r.created_at,
        r.strategy,
        r.performance ?? "",
        r.seo ?? "",
        r.accessibility ?? "",
        r.best_practices ?? "",
        r.lcp ?? "",
        inp.v ?? "",
        inp.src ?? "",
        r.cls ?? "",
        (r as any).final_url ?? "",
        (r as any).page_title ?? "",
        (r as any).lighthouse_version ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${site.name ?? "site"}-runs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadingCsv(false);
  }

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Site history</h1>
              <div className="text-sm text-zinc-400">
                <Link href="/dashboard" className="underline">
                  Back to dashboard
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Strategy</span>
                <select
                  className="border bg-transparent px-3 py-2"
                  value={strategy}
                  onChange={(e) => onChangeStrategy(e.target.value as StrategyFilter)}
                  aria-label="Strategy filter"
                >
                  <option value="all">all</option>
                  <option value="mobile">mobile</option>
                  <option value="desktop">desktop</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Date</span>
                <select
                  className="border bg-transparent px-3 py-2"
                  value={datePreset}
                  onChange={(e) => {
                    setPage(0);
                    setDatePreset(e.target.value as any);
                  }}
                  aria-label="Date range"
                >
                  <option value="7d">Last 7d</option>
                  <option value="30d">Last 30d</option>
                  <option value="90d">Last 90d</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              {datePreset === "custom" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="border bg-transparent px-3 py-2"
                    value={customFrom}
                    onChange={(e) => {
                      setPage(0);
                      setCustomFrom(e.target.value);
                    }}
                  />
                  <input
                    type="date"
                    className="border bg-transparent px-3 py-2"
                    value={customTo}
                    onChange={(e) => {
                      setPage(0);
                      setCustomTo(e.target.value);
                    }}
                  />
                </div>
              ) : null}

              <label className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Sort</span>
                <select
                  className="border bg-transparent px-3 py-2"
                  value={sortAsc ? "asc" : "desc"}
                  onChange={(e) => {
                    setPage(0);
                    setSortAsc(e.target.value === "asc");
                  }}
                  aria-label="Sort"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </label>

              <button
                className="border px-4 py-2"
                onClick={handleCsvExport}
                disabled={downloadingCsv || runs.length === 0}
              >
                {downloadingCsv ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {error ? <p className="text-red-500">{error}</p> : null}

          <div className="border p-4 space-y-2">
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-sm text-zinc-400">{site?.url ?? ""}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 border p-3">
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                <span>Chart</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Metric</label>
                  <select
                    className="border bg-transparent px-2 py-1 text-xs"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as MetricKey)}
                  >
                    <option value="performance">Performance</option>
                    <option value="lcp">LCP</option>
                    <option value="inp">INP</option>
                    <option value="cls">CLS</option>
                    <option value="seo">SEO</option>
                    <option value="accessibility">A11y</option>
                    <option value="best_practices">BP</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      checked={compare}
                      onChange={(e) => setCompare(e.target.checked)}
                    />
                    Compare mobile vs desktop
                  </label>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="created_at" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload as any;
                      return (
                        <div className="rounded border border-zinc-800 bg-black p-2 text-xs text-white">
                          <div>{label}</div>
                          <div>Strategy: {p.strategy}</div>
                          <div>
                            {metric.toUpperCase()}: {p[metric] ?? "NA"}
                            {metric === "inp" && p.inp_src ? ` (${p.inp_src})` : ""}
                          </div>
                          <div>LCP: {p.lcp ?? "NA"} ms</div>
                          <div>INP: {p.inp ?? "NA"} ms</div>
                          <div>CLS: {p.cls ?? "NA"}</div>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  {compare ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey={metric}
                        stroke="#8884d8"
                        name={`${metric} (mobile)`}
                        dot={false}
                        data={chartData.filter((d) => d.strategy === "mobile")}
                      />
                      <Line
                        type="monotone"
                        dataKey={metric}
                        stroke="#82ca9d"
                        name={`${metric} (desktop)`}
                        dot={false}
                        data={chartData.filter((d) => d.strategy === "desktop")}
                      />
                    </>
                  ) : (
                    <Line type="monotone" dataKey={metric} stroke="#8884d8" name={metric.toUpperCase()} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Page {page + 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="border px-4 py-2"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev || loading}
              >
                Prev
              </button>
              <button
                className="border px-4 py-2"
                onClick={() => setPage((p) => p + 1)}
                disabled={!canNext || loading}
              >
                Next
              </button>
            </div>
          </div>

          <CompetitorsSection siteId={siteId} userId={userId} />

          <div className="border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Strategy</th>
                  <th className="p-3 text-left">Perf</th>
                  <th className="p-3 text-left">SEO</th>
                  <th className="p-3 text-left">A11y</th>
                  <th className="p-3 text-left">BP</th>
                  <th className="p-3 text-left">LCP ms</th>
                  <th className="p-3 text-left">INP ms</th>
                  <th className="p-3 text-left">CLS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-3" colSpan={9}>
                      Loading runs...
                    </td>
                  </tr>
                ) : runs.length === 0 ? (
                  <tr>
                    <td className="p-3 text-zinc-400" colSpan={9}>
                      No runs yet. Trigger a run from the dashboard to see history here.
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => {
                    const inpPicked = getInpDisplay(r);
                    return (
                      <tr
                        key={r.id}
                        className="border-t hover:bg-zinc-900 cursor-pointer"
                        onClick={() => setSelectedRun(r)}
                      >
                        <td className="p-3">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">{r.strategy}</td>
                        <td className="p-3">{r.performance ?? "NA"}</td>
                        <td className="p-3">{r.seo ?? "NA"}</td>
                        <td className="p-3">{r.accessibility ?? "NA"}</td>
                        <td className="p-3">{r.best_practices ?? "NA"}</td>
                        <td className="p-3">{fmtNum(r.lcp)}</td>
                        <td className="p-3">
                          {inpPicked.v === null ? "NA" : fmtNum(inpPicked.v, 0)}
                          {inpPicked.src ? ` (${inpPicked.src})` : ""}
                        </td>
                        <td className="p-3">{fmtNum(r.cls, 3)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRun ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Run details</h3>
              <button className="text-sm underline" onClick={() => setSelectedRun(null)}>
                Close
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2 text-sm text-zinc-300">
              <div>Time: {new Date(selectedRun.created_at).toLocaleString()}</div>
              <div>Strategy: {selectedRun.strategy}</div>
              <div>Perf: {selectedRun.performance ?? "NA"}</div>
              <div>SEO: {selectedRun.seo ?? "NA"}</div>
              <div>A11y: {selectedRun.accessibility ?? "NA"}</div>
              <div>BP: {selectedRun.best_practices ?? "NA"}</div>
              <div>LCP: {selectedRun.lcp ?? "NA"} ms</div>
              <div>
                INP: {(() => {
                  const inp = getInpDisplay(selectedRun);
                  return `${inp.v ?? "NA"}${inp.src ? ` (${inp.src})` : ""}`;
                })()}
              </div>
              <div>CLS: {selectedRun.cls ?? "NA"}</div>
              <div>Final URL: {(selectedRun as any).final_url ?? "NA"}</div>
              <div>Page title: {(selectedRun as any).page_title ?? "NA"}</div>
              <div>Lighthouse: {(selectedRun as any).lighthouse_version ?? "NA"}</div>
              <div>Status: {selectedRun.status ?? "NA"}</div>
              <div>Error: {selectedRun.error_message ?? "None"}</div>
            </div>
            <details className="rounded border border-zinc-800 bg-black p-3 text-sm text-zinc-300">
              <summary className="cursor-pointer text-zinc-200">Raw JSON</summary>
              <pre className="mt-2 max-h-64 overflow-auto text-xs">
                {JSON.stringify((selectedRun as any).raw ?? {}, null, 2)}
              </pre>
              <button
                className="mt-2 rounded border border-zinc-700 px-3 py-1 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify((selectedRun as any).raw ?? {}, null, 2)
                  );
                }}
              >
                Copy JSON
              </button>
            </details>
          </div>
        </div>
      ) : null}
    </>
  );
}
