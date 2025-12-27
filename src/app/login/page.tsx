"use client";

import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[128px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[128px]" />

      <div className="w-full max-w-5xl space-y-6 relative z-10">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <Card className="bg-[#0c0c0f]/70 border-zinc-800">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <Zap className="h-4 w-4" />
                Web Performance Monitor
              </div>
              <CardTitle className="text-2xl md:text-3xl mt-4 leading-snug">
                Track LCP, INP, CLS, SEO, and accessibility over time
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Mobile and desktop runs • History charts • CSV export • Secure data with Supabase RLS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              <div className="flex flex-wrap gap-2 text-xs uppercase text-zinc-400">
                <span className="rounded border border-zinc-800 px-2 py-1">Next.js</span>
                <span className="rounded border border-zinc-800 px-2 py-1">Supabase</span>
                <span className="rounded border border-zinc-800 px-2 py-1">PageSpeed</span>
                <span className="rounded border border-zinc-800 px-2 py-1">Vercel</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link className="underline" href="https://github.com/bilalmughal1/performance-monitor" target="_blank">
                  GitHub repo
                </Link>
                <Link className="underline" href="https://performance-monitor-beta.vercel.app" target="_blank">
                  Live demo
                </Link>
                <Link className="underline" href="https://fahadbilal.com" target="_blank">
                  Portfolio
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="w-full max-w-md space-y-4 md:ml-auto">
            <div className="text-center space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl">
                <Zap className="h-6 w-6 text-indigo-500" fill="currentColor" />
                <span>PerfMonitor</span>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
              <p className="text-zinc-400">Sign in to your dashboard to view your metrics.</p>
            </div>

            <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your email below to login into your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                      placeholder="m@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-300">Password</label>
                      <button
                        type="button"
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <input
                      className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="premium" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-zinc-400 space-y-2">
              <div>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                  Sign up
                </Link>
              </div>
              <div>
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
              Built by Fahad Bilal Saleem •{" "}
              <Link href="https://www.linkedin.com/in/fahadbilalsaleem" target="_blank" className="underline">
                LinkedIn
              </Link>{" "}
              •{" "}
              <Link href="https://github.com/bilalmughal1" target="_blank" className="underline">
                GitHub
              </Link>{" "}
              •{" "}
              <Link href="https://fahadbilal.com" target="_blank" className="underline">
                Portfolio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
