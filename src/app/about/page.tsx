import Link from "next/link";
import { Button } from "@/components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/card";
import { Zap, BarChart3, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[128px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[128px]" />
            </div>

            <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4 md:py-6 ring-1 ring-zinc-800/50 backdrop-blur-md sticky top-0 bg-black/50">
                <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight">
                    <Zap className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" fill="currentColor" />
                    <span>PerfMonitor</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/login" className="text-xs md:text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link href="/signup">
                        <Button variant="premium" size="sm" className="rounded-full px-4 md:px-6 text-xs md:text-sm">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-20 space-y-12 md:space-y-20">
                {/* Hero Section */}
                <section className="text-center space-y-4 md:space-y-6">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                        About PerfMonitor
                    </h1>
                    <p className="text-base md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        A modern, powerful web performance monitoring platform designed to help businesses optimize their digital presence and improve user experience.
                    </p>
                </section>

                {/* Mission */}
                <section className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" />
                        <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                        We believe that every website deserves to be fast, accessible, and optimized for success. PerfMonitor was built to democratize web performance monitoring, making enterprise-grade analytics accessible to businesses of all sizes.
                    </p>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                        By tracking Core Web Vitals (LCP, INP, CLS) and providing actionable insights, we help you understand how your site performs in the real world—not just in controlled lab environments.
                    </p>
                </section>

                {/* What We Offer */}
                <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                        <h2 className="text-2xl md:text-3xl font-bold">What We Offer</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    Real-Time Monitoring
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400">
                                    Track your website&apos;s performance metrics continuously with automated audits and instant alerts when issues arise.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    Competitor Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400">
                                    Benchmark your performance against competitors and identify opportunities to gain a competitive edge.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    Historical Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400">
                                    Visualize performance trends over time with beautiful charts and identify patterns that impact user experience.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    Multi-Device Testing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-400">
                                    Test your site on both mobile and desktop to ensure optimal performance across all devices.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Technology */}
                <section className="space-y-4 md:space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Built with Modern Technology</h2>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                        PerfMonitor is powered by industry-leading tools and frameworks:
                    </p>
                    <ul className="space-y-3 text-zinc-300">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Google PageSpeed Insights API</strong> for accurate, standardized performance scoring</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Next.js 14</strong> for a blazing-fast, server-rendered frontend</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Supabase</strong> for secure authentication and real-time database</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Vercel Edge Network</strong> for global deployment and optimal performance</span>
                        </li>
                    </ul>
                </section>

                {/* Future Vision */}
                <section className="space-y-4 md:space-y-6 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/20 rounded-2xl p-4 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold">What&apos;s Next?</h2>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
                        We&apos;re constantly evolving to meet the needs of modern web developers and businesses. Upcoming features include:
                    </p>
                    <ul className="space-y-3 text-zinc-300">
                        <li className="flex items-start gap-3">
                            <ArrowRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Google Analytics Integration</strong> - Connect your GA4 data for deeper insights</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <ArrowRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Search Console Integration</strong> - Monitor SEO performance alongside Core Web Vitals</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <ArrowRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Automated Weekly/Monthly Reports</strong> - Get comprehensive performance summaries delivered to your inbox</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <ArrowRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span><strong>AI-Powered Recommendations</strong> - Receive intelligent suggestions for performance improvements</span>
                        </li>
                    </ul>
                </section>

                {/* CTA */}
                <section className="text-center space-y-4 md:space-y-6 py-8 md:py-12">
                    <h2 className="text-2xl md:text-3xl font-bold">Ready to Optimize Your Website?</h2>
                    <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
                        Join businesses worldwide who trust PerfMonitor to keep their websites fast, accessible, and competitive.
                    </p>
                    <Link href="/signup" className="inline-block">
                        <Button variant="premium" size="lg" className="h-11 md:h-12 px-6 md:px-8 text-sm md:text-base rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                            Start Monitoring Free <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </section>
            </main>

            <footer className="border-t border-zinc-900 bg-black/80 py-8 md:py-12 text-center text-xs md:text-sm text-zinc-500 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap justify-center gap-4 md:gap-6 px-4">
                    <Link href="https://github.com/bilalmughal1" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
                    <Link href="https://fahadbilal.com" target="_blank" className="hover:text-white transition-colors">Portfolio</Link>
                    <Link href="https://linkedin.com/in/fahadbilalsaleem" target="_blank" className="hover:text-white transition-colors">LinkedIn</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} Fahad Bilal Saleem. All rights reserved.</p>
            </footer>
        </div>
    );
}
