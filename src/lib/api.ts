import type {
    AuthResponse,
    CreateEventDto,
    CreateGroupDto,
    CreatePredictionDto,
    CreateRuleDto,
    Event,
    Group,
    GroupMember,
    JoinGroupDto,
    Leaderboard,
    LoginDto,
    Prediction,
    RecordResultDto,
    RegisterDto,
    Result,
    Rule,
    User,
} from '@/types';
import { tokenStorage } from '@/utils/token';

const API_PREFIX = '/api';

type SelectionInput =
    | CreatePredictionDto['selections']
    | Record<string, boolean>
    | Array<{ ruleId: string; value: boolean }>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (!(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const token = tokenStorage.getToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_PREFIX}${path}`, {
        credentials: 'include',
        ...init,
        headers,
    });

    if (response.ok) {
        const authToken = response.headers.get('set-auth-token');
        if (authToken) {
            tokenStorage.setToken(authToken);
        }
    }

    if (!response.ok) {
        const fallback = `${response.status} ${response.statusText}`;
        let message = fallback;

        try {
            const payload = (await response.json()) as { message?: string | string[] };
            if (Array.isArray(payload.message)) {
                message = payload.message.join(', ');
            } else if (payload.message) {
                message = payload.message;
            }
        } catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    return (text ? (JSON.parse(text) as T) : (undefined as T));
}

function normalizeSelections(selections: SelectionInput): Array<{ ruleId: string; value: boolean }> {
    if (Array.isArray(selections)) {
        return selections;
    }

    return Object.entries(selections).map(([ruleId, value]) => ({ ruleId, value }));
}

export const api = {
    auth: {
        register: (dto: RegisterDto) => request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
        login: (dto: LoginDto) => request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
        me: () => request<{ session: unknown }>('/auth/me'),
        logout: () => request('/auth/logout', { method: 'POST' }),
    },
    users: {
        meGroups: () => request<Array<Group & { role?: string | null; joinedAt?: string }>>('/users/me/groups'),
        search: (query: string) => request<Array<Pick<User, 'id' | 'email' | 'name' | 'image' | 'role'>>>(`/users/search?q=${encodeURIComponent(query)}`),
        byId: (id: string) => request<User>(`/users/${id}`),
    },
    groups: {
        list: () => request<Array<Group & { role?: string | null }>>('/groups'),
        create: (dto: CreateGroupDto) => request<Group>('/groups', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
        join: (dto: JoinGroupDto) => request('/groups/join', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
        byId: (id: string) => request<Group>(`/groups/${id}`),
        remove: (id: string) => request(`/groups/${id}`, { method: 'DELETE' }),
        members: (groupId: string) => request<GroupMember[]>(`/groups/${groupId}/members`),
        updateMemberRole: (groupId: string, userId: string, role: string) => request<GroupMember>(`/groups/${groupId}/members/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }),
        removeMember: (groupId: string, userId: string) => request(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
    },
    events: {
        create: (dto: CreateEventDto & { endsAt?: string }) => request<Event>('/events', {
            method: 'POST',
            body: JSON.stringify({
                groupId: dto.groupId,
                name: dto.name,
                description: dto.description,
                startsAt: dto.startsAt ?? new Date().toISOString(),
            }),
        }),
        byGroup: (groupId: string) => request<Event[]>(`/events/group/${groupId}`),
        byId: (id: string) => request<Event>(`/events/${id}`),
        setStatus: (id: string, status: 'OPEN' | 'CLOSED' | 'SCORING' | 'COMPLETED') => request<Event>(`/events/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        recordResult: (dto: RecordResultDto) => request<Result>('/events/result', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
    },
    rules: {
        create: (dto: CreateRuleDto) => request<Rule>('/rules', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
        byEvent: (eventId: string) => request<Rule[]>(`/rules/event/${eventId}`),
        remove: (id: string) => request(`/rules/${id}`, { method: 'DELETE' }),
    },
    predictions: {
        create: (dto: Omit<CreatePredictionDto, 'selections'> & { selections: SelectionInput }) => request('/predictions', {
            method: 'POST',
            body: JSON.stringify({
                ...dto,
                selections: normalizeSelections(dto.selections),
            }),
        }),
        byEvent: (eventId: string) => request<Prediction[]>(`/predictions/event/${eventId}`),
        mine: () => request<Prediction[]>('/predictions/me'),
    },
    leaderboard: {
        byGroup: (groupId: string) => request<Leaderboard>(`/leaderboard/${groupId}`),
    },
    normalizeSelections,
};
