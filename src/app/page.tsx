import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.1),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4">
            <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Fantasy League</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Competition groups, events, predictions, and leaderboards.</h1>
                <p className="mt-4 max-w-2xl text-slate-600">
                    A minimal client for the NestJS backend. Use it to register, create groups, add events, manage rules, submit predictions, record results, and review rankings.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-white">
                        Login
                    </Link>
                    <Link href="/register" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-900">
                        Register
                    </Link>
                    <Link href="/dashboard" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-900">
                        Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
