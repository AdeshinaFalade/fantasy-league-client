'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { EmptyState, Section } from '@/components/route-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { Event, Prediction, Rule, User } from '@/types';
import { STATUS_LABELS } from '@/utils/format';

export default function EventDetailPage() {
    const params = useParams<{ id: string }>();
    const eventId = useMemo(() => params.id, [params.id]);
    const router = useRouter();

    const [event, setEvent] = useState<Event | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    // Rule creation form state
    const [ruleForm, setRuleForm] = useState({
        player: '',
        metric: '',
        condition: 'GT',
        threshold: '1',
        score: '10',
    });
    const [submittingRule, setSubmittingRule] = useState(false);

    // Prediction form state
    const [predictionSelections, setPredictionSelections] = useState<Record<string, boolean>>({});
    const [submittingPrediction, setSubmittingPrediction] = useState(false);

    // Dynamic result inputs state
    const [resultInputs, setResultInputs] = useState<Record<string, Record<string, number>>>({});
    const [submittingResult, setSubmittingResult] = useState(false);

    // Find current user's prediction
    const myPrediction = useMemo(() => {
        if (!currentUser) return null;
        return predictions.find((p) => p.userId === currentUser.id) ?? null;
    }, [predictions, currentUser]);

    // Find unique player + metric combinations from active rules for dynamic results entry
    const uniquePlayerMetrics = useMemo(() => {
        const combinations: Array<{ player: string; metric: string }> = [];
        const seen = new Set<string>();

        for (const rule of rules) {
            const key = `${rule.player}:${rule.metric}`;
            if (!seen.has(key)) {
                seen.add(key);
                combinations.push({ player: rule.player, metric: rule.metric });
            }
        }

        return combinations;
    }, [rules]);

    const loadData = async () => {
        try {
            // Load current user
            const profilePayload = await api.auth.me();
            const me = (profilePayload as { session?: { user?: User } }).session?.user ?? (profilePayload as { user?: User }).user ?? null;
            setCurrentUser(me);

            // Load event
            const eventData = await api.events.byId(eventId);
            setEvent(eventData);

            // Check if current user is admin of this group
            const members = await api.groups.members(eventData.groupId);
            if (me) {
                const membership = members.find((member) => member.userId === me.id);
                setIsAdmin(membership?.role === 'ADMIN');
            }

            // Load rules
            const ruleList = await api.rules.byEvent(eventId);
            setRules(ruleList);

            // Load predictions
            const predictionList = await api.predictions.byEvent(eventId);
            setPredictions(predictionList);
        } catch (err) {
            console.error('Error loading event data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId]);

    // Initialize result inputs structure when unique combinations change
    useEffect(() => {
        const initialInputs: Record<string, Record<string, number>> = {};
        for (const { player, metric } of uniquePlayerMetrics) {
            if (!initialInputs[player]) {
                initialInputs[player] = {};
            }
            initialInputs[player][metric] = 0;
        }
        setResultInputs(initialInputs);
    }, [uniquePlayerMetrics]);

    // Initialize prediction choices to false for all rules if not already predicted
    useEffect(() => {
        if (myPrediction?.selections) {
            setPredictionSelections(myPrediction.selections);
            return;
        }
        const initialSelections: Record<string, boolean> = {};
        for (const rule of rules) {
            initialSelections[rule.id] = false;
        }
        setPredictionSelections(initialSelections);
    }, [rules, myPrediction]);

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleAddRule = async (e: FormEvent) => {
        e.preventDefault();
        setSubmittingRule(true);
        try {
            await api.rules.create({
                eventId,
                player: ruleForm.player,
                metric: ruleForm.metric,
                condition: ruleForm.condition as any,
                threshold: Number(ruleForm.threshold),
                score: Number(ruleForm.score),
            });
            showMessage('Rule created successfully.');
            setRuleForm({ player: '', metric: '', condition: 'GT', threshold: '1', score: '10' });
            // Reload rules
            const ruleList = await api.rules.byEvent(eventId);
            setRules(ruleList);
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'Failed to add rule', 'error');
        } finally {
            setSubmittingRule(false);
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        try {
            await api.rules.remove(ruleId);
            showMessage('Rule deleted successfully.');
            setRules(await api.rules.byEvent(eventId));
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'Failed to delete rule', 'error');
        }
    };

    const handleToggleStatus = async (status: 'OPEN' | 'CLOSED' | 'SCORING' | 'COMPLETED') => {
        try {
            const updated = await api.events.setStatus(eventId, status);
            setEvent(updated);
            showMessage(`Event status changed to ${STATUS_LABELS[status]}.`);
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'Failed to update status', 'error');
        }
    };

    const handleSubmitPrediction = async (e: FormEvent) => {
        e.preventDefault();
        if (!event) return;
        setSubmittingPrediction(true);
        try {
            await api.predictions.create({
                eventId,
                groupId: event.groupId,
                selections: predictionSelections,
            });
            showMessage('Prediction submitted successfully.');
            // Reload predictions
            setPredictions(await api.predictions.byEvent(eventId));
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'Failed to submit prediction', 'error');
        } finally {
            setSubmittingPrediction(false);
        }
    };

    const handleRecordResult = async (e: FormEvent) => {
        e.preventDefault();
        setSubmittingResult(true);
        try {
            await api.events.recordResult({
                eventId,
                payload: resultInputs,
            });
            showMessage('Results recorded successfully.');
            // Reload event status (should become SCORING)
            const eventData = await api.events.byId(eventId);
            setEvent(eventData);
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'Failed to record results', 'error');
        } finally {
            setSubmittingResult(false);
        }
    };

    return (
        <PageShell
            title={event?.name ?? 'Event Details'}
            description={event ? `${event.description || 'No description provided.'}` : 'Loading event data.'}
            actions={
                <div className="flex gap-2">
                    <Link href={`/groups/${event?.groupId || ''}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                        Back to Group
                    </Link>
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
                </div>
            ) : event ? (
                <>
                    {message ? (
                        <div className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                            messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {message}
                        </div>
                    ) : null}

                    {/* Top status bar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 font-medium">Status:</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                event.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                event.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800' :
                                event.status === 'SCORING' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                            }`}>
                                {STATUS_LABELS[event.status]}
                            </span>
                        </div>
                        {isAdmin && (
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus('OPEN')} disabled={event.status === 'OPEN'}>Open Predictions</Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus('CLOSED')} disabled={event.status === 'CLOSED'}>Close Predictions</Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus('SCORING')} disabled={event.status === 'SCORING'}>Set Scoring</Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleStatus('COMPLETED')} disabled={event.status === 'COMPLETED'}>Complete Event</Button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Rules list & creation form */}
                        <div className="space-y-6">
                            <Section
                                title="Competition Rules"
                                description="Criteria for scoring predictions. Predictions are made per rule."
                            >
                                <div className="space-y-3">
                                    {rules.length ? (
                                        rules.map((rule) => (
                                            <div key={rule.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50 text-sm">
                                                <div>
                                                    <span className="font-semibold text-slate-900">{rule.player}</span>
                                                    <span className="text-slate-600"> {rule.metric} </span>
                                                    <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded">{rule.condition}</span>
                                                    <span className="font-bold text-slate-900"> {Number(rule.threshold)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-blue-600">+{rule.score} pts</span>
                                                    {isAdmin && event.status === 'OPEN' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon-sm"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                        >
                                                            ×
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState title="No rules defined" description={isAdmin ? "Define rules below so members can predict." : "Wait for admin to create rules."} />
                                    )}
                                </div>
                            </Section>

                            {isAdmin && event.status === 'OPEN' && (
                                <Section title="Add Scoring Rule" description="Create a new condition for this event.">
                                    <form onSubmit={handleAddRule} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Player/Team Name</label>
                                            <Input
                                                value={ruleForm.player}
                                                onChange={(e) => setRuleForm((curr) => ({ ...curr, player: e.target.value }))}
                                                placeholder="e.g. Messi, Arsenal, Lakers"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Metric</label>
                                            <Input
                                                value={ruleForm.metric}
                                                onChange={(e) => setRuleForm((curr) => ({ ...curr, metric: e.target.value }))}
                                                placeholder="e.g. goals, assists, points"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Condition</label>
                                            <select
                                                className="h-10 w-full rounded-lg border border-slate-200 px-3 bg-white text-sm"
                                                value={ruleForm.condition}
                                                onChange={(e) => setRuleForm((curr) => ({ ...curr, condition: e.target.value }))}
                                            >
                                                {['GT', 'LT', 'EQ', 'GTE', 'LTE', 'NEQ'].map((val) => (
                                                    <option key={val} value={val}>
                                                        {val === 'GT' ? 'Greater Than (>)' :
                                                         val === 'LT' ? 'Less Than (<)' :
                                                         val === 'EQ' ? 'Equal To (=)' :
                                                         val === 'GTE' ? 'Greater Than or Equal (≥)' :
                                                         val === 'LTE' ? 'Less Than or Equal (≤)' :
                                                         'Not Equal (≠)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Threshold</label>
                                                <Input
                                                    type="number"
                                                    value={ruleForm.threshold}
                                                    onChange={(e) => setRuleForm((curr) => ({ ...curr, threshold: e.target.value }))}
                                                    placeholder="Threshold"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Score Value (pts)</label>
                                                <Input
                                                    type="number"
                                                    value={ruleForm.score}
                                                    onChange={(e) => setRuleForm((curr) => ({ ...curr, score: e.target.value }))}
                                                    placeholder="Score"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submittingRule} className="w-full">
                                            {submittingRule ? 'Adding...' : 'Add Rule'}
                                        </Button>
                                    </form>
                                </Section>
                            )}
                        </div>

                        {/* Prediction / Results Submission */}
                        <div className="space-y-6">
                            {/* Predictions display / submission */}
                            <Section
                                title="Your Prediction"
                                description={
                                    event.status === 'OPEN'
                                        ? "Toggle predictions for each rule before the event starts."
                                        : "Predictions are closed for this event."
                                }
                            >
                                {myPrediction ? (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900">
                                            <p className="font-semibold">Prediction Submitted Successfully!</p>
                                            <p className="text-xs text-blue-600 mt-1">Submitted at: {new Date(myPrediction.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {rules.map((rule) => {
                                                const choice = myPrediction.selections[rule.id];
                                                return (
                                                    <div key={rule.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white text-sm">
                                                        <span>{rule.player} {rule.metric}</span>
                                                        <span className={`font-semibold rounded px-2.5 py-0.5 text-xs ${choice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {choice ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : event.status === 'OPEN' ? (
                                    rules.length ? (
                                        <form onSubmit={handleSubmitPrediction} className="space-y-4">
                                            <div className="space-y-2">
                                                {rules.map((rule) => (
                                                    <div key={rule.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white text-sm">
                                                        <span className="font-medium text-slate-800">
                                                            Will {rule.player} get {rule.metric} {rule.condition} {Number(rule.threshold)}?
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPredictionSelections((curr) => ({ ...curr, [rule.id]: true }))}
                                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                                                                    predictionSelections[rule.id] === true
                                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPredictionSelections((curr) => ({ ...curr, [rule.id]: false }))}
                                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                                                                    predictionSelections[rule.id] === false
                                                                        ? 'bg-red-600 text-white border-red-600'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="submit" disabled={submittingPrediction} className="w-full">
                                                {submittingPrediction ? 'Submitting...' : 'Submit Prediction'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <EmptyState title="Predictions pending" description="Rules must be defined before submitting predictions." />
                                    )
                                ) : (
                                    <EmptyState title="No prediction submitted" description="Predictions are closed." />
                                )}
                            </Section>

                            {/* Dynamic Results Recording (Admin Only) */}
                            {isAdmin && (event.status === 'CLOSED' || event.status === 'SCORING') && (
                                <Section
                                    title="Record Event Results"
                                    description="Enter final stats. This dynamically matches players and metrics from current rules."
                                >
                                    {uniquePlayerMetrics.length ? (
                                        <form onSubmit={handleRecordResult} className="space-y-4">
                                            <div className="space-y-3">
                                                {uniquePlayerMetrics.map(({ player, metric }) => (
                                                    <div key={`${player}:${metric}`} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white">
                                                        <div>
                                                            <p className="font-semibold text-sm text-slate-900">{player}</p>
                                                            <p className="text-xs text-slate-500 uppercase font-medium">{metric}</p>
                                                        </div>
                                                        <div className="w-32">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={resultInputs[player]?.[metric] ?? 0}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    setResultInputs((curr) => ({
                                                                        ...curr,
                                                                        [player]: {
                                                                            ...(curr[player] ?? {}),
                                                                            [metric]: val,
                                                                        },
                                                                    }));
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="submit" disabled={submittingResult} className="w-full">
                                                {submittingResult ? 'Recording...' : 'Record Result & Calculate Scores'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <EmptyState title="Cannot record results" description="Add rules to this event first." />
                                    )}
                                </Section>
                            )}

                            {/* All group predictions summary */}
                            <Section title="Group Submissions Log" description="All user predictions log for audit.">
                                <div className="space-y-2 text-xs text-slate-600 max-h-40 overflow-y-auto">
                                    {predictions.length ? (
                                        predictions.map((p) => (
                                            <div key={p.id} className="flex justify-between border-b border-slate-100 pb-2">
                                                <span>User: {p.userId.slice(0, 8)}...</span>
                                                <span className="font-medium uppercase">{p.status}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No submissions recorded from group members yet.</p>
                                    )}
                                </div>
                            </Section>
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState title="Event Not Found" description="The event ID does not match any current record." />
            )}
        </PageShell>
    );
}
