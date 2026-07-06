// ─── Enums ────────────────────────────────────────────────────────────────────
export type GroupRole = 'ADMIN' | 'PARTICIPANT';
export type EventStatus = 'OPEN' | 'CLOSED' | 'SCORING' | 'COMPLETED';
export type RuleCondition = 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE' | 'NEQ';
export type PredictionStatus = 'SUBMITTED' | 'SCORED' | 'REJECTED';

// ─── Entities ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  settings: Record<string, unknown>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  permissions: Record<string, unknown>;
  joinedAt: string;
  updatedAt: string;
  user?: User;
  group?: Group;
}

export interface Event {
  id: string;
  groupId: string;
  createdById: string;
  name: string;
  description?: string | null;
  status: EventStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  rules?: Rule[];
}

export interface Rule {
  id: string;
  eventId: string;
  createdById: string;
  player: string;
  metric: string;
  condition: RuleCondition;
  threshold: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  eventId: string;
  groupId: string;
  userId: string;
  selections: Record<string, boolean>;
  status: PredictionStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Result {
  id: string;
  eventId: string;
  payload: Record<string, number>;
  recordedById: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  eventId: string;
  groupId: string;
  userId: string;
  predictionId: string;
  value: number;
  computedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
}

export interface Leaderboard {
  id: string;
  groupId: string;
  rankings: LeaderboardEntry[];
  computedAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateGroupDto {
  name: string;
}

export interface JoinGroupDto {
  inviteCode: string;
}

export interface CreateEventDto {
  groupId: string;
  name: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface CreateRuleDto {
  eventId: string;
  player: string;
  metric: string;
  condition: RuleCondition;
  threshold: number;
  score: number;
}

export interface CreatePredictionDto {
  eventId: string;
  groupId: string;
  selections: Record<string, boolean>;
}

export interface RecordResultDto {
  eventId: string;
  payload: Record<string, Record<string, number>>;
}

export interface UpdateMemberRoleDto {
  role: GroupRole;
}
