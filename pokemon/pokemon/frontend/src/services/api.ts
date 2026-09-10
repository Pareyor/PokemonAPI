import {
  PokemonCard,
  PokemonCardFormData,
  TrainerProfile,
  BoosterPackResult,
  BattleOpponent,
  BattleRecord,
  PokedexItem,
  PokedexStats,
  PokemonType,
  CardRarity,
  AuthUser,
  UserManagementDTO,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types';

const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('pokepulse_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('pokepulse_token', token);
  } else {
    localStorage.removeItem('pokepulse_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

function getHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = { ...extra };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json.message) errorMsg = json.message;
      if (json.validationErrors) {
        errorMsg += ` (${Object.values(json.validationErrors).join(', ')})`;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  async getCards(filters?: { search?: string; type?: PokemonType; rarity?: CardRarity; inDeck?: boolean }): Promise<PokemonCard[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.rarity) params.append('rarity', filters.rarity);
    if (filters?.inDeck !== undefined) params.append('inDeck', String(filters.inDeck));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/cards${qs}`, { headers: getHeaders() });
    return handleResponse<PokemonCard[]>(res);
  },

  async getCardById(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}`, { headers: getHeaders() });
    return handleResponse<PokemonCard>(res);
  },

  async createCard(data: PokemonCardFormData): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<PokemonCard>(res);
  },

  async updateCard(id: number, data: PokemonCardFormData): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<PokemonCard>(res);
  },

  async toggleDeck(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}/deck`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<PokemonCard>(res);
  },

  async levelUp(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}/level-up`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<PokemonCard>(res);
  },

  async deleteCard(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  async openPack(type: string): Promise<BoosterPackResult> {
    const res = await fetch(`${API_BASE}/packs/open?type=${type}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<BoosterPackResult>(res);
  },

  async getProfile(): Promise<TrainerProfile> {
    const res = await fetch(`${API_BASE}/trainer/profile`, { headers: getHeaders() });
    return handleResponse<TrainerProfile>(res);
  },

  async claimBonus(): Promise<TrainerProfile> {
    const res = await fetch(`${API_BASE}/trainer/claim-bonus`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<TrainerProfile>(res);
  },

  async getOpponents(): Promise<BattleOpponent[]> {
    const res = await fetch(`${API_BASE}/battle/opponents`, { headers: getHeaders() });
    return handleResponse<BattleOpponent[]>(res);
  },

  async recordBattle(opponent: string, won: boolean, coins: number, log: string): Promise<void> {
    const res = await fetch(`${API_BASE}/battle/record`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ opponent, won, coins, log }),
    });
    return handleResponse<void>(res);
  },

  async getBattleRecords(): Promise<BattleRecord[]> {
    const res = await fetch(`${API_BASE}/battle/records`, { headers: getHeaders() });
    return handleResponse<BattleRecord[]>(res);
  },

  async getPokedex(filters?: { search?: string; type?: PokemonType; status?: string }): Promise<PokedexItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/pokedex${qs}`, { headers: getHeaders() });
    return handleResponse<PokedexItem[]>(res);
  },

  async getPokedexStats(): Promise<PokedexStats> {
    const res = await fetch(`${API_BASE}/pokedex/stats`, { headers: getHeaders() });
    return handleResponse<PokedexStats>(res);
  },

  // ── AUTENTICACIÓN ──────────────────────────────────────────────────────────
  async login(username: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<AuthUser>(res);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async register(username: string, password: string, trainerName: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, trainerName }),
    });
    const data = await handleResponse<AuthUser>(res);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await handleResponse<AuthUser>(res);
    // El backend devuelve el token en /me — asegurar que queda guardado en memoria
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {
      // Ignorar fallos de red al cerrar sesión
    } finally {
      setAuthToken(null);
    }
  },

  // ── ADMINISTRACIÓN DE USUARIOS (CRUD) ──────────────────────────────────────
  async getAdminUsers(): Promise<UserManagementDTO[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse<UserManagementDTO[]>(res);
  },

  async getAdminUserById(id: number): Promise<UserManagementDTO> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<UserManagementDTO>(res);
  },

  async createAdminUser(data: CreateUserRequest): Promise<UserManagementDTO> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<UserManagementDTO>(res);
  },

  async updateAdminUser(id: number, data: UpdateUserRequest): Promise<UserManagementDTO> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return handleResponse<UserManagementDTO>(res);
  },

  async deleteAdminUser(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  getAuthToken(): string | null {
    return getAuthToken();
  },

  setAuthToken(token: string | null): void {
    setAuthToken(token);
  },
};

