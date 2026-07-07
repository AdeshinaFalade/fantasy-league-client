'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { tokenStorage } from '@/utils/token';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.auth.login({ email, password });
            if (res?.token) {
                tokenStorage.setToken(res.token);
            }
            if (res?.user) {
                tokenStorage.setUser(res.user);
            }
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell title="Login" description="Welcome back! Sign in to access your dashboard and active fantasy groups." requireAuth={false} anonymousOnly={true}>
            <form onSubmit={submit} className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
                <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" required />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                </Button>
            </form>
        </PageShell>
    );
}
