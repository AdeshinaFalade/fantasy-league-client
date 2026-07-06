'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { api } from '@/lib/api';
import type { Group } from '@/types';

export default function GroupsPage() {
    const [groups, setGroups] = useState<Array<Group & { role?: string | null }>>([]);

    useEffect(() => {
        api.users.meGroups().then(setGroups).catch(() => setGroups([]));
    }, []);

    return (
        <PageShell title="My Groups" description="Joined groups and their invite codes.">
            <Section title="Groups" action={<Link href="/groups/new" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Create group</Link>}>
                <div className="space-y-3">
                    {groups.length ? groups.map((group) => (
                        <Link key={group.id} href={`/groups/${group.id}`} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium">{group.name}</p>
                                    <p className="text-sm text-slate-600">Invite code: {group.inviteCode}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{group.role ?? 'Member'}</span>
                            </div>
                        </Link>
                    )) : <EmptyState title="No groups joined" description="Create one or join with an invite code." href="/groups/join" label="Join a group" />}
                </div>
            </Section>
        </PageShell>
    );
}
