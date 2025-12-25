"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [loading, setLoading] = useState(false);


    const handleSubscription = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Redirect to login if not logged in
                window.location.href = `/login?next=${window.location.pathname}`;
                return;
            }

            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
                    returnUrl: window.location.href,
                }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900 to-black pointer-events-none" />
            <div className="absolute -top-[200px] left-[20%] w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[100px] right-[20%] w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    Simple, Transparent Pricing
                </h1>
                <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                    Start monitoring your site performance today. Upgrade to unlock competitor benchmarking and business impact analysis.
                </p>

                {/* Toggle */}
                <div className="mt-12 flex justify-center">
                    <div className="relative flex rounded-full bg-zinc-900 p-1 border border-zinc-800">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${billingCycle === "yearly" ? "text-white" : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Yearly <span className="text-xs text-green-400 ml-1">-20%</span>
                        </button>
                        <div
                            className={`absolute top-1 bottom-1 left-1 w-[50%] rounded-full bg-zinc-800 transition-transform ${billingCycle === "yearly" ? "translate-x-[98%]" : ""
                                }`}
                        />
                    </div>
                </div>

                {/* Cards */}
                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12 max-w-4xl mx-auto text-left">
                    {/* Free Tier */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <h3 className="text-xl font-semibold">Starter</h3>
                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-zinc-500">/forever</span>
                        </div>
                        <p className="mt-4 text-sm text-zinc-400">Perfect for hobby projects and personal sites.</p>

                        <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                            <li className="flex items-center gap-3">
                                <CheckIcon /> 1 Site Monitoring
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon /> Manual PageSpeed Runs
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon /> 7-Day Data Retention
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon /> Basic Metrics (LCP, CLS)
                            </li>
                        </ul>

                        <Link
                            href="/signup"
                            className="mt-8 block w-full rounded-lg bg-zinc-800 py-3 text-center text-sm font-medium text-white hover:bg-zinc-700 transition"
                        >
                            Get Started for Free
                        </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="rounded-2xl border border-purple-500/30 bg-zinc-900/80 p-8 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-purple-600 px-3 py-1 text-xs font-bold uppercase text-white rounded-bl-lg">
                            Most Popular
                        </div>
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500/20 to-transparent rounded-2xl pointer-events-none" />

                        <h3 className="text-xl font-semibold text-white">Pro</h3>
                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                                {billingCycle === "monthly" ? "$29" : "$24"}
                            </span>
                            <span className="text-zinc-500">/mo</span>
                        </div>
                        <p className="mt-4 text-sm text-zinc-400">For businesses that depend on performance.</p>

                        <ul className="mt-8 space-y-4 text-sm text-zinc-200">
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> <strong>Up to 10 Sites</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> <strong>Daily Automated Check</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> <strong>Competitor War Room</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> Business Impact Analysis
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> 90-Day Data Retention
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckIcon className="text-purple-400" /> Email Alerts
                            </li>
                        </ul>

                        <button
                            className="mt-8 block w-full rounded-lg bg-white py-3 text-center text-sm font-bold text-black hover:bg-zinc-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                            onClick={handleSubscription}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Upgrade to Pro"}
                        </button>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link href="/" className="text-zinc-500 hover:text-white text-sm transition">Back to Home</Link>
                </div>
            </div>
        </div >
    );
}

function CheckIcon({ className = "text-zinc-500" }: { className?: string }) {
    return (
        <svg
            className={`h-5 w-5 flex-shrink-0 ${className}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}
