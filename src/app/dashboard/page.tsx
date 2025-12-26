"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BusinessImpactCard } from "./business-impact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List as ListIcon, Smartphone, Monitor } from "lucide-react";
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
  strategy: string;
  performance: number | null;
  seo: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  created_at: string;
  final_url?: string | null;
  page_title?: string | null;
  status?: string | null;
};

function normalizeUrl(input: string) {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname) return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function fmtNum(v: number | null, digits = 0) {
  if (v === null || typeof v !== "number" || Number.isNaN(v)) return "--";
  return v.toFixed(digits);
}

function getHealthScore(latest: RunRow | null) {
  if (!latest?.performance) return 0;
  return latest.performance;
}

function HealthBadge({ score }: { score: number }) {
  let color = "bg-zinc-800 text-zinc-400";
  if (score >= 90) color = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  else if (score >= 50) color = "bg-amber-500/10 text-amber-500 border-amber-500/20";
  else if (score > 0) color = "bg-red-500/10 text-red-500 border-red-500/20";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", color)}>
      {score > 0 ? score : "NA"}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [runsBySite, setRunsBySite] = useState<Record<string, RunRow[]>>({});
  const [loading, setLoading] = useState(true);

  // Add Site State
  const [isAdding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      loadData(data.user.id);
    })();
  }, [router]);

  async function loadData(uid: string) {
    setLoading(true);
    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (!sitesData) {
      setLoading(false);
      return;
    }

    setSites(sitesData);

    const siteIds = sitesData.map(s => s.id);
    if (siteIds.length > 0) {
      const { data: runs } = await supabase
        .from("runs")
        .select("*")
        .in("site_id", siteIds) // Fix: was site_id, using foreign key logic
        .order("created_at", { ascending: false });

      const grouped: Record<string, RunRow[]> = {};
      runs?.forEach((r: any) => {
        if (!grouped[r.site_id]) grouped[r.site_id] = [];
        grouped[r.site_id].push(r);
      });
      setRunsBySite(grouped);
    }
    setLoading(false);
  }

  async function handleAddSite() {
    if (!newUrl) return;
    setAdding(true);
    setError("");
    const url = normalizeUrl(newUrl);
    if (!url) {
      setError("Invalid URL");
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("sites").insert({
      user_id: userId,
      url,
      name: newName || null
    });

    if (error) {
      setError(error.message);
    } else {
      setNewUrl("");
      setNewName("");
      loadData(userId);
    }
    setAdding(false);
  }

  const stats = useMemo(() => {
    const totalSites = sites.length;
    const allRuns = Object.values(runsBySite).flat();
    const totalRuns = allRuns.length;
    const avgPerf = allRuns.length ? Math.round(allRuns.reduce((a, b) => a + (b.performance || 0), 0) / allRuns.length) : 0;
    return { totalSites, totalRuns, avgPerf };
  }, [sites, runsBySite]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, {email.split("@")[0]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm">
            <LayoutGrid className="mr-2 h-4 w-4" /> View Grid
          </Button>
          <Button variant="premium" size="sm" onClick={() => document.getElementById("add-site-input")?.focus()}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSites}</div>
            <p className="text-xs text-muted-foreground">Active monitored sites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">Performance checks performed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerf}</div>
            <p className="text-xs text-muted-foreground">Average performance score</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add */}
      <Card className="border-dashed border-zinc-800 bg-transparent">
        <CardContent className="flex flex-col md:flex-row items-stretch md:items-center gap-4 py-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <input
              id="add-site-input"
              className="flex-1 bg-transparent border-b border-zinc-800 focus:border-white outline-none py-2 text-sm text-white placeholder:text-zinc-600 transition-colors"
              placeholder="https://example.com"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
            />
            <input
              className="w-full sm:w-48 bg-transparent border-b border-zinc-800 focus:border-white outline-none py-2 text-sm text-white placeholder:text-zinc-600 transition-colors"
              placeholder="Project Name (Optional)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <Button disabled={!newUrl || isAdding} onClick={handleAddSite} variant="secondary" className="w-full md:w-auto">
            {isAdding ? "Adding..." : "Track Site"}
          </Button>
        </CardContent>
        {error && <p className="px-6 pb-4 text-xs text-red-500">{error}</p>}
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full text-center py-20 text-zinc-500">Loading your empire...</div>}

        {!loading && sites.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <h3 className="text-lg font-medium text-white">No projects yet</h3>
            <p className="text-zinc-500">Add your first URL above to start monitoring.</p>
          </div>
        )}

        {sites.map(site => {
          const runs = runsBySite[site.id] || [];
          const latest = runs[0] || null;
          const health = getHealthScore(latest);

          return (
            <Link href={`/dashboard/sites/${site.id}`} key={site.id} className="block group">
              <Card className="h-full transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{site.name || new URL(site.url).hostname}</CardTitle>
                      <CardDescription className="font-mono text-xs truncate">{site.url}</CardDescription>
                    </div>
                    <HealthBadge score={health} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <div className="text-center p-2 rounded bg-zinc-950/50">
                      <div className="text-xs text-muted-foreground uppercase">LCP</div>
                      <div className="font-mono font-medium text-sm">{latest ? `${(latest.lcp! / 1000).toFixed(1)}s` : "--"}</div>
                    </div>
                    <div className="text-center p-2 rounded bg-zinc-950/50">
                      <div className="text-xs text-muted-foreground uppercase">CLS</div>
                      <div className="font-mono font-medium text-sm">{latest ? latest.cls : "--"}</div>
                    </div>
                    <div className="text-center p-2 rounded bg-zinc-950/50">
                      <div className="text-xs text-muted-foreground uppercase">SEO</div>
                      <div className="font-mono font-medium text-sm">{latest ? latest.seo : "--"}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{latest ? `Last run: ${new Date(latest.created_at).toLocaleDateString()}` : "No runs yet"}</span>
                    <span className="group-hover:text-white transition-colors whitespace-nowrap ml-2">View Details →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div >
  );
}

