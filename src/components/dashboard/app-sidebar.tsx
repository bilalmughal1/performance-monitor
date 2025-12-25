"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    LineChart,
    Settings,
    CreditCard,
    LogOut,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils"; // We might need to create this util if missing

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Sites & Reports", href: "/dashboard", icon: LineChart }, // Duplicate for now or filter
    { label: "Subscription", href: "/pricing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl md:flex">
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
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
