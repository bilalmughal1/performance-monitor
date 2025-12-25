import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, Globe, Lock, ArrowRight, LayoutDashboard, History, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[128px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[128px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 ring-1 ring-zinc-800/50 backdrop-blur-md sticky top-0 bg-black/50">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Zap className="h-6 w-6 text-indigo-500" fill="currentColor" />
          <span>PerfMonitor</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup">
            <Button variant="premium" size="sm" className="rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 text-center">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 pt-32 pb-20">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            Now available in Beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent pb-2">
            Master your web <br className="hidden md:block" />
            <span className="text-indigo-400">performance</span> metrics.
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track real-world Core Web Vitals (LCP, INP, CLS) and SEO scores over time.
            Monitor competitors, receive alerts, and optimize for conversion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="premium" size="lg" className="h-12 px-8 text-base rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-shadow">
                Start Monitoring Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://performance-monitor-beta.vercel.app" target="_blank">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-zinc-700 hover:bg-zinc-800">
                View Live Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm group hover:bg-zinc-900/60 transition-colors">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle>Historical Analytics</CardTitle>
                <CardDescription>
                  Visualize performance trends over time with beautiful, interactive charts.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm group hover:bg-zinc-900/60 transition-colors">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle>Multi-Device Testing</CardTitle>
                <CardDescription>
                  Run automated tests on both Mobile and Desktop strategies to ensure perfect UX.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm group hover:bg-zinc-900/60 transition-colors">
              <CardHeader>
                <Globe className="h-10 w-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle>Global Standards</CardTitle>
                <CardDescription>
                  Powered by Google PageSpeed Insights for accurate, standardized scoring.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Tech Stack / Trust */}
        <section className="py-20 border-y border-zinc-800/50 bg-zinc-950/30">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-semibold mb-12 text-zinc-300">Built with modern, robust technology</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale transition-all hover:grayscale-0">
              <div className="flex items-center gap-2 text-xl font-bold"><LayoutDashboard className="h-6 w-6" /> Next.js 14</div>
              <div className="flex items-center gap-2 text-xl font-bold"><Lock className="h-6 w-6" /> Supabase Auth</div>
              <div className="flex items-center gap-2 text-xl font-bold"><Zap className="h-6 w-6" /> Tailwind CSS</div>
              <div className="flex items-center gap-2 text-xl font-bold"><Globe className="h-6 w-6" /> Vercel Edge</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 bg-black/80 py-12 text-center text-sm text-zinc-500 backdrop-blur-md">
        <div className="mb-4 flex justify-center gap-6">
          <Link href="https://github.com/bilalmughal1" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
          <Link href="https://fahadbilal.com" target="_blank" className="hover:text-white transition-colors">Portfolio</Link>
          <Link href="https://linkedin.com/in/fahadbilalsaleem" target="_blank" className="hover:text-white transition-colors">LinkedIn</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Fahad Bilal Saleem. All rights reserved.</p>
      </footer>
    </div>
  );
}
