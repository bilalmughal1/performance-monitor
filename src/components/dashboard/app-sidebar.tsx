"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    LineChart,
    Settings,
    CreditCard,
    LogOut,
    Zap,
    Plug,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Sites & Reports", href: "/dashboard", icon: LineChart },
    { label: "Profile", href: "/dashboard/profile", icon: Settings },
    { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
    { label: "Subscription", href: "/pricing", icon: CreditCard },
    { label: "App Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-colors"
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "md:hidden fixed top-0 left-0 h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 backdrop-blur-xl z-40 transition-transform duration-300",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <NavContent pathname={pathname} handleSignOut={handleSignOut} setMobileMenuOpen={setMobileMenuOpen} />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                <NavContent pathname={pathname} handleSignOut={handleSignOut} setMobileMenuOpen={setMobileMenuOpen} />
            </div>
        </>
    );
}

function NavContent({ pathname, handleSignOut, setMobileMenuOpen }: {
    pathname: string;
    handleSignOut: () => void;
    setMobileMenuOpen: (open: boolean) => void;
}) {
    return (
        <>
            <div className="flex h-16 items-center border-b border-zinc-800 px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <Zap className="h-5 w-5 text-indigo-500" fill="currentColor" />
                    <span>PerfMonitor</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1 px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-zinc-800 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </>
    );
}
