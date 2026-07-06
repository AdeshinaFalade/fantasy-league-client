import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-xl shadow-indigo-100/40 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Fantasy League</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900">
                    Competition groups, events, predictions, and leaderboards.
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 leading-relaxed">
                    Predict matches, define custom rules, and climb the leaderboard in the ultimate custom fantasy sports competition.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/login" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-md shadow-indigo-200/50">
                        Login
                    </Link>
                    <Link href="/register" className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition">
                        Register
                    </Link>
                    <Link href="/dashboard" className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition">
                        Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
