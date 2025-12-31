"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

type CompetitorRow = {
    id: string;
    url: string;
    name: string | null;
};

export function CompetitorsSection({
    siteId,
    userId,
}: {
    siteId: string;
    userId: string;
}) {
    const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
    const [newUrl, setNewUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const loadCompetitors = useCallback(async () => {
        const { data } = await supabase
            .from("competitors")
            .select("*")
            .eq("site_id", siteId);
        setCompetitors(data ?? []);
    }, [siteId]);

    useEffect(() => {
        loadCompetitors();
    }, [loadCompetitors]);

    async function handleAdd() {
        if (!newUrl.trim()) return;
        setAdding(true);
        setError("");

        // Normalize
        let url = newUrl.trim();
        if (!url.startsWith("http")) url = `https://${url}`;

        try {
            const u = new URL(url); // validate
            const { error: err } = await supabase.from("competitors").insert({
                site_id: siteId,
                user_id: userId,
                url: u.toString(),
                name: u.hostname,
            });

            if (err) throw err;

            setNewUrl("");
            loadCompetitors();
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message || "Invalid URL");
            }
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Remove this competitor?")) return;
        await supabase.from("competitors").delete().eq("id", id);
        loadCompetitors();
    }

    return (
        <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-950 p-6 mt-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    ⚔️ Competitor War Room
                </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* List */}
                <div className="space-y-4">
                    <div className="text-sm text-zinc-400">
                        Track up to 3 competitors to see how you stack up.
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 border bg-transparent px-3 py-2 text-sm"
                            placeholder="https://competitor.com"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={adding || competitors.length >= 3}
                            className="bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                        >
                            {adding ? "..." : "Add"}
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <div className="space-y-2">
                        {competitors.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded border border-zinc-800 p-2 text-sm">
                                <span className="truncate max-w-[200px]">{c.name || c.url}</span>
                                <button onClick={() => handleDelete(c.id)} className="text-zinc-500 hover:text-red-400">
                                    ×
                                </button>
                            </div>
                        ))}
                        {competitors.length === 0 && (
                            <div className="p-4 text-center text-xs text-zinc-600 border border-dashed border-zinc-800">
                                No competitors added yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Visual / Graph placeholder */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <h4 className="text-sm font-medium text-zinc-300">Performance Gap</h4>
                    {competitors.length > 0 ? (
                        <div className="w-full h-40 flex items-end justify-center gap-4">
                            {/* Fake visual for "WOW" factor demo */}
                            <div className="w-12 bg-emerald-500/80 rounded-t relative group h-[80%]">
                                <div className="absolute -top-6 w-full text-center text-xs">You</div>
                                <div className="absolute bottom-1 w-full text-center text-xs font-bold">92</div>
                            </div>
                            <div className="w-12 bg-red-500/80 rounded-t relative group h-[40%]">
                                <div className="absolute -top-6 w-full text-center text-xs text-zinc-400">Comp 1</div>
                                <div className="absolute bottom-1 w-full text-center text-xs font-bold">45</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-zinc-500">
                            Add a competitor to unlock the War Room comparison graph.
                        </div>
                    )}
                    {competitors.length > 0 && <p className="text-xs text-zinc-500 mt-2">Simulated Data (Run a check to update)</p>}
                </div>
            </div>
        </div>
    );
}
