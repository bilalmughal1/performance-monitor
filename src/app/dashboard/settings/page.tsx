"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { Button } from "@/components/common/button";

const themes = ["system", "dark", "light"] as const;

export default function AppSettingsPage() {
  const [theme, setTheme] = useState<"system" | "dark" | "light">(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme") as "system" | "dark" | "light" | null;
    return stored || "system";
  });

  const applyTheme = (value: typeof theme, persist = true) => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("theme-light", "theme-dark");
      if (value === "light") root.classList.add("theme-light");
      if (value === "dark") root.classList.add("theme-dark");
      if (persist) localStorage.setItem("theme", value);
    }
  };

  useEffect(() => {
    applyTheme(theme, false);
  }, [theme]);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">App Settings</h1>
        <p className="text-zinc-400 text-sm md:text-base">Personalize how the app looks and behaves.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Theme</CardTitle>
          <CardDescription className="text-sm">Choose your appearance preference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {themes.map((t) => (
              <Button
                key={t}
                type="button"
                variant={theme === t ? "premium" : "outline"}
                onClick={() => setTheme(t)}
              >
                {t === "system" ? "System" : t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Light mode favors brighter UI, Dark mode is the default, System follows your device preference.
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Notifications</CardTitle>
          <CardDescription className="text-sm">Manage email or in-app alerts (coming soon).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          <p>We&apos;ll add granular notification controls here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
