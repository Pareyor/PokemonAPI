export type PokemonType =
  | 'FIRE'
  | 'WATER'
  | 'GRASS'
  | 'ELECTRIC'
  | 'PSYCHIC'
  | 'FIGHTING'
  | 'DRAGON'
  | 'DARK'
  | 'STEEL'
  | 'NORMAL';

export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface PokemonCard {
  id: number;
  pokedexNumber: number;
  name: string;
  type: PokemonType;
  rarity: CardRarity;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  isHolo: boolean;
  imageUrl?: string;
  move1Name: string;
  move1Damage: number;
  move1Description?: string;
  move2Name: string;
  move2Damage: number;
  move2Description?: string;
  move2SpecialEffect?: string;
  isInDeck: boolean;
  isCustom: boolean;
  createdAt?: string;
}

export interface PokemonCardFormData {
  pokedexNumber: number;
  name: string;
  type: PokemonType;
  rarity: CardRarity;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  isHolo: boolean;
  imageUrl?: string;
  move1Name: string;
  move1Damage: number;
  move1Description: string;
  move2Name: string;
  move2Damage: number;
  move2Description: string;
  move2SpecialEffect: string;
}

export interface TrainerProfile {
  id: number;
  name: string;
  coins: number;
  packsOpened: number;
  battlesWon: number;
  battlesLost: number;
  totalCards: number;
  deckCardsCount: number;
}

export interface BoosterPackResult {
  packName: string;
  coinsSpent: number;
  coinsRemaining: number;
  cardsObtained: PokemonCard[];
}

export interface BattleOpponent {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  difficulty: string;
  rewardCoins: number;
  team: PokemonCard[];
}

export interface BattleRecord {
  id: number;
  opponentName: string;
  result: 'VICTORIA' | 'DERROTA';
  coinsEarned: number;
  battleLog: string;
  timestamp: string;
}

export interface PokedexItem {
  pokedexNumber: number;
  name: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  description: string;
  imageUrl: string;
  isOwned: boolean;
  ownedCount: number;
  highestLevel: number;
}

export interface PokedexStats {
  totalSpecies: number;
  ownedSpecies: number;
  missingSpecies: number;
  completionPercentage: number;
}
