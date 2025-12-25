export type BusinessImpactMetrics = {
  estimatedBounceRate: number; // 0-100 percentage
  revenueRisk: "Low" | "Medium" | "High" | "Critical";
  visitorLossDescription: string;
  seoPenaltyRisk: "None" | "Possible" | "Likely";
};

/**
 * Calculates business impact based on LCP (Largest Contentful Paint).
 * Data derived from Google/Deloitte studies on page speed.
 * @param lcpMs LCP in milliseconds
 */
export function calculateBusinessImpact(lcpMs: number | null): BusinessImpactMetrics {
  if (lcpMs === null) {
    return {
      estimatedBounceRate: 0,
      revenueRisk: "Low",
      visitorLossDescription: "No data available yet.",
      seoPenaltyRisk: "None",
    };
  }

  // Google Study: As load time goes from 1s to 3s, bounce rate increases 32%.
  // 1s to 5s -> 90%.
  // 1s to 6s -> 106%.
  // 1s to 10s -> 123%.
  
  let estimatedBounceRate = 10; // Base bounce rate for fast sites
  let revenueRisk: BusinessImpactMetrics["revenueRisk"] = "Low";
  let seoPenaltyRisk: BusinessImpactMetrics["seoPenaltyRisk"] = "None";
  let visitorLossDescription = "Your site is fast. Minimal visitor loss expected.";

  if (lcpMs > 1000 && lcpMs <= 2500) {
    // 1s - 2.5s (Good/Needs Improvement boundary)
    estimatedBounceRate = 15 + ((lcpMs - 1000) / 1500) * 15; // Scale to ~30%
    revenueRisk = "Low";
    seoPenaltyRisk = "None"; // Google considers < 2.5s "Good"
    visitorLossDescription = "Good speed, but every 0.1s improvement could boost conversions by 1%.";
  } else if (lcpMs > 2500 && lcpMs <= 4000) {
    // 2.5s - 4.0s (Needs Improvement)
    estimatedBounceRate = 30 + ((lcpMs - 2500) / 1500) * 30; // Scale to ~60%
    revenueRisk = "Medium";
    seoPenaltyRisk = "Possible";
    visitorLossDescription = "You are likely losing ~30-50% of impatient visitors before they even see content.";
  } else if (lcpMs > 4000) {
    // > 4.0s (Poor)
    estimatedBounceRate = 60 + Math.min(40, ((lcpMs - 4000) / 4000) * 30); // Scale up to 90%+
    revenueRisk = "High";
    seoPenaltyRisk = "Likely";
    visitorLossDescription = "Critical Issues: High probability of 60%+ visitor abandonment.";
  }

  if (lcpMs > 6000) {
    revenueRisk = "Critical";
  }

  return {
    estimatedBounceRate: Math.round(estimatedBounceRate),
    revenueRisk,
    visitorLossDescription,
    seoPenaltyRisk,
  };
}
