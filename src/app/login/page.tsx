"use client";

import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const formatted = result.error.format();
      // @ts-ignore
      const emailError = formatted.email?._errors?.[0];
      // @ts-ignore
      const passwordError = formatted.password?._errors?.[0];
      setError(emailError || passwordError || "Invalid input");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <div className="space-y-4 rounded border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Web Performance Monitor
            </p>
            <h1 className="text-3xl font-semibold">
              Track LCP, INP, CLS, SEO, accessibility over time
            </h1>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>• Mobile and desktop runs</li>
              <li>• History table with filters and charts</li>
              <li>• CSV export for reporting</li>
              <li>• Secure per user data via Supabase RLS</li>
            </ul>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <span className="rounded border border-zinc-800 px-2 py-1">
                  Next.js
                </span>
                <span className="rounded border border-zinc-800 px-2 py-1">
                  Supabase
                </span>
                <span className="rounded border border-zinc-800 px-2 py-1">
                  PageSpeed Insights
                </span>
                <span className="rounded border border-zinc-800 px-2 py-1">
                  Vercel
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="underline"
                  href="https://github.com/bilalmughal1/performance-monitor"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub repo
                </Link>
                <Link
                  className="underline"
                  href="https://performance-monitor-beta.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                >
                  Live demo
                </Link>
                <Link
                  className="underline"
                  href="https://fahadbilal.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Portfolio
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Login</h2>
              <p className="text-sm text-zinc-400">
                Use your email and password to access your dashboard.
              </p>
            </div>

            {error ? (
              <div className="mt-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Email</label>
                <input
                  className="w-full border border-zinc-800 bg-transparent px-3 py-2"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full border border-zinc-800 bg-transparent px-3 py-2"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs text-zinc-400 underline"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span className="opacity-60">
                  Forgot password (coming soon)
                </span>
                <Link href="/signup" className="underline text-zinc-300">
                  Create account
                </Link>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white px-4 py-2 text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <span>Built by Fahad Bilal Saleem</span>
          <Link
            className="underline"
            href="https://www.linkedin.com/in/fahadbilalsaleem"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            className="underline"
            href="https://github.com/bilalmughal1"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          <Link
            className="underline"
            href="https://fahadbilal.com"
            target="_blank"
            rel="noreferrer"
          >
            Portfolio
          </Link>
        </footer>
      </div>
    </div>
  );
}
