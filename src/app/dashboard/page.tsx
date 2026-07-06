'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { api } from '@/lib/api';
import type { Group, User } from '@/types';

export default function DashboardPage() {
    const [groups, setGroups] = useState<Array<Group & { role?: string | null }>>([]);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.auth.me().then((payload) => {
            const nestedUser = (payload as { session?: { user?: User } }).session?.user ?? (payload as { user?: User }).user ?? null;
            setUser(nestedUser);
        }).catch(() => undefined);

        api.users.meGroups()
            .then(setGroups)
            .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load groups'));
    }, []);

    return (
        <PageShell
            title="Dashboard"
            description="Your joined groups and shortcuts to the main competition workflows."
            actions={
                <>
                    <Link href="/groups/new" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Create group</Link>
                    <Link href="/groups/join" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Join group</Link>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-2">
                <Section title="My Groups" description="Open a group to manage events, rules, predictions, and scores.">
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <div className="space-y-3">
                        {groups.length ? groups.map((group) => (
                            <Link key={group.id} href={`/groups/${group.id}`} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium">{group.name}</p>
                                        <p className="text-sm text-slate-600">Invite code: {group.inviteCode}</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-600">{group.role ?? 'Member'}</span>
                                </div>
                            </Link>
                        )) : <EmptyState title="No groups yet" description="Create or join a group to get started." href="/groups/new" label="Create a group" />}
                    </div>
                </Section>

                <Section title="Profile" description="Current session and profile data.">
                    {user ? (
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {user.name ?? '—'}</p>
                            <p><span className="font-medium">Email:</span> {user.email ?? '—'}</p>
                            <p><span className="font-medium">Role:</span> {user.role ?? '—'}</p>
                            <Link href="/profile" className="inline-flex rounded-lg border border-slate-200 px-3 py-2">Open profile</Link>
                        </div>
                    ) : (
                        <EmptyState title="Not signed in" description="Use the login page to load your session." href="/login" label="Login" />
                    )}
                </Section>
            </div>
        </PageShell>
    );
}
