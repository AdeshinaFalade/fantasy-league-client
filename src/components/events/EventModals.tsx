'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onCreated: (event: Event) => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  groupId,
  onCreated,
}: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      const event = await api.events.create({
        groupId,
        name: name.trim(),
        description: description.trim() || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      });
      onCreated(event);
      setName('');
      setDescription('');
      setStartsAt('');
      setEndsAt('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a new event" size="md">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Input
          id="create-event-name"
          label="Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Man City vs Arsenal — GW28"
          autoFocus
          required
        />
        <div>
          <label
            htmlFor="create-event-desc"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}
          >
            Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="create-event-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about the event…"
            rows={3}
            style={{
              width: '100%',
              padding: '11px 16px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            id="create-event-starts"
            label="Starts at (optional)"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <Input
            id="create-event-ends"
            label="Ends at (optional)"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }} role="alert">
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose} id="btn-cancel-event">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} id="btn-submit-event">
            Create event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
