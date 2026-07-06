'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function JoinGroupPage() {
    const router = useRouter();
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.groups.join({ inviteCode });
            router.push('/groups');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to join group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell title="Join Group" description="Paste the invite code you received from a group admin.">
            <form onSubmit={submit} className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Invite code" required />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join group'}</Button>
            </form>
        </PageShell>
    );
}
