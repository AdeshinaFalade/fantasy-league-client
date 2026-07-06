'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { Event, Group, Leaderboard, Rule, User } from '@/types';

export default function GroupDetailPage() {
    const params = useParams<{ id: string }>();
    const groupId = useMemo(() => params.id, [params.id]);
    const router = useRouter();

    const [group, setGroup] = useState<Group | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Modal state for creating event
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventName, setEventName] = useState('');
    const [eventDesc, setEventDesc] = useState('');
    const [eventStartsAt, setEventStartsAt] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const loadData = async () => {
        try {
            // Load current user
            const profilePayload = await api.auth.me();
            const me = (profilePayload as { session?: { user?: User } }).session?.user ?? (profilePayload as { user?: User }).user ?? null;
            setCurrentUser(me);

            // Load group
            const groupData = await api.groups.byId(groupId);
            setGroup(groupData);

            // Load members to check if current user is admin
            const members = await api.groups.members(groupId);
            if (me) {
                const membership = members.find((member) => member.userId === me.id);
                setIsAdmin(membership?.role === 'ADMIN');
            }

            // Load events
            const eventList = await api.events.byGroup(groupId);
            setEvents(eventList);

            // Load leaderboard
            const board = await api.leaderboard.byGroup(groupId);
            setLeaderboard(board);
        } catch (err) {
            console.error('Error loading group details:', err);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    useEffect(() => {
        if (!events.length) {
            setRules([]);
            return;
        }
        api.rules.byEvent(events[0].id).then(setRules).catch(() => setRules([]));
    }, [events]);

    const handleDeleteGroup = async () => {
        if (!confirm('WARNING: Are you sure you want to delete this group? This action is permanent.')) {
            return;
        }

        try {
            await api.groups.remove(groupId);
            router.push('/dashboard');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete group');
        }
    };

    const handleCreateEvent = async (event: FormEvent) => {
        event.preventDefault();
        setModalError('');
        setModalLoading(true);

        try {
            await api.events.create({
                groupId,
                name: eventName,
                description: eventDesc,
                startsAt: eventStartsAt || new Date().toISOString(),
            });

            // Close modal & reset form
            setIsEventModalOpen(false);
            setEventName('');
            setEventDesc('');
            setEventStartsAt('');

            // Reload events
            const eventList = await api.events.byGroup(groupId);
            setEvents(eventList);
        } catch (err) {
            setModalError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <PageShell
            title={group?.name ?? 'Group details'}
            description={group ? `Invite code: ${group.inviteCode}` : 'Loading group data.'}
            actions={
                <div className="flex gap-2">
                    <Link href={`/groups/${groupId}/members`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                        Members
                    </Link>
                    {isAdmin && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteGroup}>
                            Delete Group
                        </Button>
                    )}
                </div>
            }
        >
            <div className="grid gap-4 lg:grid-cols-2">
                <Section
                    title="Events"
                    action={
                        isAdmin ? (
                            <Button size="sm" onClick={() => setIsEventModalOpen(true)}>
                                Create Event
                            </Button>
                        ) : undefined
                    }
                >
                    <div className="space-y-3">
                        {events.length ? (
                            events.map((event) => (
                                <Link key={event.id} href={`/events/${event.id}`} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900">{event.name}</p>
                                            {event.description && <p className="text-sm text-slate-500 mt-1">{event.description}</p>}
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
                                            event.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                            event.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800' :
                                            event.status === 'SCORING' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <EmptyState
                                title="No events"
                                description={isAdmin ? "Create an event to start predictions." : "Waiting for the admin to create events."}
                            />
                        )}
                    </div>
                </Section>

                <Section title="Leaderboard">
                    {leaderboard?.rankings?.length ? (
                        <div className="space-y-2">
                            {leaderboard.rankings.map((entry) => (
                                <div key={entry.userId} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm">
                                    <span className="font-medium">
                                        #{entry.rank} {entry.name} {entry.userId === currentUser?.id ? '(You)' : ''}
                                    </span>
                                    <span className="font-bold text-slate-900">{entry.score} pts</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No leaderboard yet" description="Scores appear after results are recorded." />
                    )}
                </Section>

                {events.length > 0 && (
                    <Section title={`Rules: ${events[0].name}`} description="Scoring rules for predictions in the current event.">
                        {rules.length ? (
                            <div className="space-y-2 text-sm">
                                {rules.map((rule) => (
                                    <div key={rule.id} className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50">
                                        <span className="font-medium text-slate-900">{rule.player}</span> should get {rule.metric}{' '}
                                        <span className="font-semibold">{rule.condition}</span> {Number(rule.threshold)}
                                        <span className="float-right font-bold text-blue-600">+{rule.score} pts</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No rules loaded"
                                description="Open this event to add or manage rules."
                                href={`/events/${events[0].id}`}
                                label="Manage rules"
                            />
                        )}
                    </Section>
                )}

                <Section title="Quick Actions">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link href="/dashboard" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                            Dashboard
                        </Link>
                        <Link href="/profile" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                            My Profile
                        </Link>
                    </div>
                </Section>
            </div>

            {/* Event Creation Modal */}
            <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create Event">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                        <Input
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="e.g. Gameweek 1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                        <Textarea
                            value={eventDesc}
                            onChange={(e) => setEventDesc(e.target.value)}
                            placeholder="e.g. Champions League Predictions"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Starts At (Optional)</label>
                        <Input
                            type="datetime-local"
                            value={eventStartsAt}
                            onChange={(e) => setEventStartsAt(e.target.value)}
                        />
                    </div>
                    {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={modalLoading}>
                            {modalLoading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageShell>
    );
}
