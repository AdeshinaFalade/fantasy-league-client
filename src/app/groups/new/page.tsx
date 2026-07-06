'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function CreateGroupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const group = await api.groups.create({ name });
            router.push(`/groups/${group.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell title="Create Group" description="Creates a group and makes you the admin.">
            <form onSubmit={submit} className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name" required />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create group'}</Button>
            </form>
        </PageShell>
    );
}
