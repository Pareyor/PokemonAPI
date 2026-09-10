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
} from '../types';

const API_BASE = '/api';

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
    const res = await fetch(`${API_BASE}/cards${qs}`);
    return handleResponse<PokemonCard[]>(res);
  },

  async getCardById(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}`);
    return handleResponse<PokemonCard>(res);
  },

  async createCard(data: PokemonCardFormData): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<PokemonCard>(res);
  },

  async updateCard(id: number, data: PokemonCardFormData): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<PokemonCard>(res);
  },

  async toggleDeck(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}/deck`, { method: 'PATCH' });
    return handleResponse<PokemonCard>(res);
  },

  async levelUp(id: number): Promise<PokemonCard> {
    const res = await fetch(`${API_BASE}/cards/${id}/level-up`, { method: 'POST' });
    return handleResponse<PokemonCard>(res);
  },

  async deleteCard(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/cards/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  async openPack(type: string): Promise<BoosterPackResult> {
    const res = await fetch(`${API_BASE}/packs/open?type=${type}`, { method: 'POST' });
    return handleResponse<BoosterPackResult>(res);
  },

  async getProfile(): Promise<TrainerProfile> {
    const res = await fetch(`${API_BASE}/trainer/profile`);
    return handleResponse<TrainerProfile>(res);
  },

  async claimBonus(): Promise<TrainerProfile> {
    const res = await fetch(`${API_BASE}/trainer/claim-bonus`, { method: 'POST' });
    return handleResponse<TrainerProfile>(res);
  },

  async getOpponents(): Promise<BattleOpponent[]> {
    const res = await fetch(`${API_BASE}/battle/opponents`);
    return handleResponse<BattleOpponent[]>(res);
  },

  async recordBattle(opponent: string, won: boolean, coins: number, log: string): Promise<void> {
    const res = await fetch(`${API_BASE}/battle/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponent, won, coins, log }),
    });
    return handleResponse<void>(res);
  },

  async getBattleRecords(): Promise<BattleRecord[]> {
    const res = await fetch(`${API_BASE}/battle/records`);
    return handleResponse<BattleRecord[]>(res);
  },

  async getPokedex(filters?: { search?: string; type?: PokemonType; status?: string }): Promise<PokedexItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/pokedex${qs}`);
    return handleResponse<PokedexItem[]>(res);
  },

  async getPokedexStats(): Promise<PokedexStats> {
    const res = await fetch(`${API_BASE}/pokedex/stats`);
    return handleResponse<PokedexStats>(res);
  },
};
