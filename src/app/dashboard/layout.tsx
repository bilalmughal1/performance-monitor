import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-indigo-500/30">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-black pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}

