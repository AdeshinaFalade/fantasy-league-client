import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { EventStatus, RuleCondition } from '@/types';

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'dd MMM yyyy') : '—';
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : '—';
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  SCORING: 'Scoring',
  COMPLETED: 'Completed',
};

export const CONDITION_LABELS: Record<RuleCondition, string> = {
  GT: '>',
  LT: '<',
  EQ: '=',
  GTE: '≥',
  LTE: '≤',
  NEQ: '≠',
};

export const STATUS_VARIANT: Record<
  EventStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  OPEN: 'default',
  CLOSED: 'secondary',
  SCORING: 'outline',
  COMPLETED: 'secondary',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
