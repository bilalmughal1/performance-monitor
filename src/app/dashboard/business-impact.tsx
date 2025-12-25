import { calculateBusinessImpact } from "@/lib/business-metrics";

export function BusinessImpactCard({ lcpMs }: { lcpMs: number | null }) {
    const metrics = calculateBusinessImpact(lcpMs);

    const riskColor = {
        Low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        Medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        High: "text-red-400 border-red-500/30 bg-red-500/10",
        Critical: "text-red-500 border-red-600/30 bg-red-600/10",
    }[metrics.revenueRisk];

    return (
        <div className={`mt-4 rounded-lg border p-4 ${riskColor}`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-90">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                        clipRule="evenodd"
                    />
                </svg>
                Business Impact Analysis
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                    <div className="text-xs opacity-70">Estimated Visitor Loss</div>
                    <div className="text-2xl font-bold">~{metrics.estimatedBounceRate}%</div>
                    <p className="mt-1 text-xs opacity-80">
                        {metrics.visitorLossDescription}
                    </p>
                </div>

                <div>
                    <div className="text-xs opacity-70">Revenue Risk</div>
                    <div className="text-2xl font-bold">{metrics.revenueRisk}</div>
                    <div className="mt-1 text-xs opacity-80">
                        SEO Penalty Risk: <span className="font-semibold">{metrics.seoPenaltyRisk}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
