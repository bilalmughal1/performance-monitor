import Link from "next/link";
import Image from "next/image";

const features = [
  "Mobile and desktop PageSpeed Insights runs",
  "Historical charts, filters, and CSV export",
  "Per-user data isolation with Supabase RLS",
  "Track LCP, INP, CLS, SEO, Accessibility over time",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <div className="text-lg font-semibold">Performance Monitor</div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="underline">
            Login
          </Link>
          <Link href="/signup" className="rounded border border-white bg-white px-3 py-1 text-black">
            Create account
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 md:px-8">
        <section className="space-y-6 rounded border border-zinc-800 bg-zinc-950 p-6 md:p-10">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Web Performance Monitor</p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Track real world web performance metrics like LCP, INP, CLS, SEO, and Accessibility over time.
          </h1>
          <p className="text-zinc-400">
            Monitor your sites with PageSpeed Insights, see trends, export CSV, and keep data secure with Supabase RLS.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/login" className="rounded bg-white px-4 py-2 text-black">
              Login
            </Link>
            <Link href="/signup" className="rounded border border-zinc-700 px-4 py-2 text-white">
              Create account
            </Link>
            <Link
              href="https://performance-monitor-beta.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-zinc-700 px-4 py-2 text-white"
            >
              View demo
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Why use it</h2>
            <ul className="space-y-2 text-sm text-zinc-300">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-zinc-500">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Tech stack</h2>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-zinc-500">
              <span className="rounded border border-zinc-800 px-2 py-1">Next.js</span>
              <span className="rounded border border-zinc-800 px-2 py-1">Supabase</span>
              <span className="rounded border border-zinc-800 px-2 py-1">PageSpeed Insights</span>
              <span className="rounded border border-zinc-800 px-2 py-1">Vercel</span>
            </div>
            <div className="space-y-1 text-sm text-zinc-300">
              <p>Secure auth, RLS, and client-side filtering with Supabase.</p>
              <p>Charts and CSV export for reporting.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 text-sm text-zinc-200">
              <div className="overflow-hidden rounded border border-zinc-800">
                <Image
                  src="/preview-dashboard.png"
                  alt="Dashboard preview"
                  width={800}
                  height={450}
                  className="h-40 w-full object-cover"
                  priority
                />
              </div>
              <p className="mt-3 font-medium text-zinc-100">Dashboard</p>
              <p className="text-zinc-400">Summary cards, per-site actions, and metric pills.</p>
            </div>
            <div className="rounded border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 text-sm text-zinc-200">
              <div className="overflow-hidden rounded border border-zinc-800">
                <Image
                  src="/preview-history.png"
                  alt="History page preview"
                  width={800}
                  height={450}
                  className="h-40 w-full object-cover"
                />
              </div>
              <p className="mt-3 font-medium text-zinc-100">History</p>
              <p className="text-zinc-400">Charts, filters, CSV export, and run details drawer.</p>
            </div>
            <div className="rounded border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 text-sm text-zinc-200">
              <div className="overflow-hidden rounded border border-zinc-800">
                <Image
                  src="/preview-auth.png"
                  alt="Auth page preview"
                  width={800}
                  height={450}
                  className="h-40 w-full object-cover"
                />
              </div>
              <p className="mt-3 font-medium text-zinc-100">Auth</p>
              <p className="text-zinc-400">Login and signup with inline validation on a dark UI.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500 md:px-8">
        Built by Fahad Bilal Saleem{" "}
        <Link className="underline" href="https://github.com/bilalmughal1" target="_blank" rel="noreferrer">
          GitHub
        </Link>{" "}
        |{" "}
        <Link className="underline" href="https://fahadbilal.com" target="_blank" rel="noreferrer">
          Portfolio
        </Link>{" "}
        |{" "}
        <Link className="underline" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
          LinkedIn
        </Link>
      </footer>
    </div>
  );
}
