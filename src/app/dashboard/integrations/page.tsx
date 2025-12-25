"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

    useEffect(() => {
        loadIntegrations();
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

    async function handleConnect(service: 'analytics' | 'searchConsole' | 'ads') {
        setConnecting(service);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in first");
            setConnecting(null);
            return;
        }

        // Redirect to OAuth flow
        window.location.href = `/api/integrations/google/${service}/connect?userId=${user.id}`;
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
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Integrations</h1>
                <p className="text-zinc-400 mt-2">
                    Connect your Google services to unlock powerful insights and correlate performance with business metrics.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
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
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-8 w-8 ${service.color}`} />
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {service.name}
                                                {connected && (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    {connected ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect(service.id)}
                                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
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
                                            className={`border-${service.color.split('-')[1]}-500/20`}
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
                    <CardTitle>How It Works</CardTitle>
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
