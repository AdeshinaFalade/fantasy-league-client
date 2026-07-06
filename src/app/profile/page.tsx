'use client';

import { useEffect, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { api } from '@/lib/api';
import type { Prediction, User } from '@/types';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);

    useEffect(() => {
        api.auth.me().then((payload) => {
            const nestedUser = (payload as { session?: { user?: User } }).session?.user ?? (payload as { user?: User }).user ?? null;
            setUser(nestedUser);
            if (nestedUser?.id) {
                api.users.byId(nestedUser.id).then(setUser).catch(() => undefined);
            }
        }).catch(() => setUser(null));
        api.predictions.mine().then(setPredictions).catch(() => setPredictions([]));
    }, []);

    return (
        <PageShell title="User Profile" description="Current account details and your submitted predictions.">
            <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Profile">
                    {user ? (
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {user.name}</p>
                            <p><span className="font-medium">Email:</span> {user.email}</p>
                            <p><span className="font-medium">Role:</span> {user.role}</p>
                            <p><span className="font-medium">Created:</span> {user.createdAt ?? '—'}</p>
                        </div>
                    ) : <EmptyState title="Not signed in" description="Login to view your profile." href="/login" label="Login" />}
                </Section>

                <Section title="My Predictions">
                    <div className="space-y-2">
                        {predictions.length ? predictions.map((prediction) => (
                            <div key={prediction.id} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
                                <p className="font-medium">{prediction.status}</p>
                                <p className="text-slate-600">Event: {prediction.eventId}</p>
                            </div>
                        )) : <EmptyState title="No predictions yet" description="Submit a prediction from an event page." />}
                    </div>
                </Section>
            </div>
        </PageShell>
    );
}
