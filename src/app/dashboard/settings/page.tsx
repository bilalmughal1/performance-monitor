"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const themes = ["system", "dark", "light"] as const;

export default function AppSettingsPage() {
  const [theme, setTheme] = useState<"system" | "dark" | "light">("system");

  const applyTheme = (value: typeof theme) => {
    setTheme(value);
    if (typeof window !== "undefined") {
      if (value === "light") document.documentElement.classList.remove("dark");
      else document.documentElement.classList.add("dark");
    }
  };

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
                onClick={() => applyTheme(t)}
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
          <p>We’ll add granular notification controls here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
