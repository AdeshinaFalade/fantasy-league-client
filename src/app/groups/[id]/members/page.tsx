'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { GroupMember, User } from '@/types';
import { formatDate } from '@/utils/format';

export default function GroupMembersPage() {
    const params = useParams<{ id: string }>();
    const groupId = useMemo(() => params.id, [params.id]);
    const router = useRouter();

    const [members, setMembers] = useState<GroupMember[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const currentUserRole = useMemo(() => {
        if (!currentUser) return null;
        const membership = members.find((m) => m.userId === currentUser.id);
        return membership?.role ?? null;
    }, [members, currentUser]);

    const loadData = async () => {
        setError('');
        try {
            // Get current user profile
            const profilePayload = await api.auth.me();
            const me = (profilePayload as { session?: { user?: User } }).session?.user ?? (profilePayload as { user?: User }).user ?? null;
            setCurrentUser(me);

            // Get group members
            const memberList = await api.groups.members(groupId);
            setMembers(memberList);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load group members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    const toggleRole = async (member: GroupMember) => {
        const newRole = member.role === 'ADMIN' ? 'PARTICIPANT' : 'ADMIN';
        setActionLoading(member.id);
        try {
            await api.groups.updateMemberRole(groupId, member.userId, newRole);
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update member role');
        } finally {
            setActionLoading(null);
        }
    };

    const removeMember = async (member: GroupMember) => {
        const confirmMsg = member.userId === currentUser?.id
            ? 'Are you sure you want to leave this group?'
            : `Are you sure you want to remove ${member.user?.name || member.user?.email} from the group?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        setActionLoading(member.id);
        try {
            await api.groups.removeMember(groupId, member.userId);
            if (member.userId === currentUser?.id) {
                // User left the group
                router.push('/dashboard');
            } else {
                await loadData();
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove member');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <PageShell
            title="Group Members"
            description="Manage group membership, roles, and promote/demote members."
            actions={
                <Link href={`/groups/${groupId}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                    Back to group
                </Link>
            }
        >
            <Section title="Members List" description="All users currently in this competition group.">
                {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    </div>
                ) : members.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                                    <th className="pb-3 pt-2">Name</th>
                                    <th className="pb-3 pt-2">Email</th>
                                    <th className="pb-3 pt-2">Role</th>
                                    <th className="pb-3 pt-2">Joined</th>
                                    {currentUserRole === 'ADMIN' && <th className="pb-3 pt-2 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <tr key={member.id} className="align-middle">
                                        <td className="py-3.5 font-medium text-slate-900">{member.user?.name || '—'}</td>
                                        <td className="py-3.5 text-slate-600">{member.user?.email || '—'}</td>
                                        <td className="py-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-slate-500">{formatDate(member.joinedAt)}</td>
                                        {currentUserRole === 'ADMIN' && (
                                            <td className="py-3.5 text-right space-x-2">
                                                {member.userId !== currentUser?.id && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={actionLoading !== null}
                                                            onClick={() => toggleRole(member)}
                                                        >
                                                            {member.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={actionLoading !== null}
                                                            onClick={() => removeMember(member)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </>
                                                )}
                                                {member.userId === currentUser?.id && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={actionLoading !== null}
                                                        onClick={() => removeMember(member)}
                                                    >
                                                        Leave Group
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState title="No members" description="This group has no members yet." />
                )}
            </Section>
        </PageShell>
    );
}
