'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { tokenStorage } from '@/utils/token';

type ShellProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    requireAuth?: boolean;
    anonymousOnly?: boolean;
};

type SessionUser = {
    id?: string;
    email?: string;
    name?: string;
    image?: string | null;
    role?: string;
};

function extractUser(payload: unknown): SessionUser | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const session = (payload as { session?: unknown }).session;
    if (session && typeof session === 'object') {
        const nestedUser = (session as { user?: SessionUser }).user;
        if (nestedUser) {
            return nestedUser;
        }
    }

    const directUser = (payload as { user?: SessionUser }).user;
    return directUser ?? null;
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {name
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
        </div>
    );
}

export function PageShell({
    title,
    description,
    children,
    actions,
    requireAuth = true,
    anonymousOnly = false,
}: ShellProps) {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(() => tokenStorage.getUser<SessionUser>());
    const [loading, setLoading] = useState(true);

    const nav = useMemo(
        () => [
            ['Dashboard', '/dashboard'],
            ['Groups', '/groups'],
            ['Create', '/groups/new'],
            ['Join', '/groups/join'],
            ['Profile', '/profile'],
        ],
        [],
    );

    useEffect(() => {
        let active = true;

        api.auth
            .me()
            .then((payload) => {
                if (!active) {
                    return;
                }

                const currentUser = extractUser(payload);
                if (currentUser) {
                    tokenStorage.setUser(currentUser);
                    setUser(currentUser);
                    if (anonymousOnly) {
                        router.push('/dashboard');
                    }
                } else {
                    tokenStorage.clearToken();
                    setUser(null);
                    if (requireAuth) {
                        router.push('/login');
                    }
                }
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                tokenStorage.clearToken();
                setUser(null);
                if (requireAuth) {
                    router.push('/login');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [requireAuth, anonymousOnly, router]);

    if (loading && (requireAuth || anonymousOnly)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (requireAuth && !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (anonymousOnly && user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }



    const signOut = async () => {
        try {
            await api.auth.logout();
        } finally {
            tokenStorage.clearToken();
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_35%,_#f8fafc_100%)] text-slate-900">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
                        Fantasy League
                    </Link>
                    <nav className="hidden gap-4 text-sm text-slate-600 md:flex">
                        {nav.map(([label, href]) => (
                            <Link key={label} href={href} className="hover:text-slate-900">
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        {loading ? null : user ? (
                            <>
                                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm md:flex">
                                    <Avatar name={user.name ?? user.email ?? 'User'} />
                                    <span className="max-w-40 truncate">{user.name ?? user.email}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={signOut}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                                    Login
                                </Link>
                                <Link href="/register" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
                </div>

                {children}
            </main>
        </div>
    );
}
