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
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (v === null || typeof v !== "number" || Number.isNaN(v)) return "--";
  const p = Math.pow(10, digits);
  return String(Math.round(v * p) / p);
}

function getInpDisplay(run: RunRow): { v: number | null; src: InpSource } {
  if (typeof run.inp_lab_ms === "number" && !Number.isNaN(run.inp_lab_ms)) return { v: run.inp_lab_ms, src: "lab" };
  if (typeof run.inp_field_p75_ms === "number" && !Number.isNaN(run.inp_field_p75_ms)) return { v: run.inp_field_p75_ms, src: "field p75" };
  if (typeof run.inp === "number" && !Number.isNaN(run.inp)) return { v: run.inp, src: null };
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
  const [runningAudit, setRunningAudit] = useState(false);

  const pageSize = 25;
  const [page, setPage] = useState(0);

  const canPrev = page > 0;
  const canNext = runs.length === pageSize;

  const title = useMemo(() => site?.name ?? "Untitled", [site]);

  async function handleRunAudit(strategy: "mobile" | "desktop") {
    if (!site || runningAudit) return;

    setRunningAudit(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to run an audit");
        return;
      }

      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          siteId: site.id,
          url: site.url,
          strategy
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to run audit");
      }

      alert(`${strategy.charAt(0).toUpperCase() + strategy.slice(1)} audit completed successfully!`);
      // Reload runs to show the new audit
      await loadSiteAndRuns(userId);
    } catch (error: any) {
      alert(`Audit failed: ${error.message}`);
    } finally {
      setRunningAudit(false);
    }
  }

  const { fromISO, toISO } = useMemo(() => {
    const now = new Date();
    let from: Date;
    if (datePreset === "7d") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (datePreset === "30d") from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (datePreset === "90d") from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else {
      const cf = customFrom ? new Date(customFrom) : null;
      from = cf && !Number.isNaN(cf.getTime()) ? cf : new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000); // Default long fallback if custom fails
    }

    const to = datePreset === "custom" && customTo ? new Date(customTo) : now;
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [datePreset, customFrom, customTo]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      loadSiteAndRuns(data.user.id);
    })();
  }, [siteId, strategy, page, datePreset, customFrom, customTo, sortAsc]); // Depend on params to reload

  async function loadSiteAndRuns(uid: string) {
    setLoading(true);
    setError("");

    if (!siteId) {
      setLoading(false);
      return;
    }

    // Load Site
    if (!site) {
      const { data: siteData, error: siteErr } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .eq("user_id", uid)
        .single();

      if (siteErr) {
        setLoading(false);
        setError(siteErr.message);
        return;
      }
      setSite(siteData as SiteRow);
    }

    // Load Runs
    let q = supabase
      .from("runs")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: sortAsc });

    if (strategy === "mobile" || strategy === "desktop") {
      q = q.eq("strategy", strategy);
    }

    if (fromISO) q = q.gte("created_at", fromISO);
    if (toISO) q = q.lte("created_at", toISO);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: runsData, error: runsErr } = await q.range(from, to).limit(pageSize + 1); // Get one extra to check next

    setLoading(false);

    if (runsErr) {
      setError(runsErr.message);
      return;
    }

    setRuns((runsData ?? []) as RunRow[]);
  }


  const chartData = useMemo(() => {
    const sorted = [...runs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return sorted.map((r) => {
      const inp = getInpDisplay(r);
      return {
        created_at: new Date(r.created_at).toLocaleDateString(),
        full_date: new Date(r.created_at).toLocaleString(),
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
    // ... CSV logic similar to before but maybe improved ...
    // keeping it simple for now
    const headers = ["site_url", "created_at", "strategy", "perf", "lcp", "inp", "cls"];
    const rows = runs.map(r => [
      site.url, r.created_at, r.strategy, r.performance, r.lcp, getInpDisplay(r).v, r.cls
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${site.name || "site"}-runs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadingCsv(false);
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" className="pl-0 gap-2 text-zinc-400 hover:text-white" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-muted-foreground font-mono text-sm">{site?.url}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">
            <button
              onClick={() => setStrategy("all")}
              className={cn("px-3 py-1 text-xs rounded-sm transition-colors", strategy === "all" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >All</button>
            <button
              onClick={() => setStrategy("mobile")}
              className={cn("px-3 py-1 text-xs rounded-sm transition-colors", strategy === "mobile" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >Mobile</button>
            <button
              onClick={() => setStrategy("desktop")}
              className={cn("px-3 py-1 text-xs rounded-sm transition-colors", strategy === "desktop" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >Desktop</button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCsvExport} disabled={downloadingCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>
              Tracking key metrics over the last {datePreset === "custom" ? "custom period" : datePreset}.
            </CardDescription>
            <div className="flex items-center gap-4 pt-2">
              <select
                className="bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-300 outline-none"
                value={metric}
                onChange={(e) => setMetric(e.target.value as MetricKey)}
              >
                <option value="performance">Performance Score</option>
                <option value="lcp">LCP (ms)</option>
                <option value="cls">CLS</option>
                <option value="inp">INP (ms)</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={compare} onChange={e => setCompare(e.target.checked)} className="rounded border-zinc-700 bg-zinc-900" />
                Compare Mobile vs Desktop
              </label>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[320px] h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="created_at" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                {compare ? (
                  <>
                    <Area type="monotone" dataKey={metric} data={chartData.filter(d => d.strategy === "mobile")} name="Mobile" stroke="#6366f1" fill="none" strokeWidth={2} />
                    <Area type="monotone" dataKey={metric} data={chartData.filter(d => d.strategy === "desktop")} name="Desktop" stroke="#ec4899" fill="none" strokeWidth={2} />
                  </>
                ) : (
                  <Area type="monotone" dataKey={metric} stroke="#6366f1" fillOpacity={1} fill="url(#colorMetric)" strokeWidth={2} />
                )}
              </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {runs[0] ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Score</span>
                    <span className={cn(
                      "text-2xl font-bold",
                      (runs[0].performance || 0) >= 90 ? "text-emerald-500" : (runs[0].performance || 0) >= 50 ? "text-amber-500" : "text-red-500"
                    )}>{runs[0].performance}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="text-sm text-zinc-400">LCP</span>
                    <span className="font-mono">{fmtNum(runs[0].lcp)}ms</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="text-sm text-zinc-400">CLS</span>
                    <span className="font-mono">{fmtNum(runs[0].cls, 3)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="text-sm text-zinc-400">INP</span>
                    <span className="font-mono">{fmtNum(getInpDisplay(runs[0]).v)}ms</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-500 py-8">No runs yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-indigo-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleRunAudit("mobile")}
                disabled={runningAudit}
              >
                <Smartphone className="h-4 w-4" />
                {runningAudit ? "Running..." : "Run Mobile Audit"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleRunAudit("desktop")}
                disabled={runningAudit}
              >
                <Monitor className="h-4 w-4" />
                {runningAudit ? "Running..." : "Run Desktop Audit"}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert("Alert configuration coming soon!")}>
                Configure Alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="md:col-span-3">
        <h3 className="text-xl font-bold text-white mb-4">Competitor Analysis</h3>
        <CompetitorsSection siteId={siteId} userId={userId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-800">
                  <th className="p-3 text-left font-medium text-zinc-400">Date</th>
                  <th className="p-3 text-left font-medium text-zinc-400">Device</th>
                  <th className="p-3 text-left font-medium text-zinc-400">Perf</th>
                  <th className="p-3 text-left font-medium text-zinc-400 hidden md:table-cell">LCP</th>
                  <th className="p-3 text-left font-medium text-zinc-400 hidden md:table-cell">CLS</th>
                  <th className="p-3 text-left font-medium text-zinc-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {runs.map(run => (
                  <tr key={run.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3">{new Date(run.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs", run.strategy === 'mobile' ? "bg-indigo-500/10 text-indigo-400" : "bg-purple-500/10 text-purple-400")}>
                        {run.strategy === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {run.strategy}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={cn("font-bold", (run.performance || 0) >= 90 ? "text-emerald-500" : (run.performance || 0) >= 50 ? "text-amber-500" : "text-red-500")}>
                        {run.performance}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell font-mono text-zinc-500">{run.lcp}ms</td>
                    <td className="p-3 hidden md:table-cell font-mono text-zinc-500">{run.cls}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRun(run)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-all animate-in fade-in">
          <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4">
              <CardTitle>Audit Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRun(null)}>Close</Button>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">Performance</h4>
                  <div className="text-3xl font-bold text-white">{selectedRun.performance}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">Core Web Vitals</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-zinc-900">LCP: {selectedRun.lcp}ms</div>
                    <div className="p-2 rounded bg-zinc-900">CLS: {selectedRun.cls}</div>
                    <div className="p-2 rounded bg-zinc-900">INP: {getInpDisplay(selectedRun).v}ms</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono text-zinc-500 bg-zinc-900/50 p-4 rounded-lg h-48 overflow-y-auto">
                <p>ID: {selectedRun.id}</p>
                <p>Time: {new Date(selectedRun.created_at).toLocaleString()}</p>
                <p>Strategy: {selectedRun.strategy}</p>
                <p>URL: {selectedRun.final_url}</p>
                <p>Lighthouse: {selectedRun.lighthouse_version}</p>
                <p>Raw: {JSON.stringify(selectedRun.raw || {}, null, 2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

