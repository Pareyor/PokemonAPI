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
  | 'NORMAL'
  | 'BUG'
  | 'FLYING'
  | 'POISON'
  | 'GROUND'
  | 'ROCK'
  | 'GHOST'
  | 'ICE'
  | 'FAIRY';

export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SECRET_RARE';

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
  bonusAvailableAt?: string | null;
  infiniteCoins: boolean;
}

export type BoosterPackType = 'BASIC' | 'KANTO_MASTERS' | 'LEGENDARY_ECLIPSE';

export type PackSlotType = 'COMMON' | 'UNCOMMON' | 'REVERSE_HOLO' | 'REVERSE_HOLO_HIT' | 'RARE' | 'GOD_PACK';

export interface PackSlotOdds {
  slotType: PackSlotType;
  count: number;
  odds: Partial<Record<CardRarity, number>>;
}

export interface PackCatalogItem {
  id: BoosterPackType;
  name: string;
  description: string;
  cost: number;
  cardCount: number;
  mascotPokedexNumber: number;
  accentColor: string;
  godPackChance: number;
  pityThreshold: number;
  packsUntilPity: number;
  slots: PackSlotOdds[];
}

export interface SealedPack {
  id: number;
  packType: BoosterPackType;
  packName: string;
  purchasedAt: string;
}

export interface PackPurchaseResult {
  purchased: SealedPack[];
  coinsSpent: number;
  coinsRemaining: number;
}

export interface PackCard {
  slot: number;
  slotType: PackSlotType;
  hit: boolean;
  isNew: boolean;
  card: PokemonCard;
}

export interface BoosterPackResult {
  packId: number;
  packType: BoosterPackType;
  packName: string;
  coinsSpent: number;
  coinsRemaining: number;
  godPack: boolean;
  pityTriggered: boolean;
  packsUntilPity: number;
  cards: PackCard[];
  cardsObtained: PokemonCard[];
}

export interface BattleOpponent {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  difficulty: string;
  rewardCoins: number;
  aiLevel: number;
  team: PokemonCard[];
}

export type BattleActionType = 'ATTACK' | 'SPECIAL' | 'GUARD' | 'SWITCH' | 'FORFEIT';
export type BattleSide = 'PLAYER' | 'OPPONENT';
export type StatusCondition = 'NONE' | 'BURN' | 'PARALYZE';

export interface Combatant {
  revealed: boolean;
  cardId?: number;
  pokedexNumber?: number;
  name?: string;
  type?: PokemonType;
  rarity?: CardRarity;
  holo?: boolean;
  imageUrl?: string;
  level?: number;
  hp: number;
  maxHp: number;
  attack?: number;
  defense?: number;
  speed?: number;
  move1Name?: string;
  move1Power?: number;
  move2Name?: string;
  move2Power?: number;
  move2Effect?: string;
  status: StatusCondition;
}

export type BattleEventType =
  | 'SUMMON' | 'MOVE' | 'DAMAGE' | 'HEAL' | 'GUARD' | 'GUARD_FAILED'
  | 'STATUS' | 'STATUS_DAMAGE' | 'PARALYZED' | 'FAINT' | 'SWITCH' | 'END';

export interface BattleEvent {
  type: BattleEventType;
  side: BattleSide;
  text: string;
  amount?: number;
  hpAfter?: number;
  effectiveness?: number;
  critical?: boolean;
  index?: number;
}

export interface BattleState {
  battleId: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
  turn: number;
  maxTurns: number;
  opponentId: string;
  opponentName: string;
  opponentAvatarUrl: string;
  playerTeam: Combatant[];
  playerActive: number;
  playerEnergy: number;
  playerGuardedLastTurn: boolean;
  opponentTeam: Combatant[];
  opponentActive: number;
  opponentEnergy: number;
  awaitingPlayerSwitch: boolean;
  rewardCoins: number;
  coinsEarned: number;
  events: BattleEvent[];
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

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  trainerName: string;
  coins: number;
  token?: string;
  createdAt?: string;
}

export interface UserManagementDTO {
  id: number;
  username: string;
  role: UserRole;
  trainerName: string;
  coins: number;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  trainerName: string;
  role: UserRole;
  coins?: number;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  trainerName?: string;
  role?: UserRole;
  coins?: number;
}
