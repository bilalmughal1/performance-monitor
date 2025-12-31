"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/common/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { CheckCircle2, XCircle, BarChart3, Search, DollarSign, Loader2 } from "lucide-react";

type Integration = {
    id: string;
    service: string;
    created_at: string;
    account_id?: string;
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [sites, setSites] = useState<{ id: string; name: string | null; url: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadIntegrations();
    loadSites();
  }, []);

  async function loadIntegrations() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('google_integrations')
            .select('*')
            .eq('user_id', user.id);

        setIntegrations(data || []);
        setLoading(false);
    }

  async function loadSites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("sites")
      .select("id,name,url")
      .order("created_at", { ascending: false });
    setSites(data || []);
    if ((data || []).length > 0) setSelectedSiteId(data![0].id);
  }

    async function handleConnect(service: 'analytics' | 'searchConsole' | 'ads') {
        setConnecting(service);
    setError("");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in first");
            setConnecting(null);
            return;
        }

    if (!selectedSiteId) {
      setConnecting(null);
      setError("Select a site before connecting.");
      return;
    }

        // Redirect to OAuth flow
    window.location.href = `/api/integrations/google/${service}/connect?userId=${user.id}&siteId=${selectedSiteId}`;
    }

    async function handleDisconnect(service: string) {
        if (!confirm(`Disconnect ${service}? This will stop syncing data.`)) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('google_integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('service', service);

        loadIntegrations();
    }

    const isConnected = (service: string) => {
        return integrations.some(i => i.service === service);
    };

    const services = [
        {
            id: 'analytics',
            name: 'Google Analytics',
            description: 'Track user behavior, sessions, bounce rates, and conversions',
            icon: BarChart3,
            color: 'text-orange-400',
            bgColor: 'from-orange-950/20 to-amber-950/20',
            borderColor: 'border-orange-500/20'
        },
        {
            id: 'searchConsole',
            name: 'Google Search Console',
            description: 'Monitor search rankings, clicks, impressions, and CTR',
            icon: Search,
            color: 'text-blue-400',
            bgColor: 'from-blue-950/20 to-cyan-950/20',
            borderColor: 'border-blue-500/20'
        },
        {
            id: 'ads',
            name: 'Google Ads',
            description: 'Correlate ad spend with performance metrics and Quality Score',
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'from-green-950/20 to-emerald-950/20',
            borderColor: 'border-green-500/20'
        }
    ];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Integrations</h1>
                <p className="text-zinc-400 mt-2 text-sm md:text-base">
                    Connect your Google services to unlock powerful insights and correlate performance with business metrics.
                </p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1">
        <Card className="bg-zinc-900/40 border-zinc-800/60">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Select Site</CardTitle>
            <CardDescription>Choose which site/project to connect to Google services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <div className="text-sm text-red-400">{error}</div>}
            {sites.length === 0 ? (
              <div className="text-sm text-zinc-400">Add a site first from the dashboard before connecting services.</div>
            ) : (
              <select
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || new URL(s.url).hostname} — {s.url}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

                {services.map((service) => {
                    const connected = isConnected(service.id);
                    const Icon = service.icon;
                    const isLoading = connecting === service.id;

                    return (
                        <Card
                            key={service.id}
                            className={`bg-gradient-to-br ${service.bgColor} border ${service.borderColor}`}
                        >
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${service.color} flex-shrink-0`} />
                                        <div className="min-w-0">
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                {service.name}
                                                {connected && (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-sm">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    {connected ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect(service.id)}
                                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 w-full sm:w-auto"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleConnect(service.id as any)}
                                            disabled={isLoading}
                                            className={`border-${service.color.split('-')[1]}-500/20 w-full sm:w-auto`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                'Connect'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            {connected && (
                                <CardContent>
                                    <div className="text-sm text-zinc-400">
                                        ✓ Connected and syncing data daily
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            <Card className="bg-zinc-900/40 border-zinc-800/60">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-300">
                    <p>1. Click "Connect" on any service above</p>
                    <p>2. You'll be redirected to Google to authorize access (read-only)</p>
                    <p>3. Once connected, we'll automatically sync your data daily</p>
                    <p>4. View correlated metrics in your site dashboards</p>
                </CardContent>
            </Card>
        </div>
    );
}
