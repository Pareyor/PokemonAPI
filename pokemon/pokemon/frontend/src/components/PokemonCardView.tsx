import React from 'react';
import { PokemonCard, PokemonType, CardRarity } from '../types';
import { Shield, Swords, Zap, Heart, Sparkles, Plus, Check, Trash2, ArrowUpCircle, Eye } from 'lucide-react';

export type CardAspect = 'classic' | 'holo' | 'cosmos' | 'animated' | 'gold';

export const getCardAspect = (card: PokemonCard): CardAspect => {
  if (card.rarity === 'LEGENDARY' && card.isHolo) return 'animated';
  if (card.rarity === 'EPIC' && card.isHolo) return 'holo';
  if (card.rarity === 'LEGENDARY') return 'cosmos';
  if (card.rarity === 'EPIC') return 'cosmos';
  if (card.rarity === 'RARE' && card.isHolo) return 'gold';
  if (card.isHolo) return 'holo';
  return 'classic';
};

interface PokemonCardViewProps {
  card: PokemonCard;
  onToggleDeck?: (card: PokemonCard) => void;
  onLevelUp?: (card: PokemonCard) => void;
  onView?: (card: PokemonCard) => void;
  onDelete?: (card: PokemonCard) => void;
  compact?: boolean;
  aspect?: CardAspect;
}

export const typeThemes: Record<
  PokemonType,
  { bg: string; border: string; badge: string; text: string; lightBg: string }
> = {
  FIRE: { bg: 'from-orange-600/30 via-red-600/20 to-amber-600/30', border: 'border-orange-500/50', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', text: 'text-orange-400', lightBg: 'bg-orange-500/10' },
  WATER: { bg: 'from-blue-600/30 via-cyan-600/20 to-sky-600/30', border: 'border-blue-500/50', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', text: 'text-blue-400', lightBg: 'bg-blue-500/10' },
  GRASS: { bg: 'from-emerald-600/30 via-green-600/20 to-teal-600/30', border: 'border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'text-emerald-400', lightBg: 'bg-emerald-500/10' },
  ELECTRIC: { bg: 'from-amber-500/30 via-yellow-500/20 to-orange-500/30', border: 'border-yellow-500/50', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', text: 'text-yellow-400', lightBg: 'bg-yellow-500/10' },
  PSYCHIC: { bg: 'from-fuchsia-600/30 via-purple-600/20 to-pink-600/30', border: 'border-fuchsia-500/50', badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40', text: 'text-fuchsia-400', lightBg: 'bg-fuchsia-500/10' },
  FIGHTING: { bg: 'from-amber-800/30 via-red-800/20 to-orange-900/30', border: 'border-amber-700/50', badge: 'bg-amber-700/20 text-amber-300 border-amber-700/40', text: 'text-amber-400', lightBg: 'bg-amber-700/10' },
  DRAGON: { bg: 'from-indigo-600/30 via-violet-600/20 to-blue-700/30', border: 'border-indigo-500/50', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', text: 'text-indigo-400', lightBg: 'bg-indigo-500/10' },
  DARK: { bg: 'from-slate-800/40 via-purple-950/30 to-slate-900/40', border: 'border-purple-500/40', badge: 'bg-purple-900/30 text-purple-300 border-purple-600/40', text: 'text-purple-400', lightBg: 'bg-purple-900/10' },
  STEEL: { bg: 'from-slate-600/30 via-gray-600/20 to-zinc-600/30', border: 'border-slate-400/50', badge: 'bg-slate-400/20 text-slate-300 border-slate-400/40', text: 'text-slate-300', lightBg: 'bg-slate-500/10' },
  NORMAL: { bg: 'from-slate-700/30 via-zinc-700/20 to-stone-700/30', border: 'border-slate-600/50', badge: 'bg-slate-600/20 text-slate-300 border-slate-600/40', text: 'text-slate-400', lightBg: 'bg-slate-600/10' },
};

export const rarityBadges: Record<CardRarity, { label: string; color: string }> = {
  COMMON: { label: 'Común', color: 'text-slate-400 border-slate-600/40 bg-slate-800/40' },
  UNCOMMON: { label: 'Infrecuente', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
  RARE: { label: 'Rara ★', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
  EPIC: { label: 'Épica ★★', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
  LEGENDARY: { label: 'LEGENDARIA ★★★', color: 'text-amber-300 border-amber-400/60 bg-amber-950/50 font-bold' },
};

// Web Audio sound for screen attack impact
const playScreenAttackSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);

    setTimeout(() => {
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'triangle';
      boom.frequency.setValueAtTime(140, ctx.currentTime);
      boom.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
      boomGain.gain.setValueAtTime(0.5, ctx.currentTime);
      boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.start();
      boom.stop(ctx.currentTime + 0.5);
    }, 350);
  } catch {}
};

// Japanese signature Katakana attack typography for Mega EX cards (like in Mega Rayquaza EX)
const getJapaneseAttackText = (type: PokemonType, name: string) => {
  const n = name.toLowerCase();
  if (n.includes('rayquaza')) return 'ガリョウテンセイ';
  if (n.includes('charizard')) return 'クリムゾンダイブ';
  if (n.includes('blastoise')) return 'ハイドロボンバー';
  if (n.includes('venusaur')) return 'ブルームバスター';
  if (n.includes('pikachu')) return 'ボルテッカー';
  if (n.includes('mewtwo')) return 'サイコブレイク';
  if (n.includes('gengar')) return 'ファントムゲート';
  if (n.includes('lucario')) return 'ライジングナックル';

  switch (type) {
    case 'DRAGON': return 'ガリョウテンセイ';
    case 'FIRE': return 'クリムゾンフレア';
    case 'WATER': return 'ハイドロタイフーン';
    case 'ELECTRIC': return 'ライトニングクラッシュ';
    case 'GRASS': return 'ソーラーブラスター';
    case 'PSYCHIC': return 'サイコジェネシス';
    case 'FIGHTING': return 'グランドインパクト';
    case 'DARK': return 'ナイトメアパルス';
    case 'STEEL': return 'アイアンインパクト';
    default: return 'メガシンカ・ブレイク';
  }
};

export const PokemonCardView: React.FC<PokemonCardViewProps> = ({
  card,
  onToggleDeck,
  onLevelUp,
  onView,
  onDelete,
  compact = false,
  aspect,
}) => {
  const [isAttackingScreen, setIsAttackingScreen] = React.useState(false);
  const theme = typeThemes[card.type] || typeThemes.NORMAL;
  const rarity = rarityBadges[card.rarity];
  const resolvedAspect = aspect !== undefined ? aspect : getCardAspect(card);

  const handleArtworkClick = (e: React.MouseEvent) => {
    if (resolvedAspect === 'animated') {
      e.stopPropagation();
      if (!isAttackingScreen) {
        setIsAttackingScreen(true);
        playScreenAttackSound();
        setTimeout(() => setIsAttackingScreen(false), 1350);
      }
      return;
    }
    if (onView) onView(card);
  };

  // Aspect CSS class calculation
  const getAspectClass = () => {
    if (resolvedAspect === 'holo') return 'card-aspect-holo shadow-2xl shadow-amber-500/30';
    if (resolvedAspect === 'cosmos') return 'card-aspect-cosmos shadow-lg shadow-amber-500/30';
    if (resolvedAspect === 'animated') return 'card-aspect-animated shadow-xl shadow-cyan-500/30';
    if (resolvedAspect === 'gold') return 'card-aspect-gold shadow-xl shadow-yellow-500/40';
    if (resolvedAspect === 'classic') return 'shadow-md';
    return card.isHolo ? 'holo-card shadow-lg shadow-purple-500/15' : 'shadow-md';
  };

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-b ${theme.bg} border-2 ${theme.border} ${getAspectClass()} p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
    >
      {/* Deck Indicator Pill */}
      {card.isInDeck && (
        <div className="absolute -top-2.5 -right-2.5 z-10 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400">
          <Check className="w-3 h-3" /> En Mazo
        </div>
      )}

      {/* Top Header: Name, Level, HP, Type */}
      <div
        className={onView ? 'cursor-pointer select-none' : undefined}
        onClick={onView ? () => onView(card) : undefined}
        title={onView ? 'Clic para inspeccionar aspectos y detalles' : undefined}
      >
        {resolvedAspect === 'holo' ? (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-b from-slate-100 to-slate-300 text-black font-black text-[9px] tracking-tighter border border-white shadow-sm">
                  MEGA
                </span>
                <span className="font-extrabold text-sm text-white tracking-tight truncate max-w-[130px]">
                  M {card.name}
                </span>
                <span className="px-1.5 py-0.2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black italic font-black text-[10px] rounded shadow">
                  EX
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-emerald-300 drop-shadow">
                  HP {Math.max(230, card.hp + 100)}
                </span>
                <span className="w-4 h-4 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-[8px] font-black text-black">
                  {card.type.substring(0, 1)}
                </span>
              </div>
            </div>
            <span className="text-[8px] text-amber-200/80 italic block mt-0.5">
              Evoluciona de {card.name}-EX
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">{card.name}</span>
              <span className="text-[10px] font-bold text-amber-400">Nv.{card.level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-rose-400 flex items-center gap-0.5">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                {card.hp}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${theme.badge}`}>
                {card.type}
              </span>
            </div>
          </div>
        )}

        {/* Card Artwork Showcase */}
        <div
          onClick={handleArtworkClick}
          className={`my-2.5 relative rounded-xl overflow-visible bg-slate-950/70 border border-slate-800/80 aspect-video flex items-center justify-center p-2 cursor-pointer transition-colors ${
            isAttackingScreen ? 'ring-2 ring-cyan-400 shadow-2xl' : 'group-hover:border-slate-700'
          }`}
        >
          {resolvedAspect === 'gold' ? (
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-0.5 text-[9px] font-extrabold text-yellow-300 bg-yellow-950/90 px-1.5 py-0.5 rounded border border-yellow-400/60 shadow">
              <Sparkles className="w-2.5 h-2.5" /> ORO 24K
            </div>
          ) : resolvedAspect === 'animated' ? (
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-0.5 text-[9px] font-extrabold text-cyan-300 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-400/60 shadow animate-pulse">
              <Zap className="w-2.5 h-2.5" /> LIVE ANIMADA
            </div>
          ) : resolvedAspect === 'cosmos' ? (
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-0.5 text-[9px] font-extrabold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/80 shadow">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> ULTRABRILLANTE
            </div>
          ) : (resolvedAspect === 'holo' || card.isHolo) ? (
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-0.5 text-[9px] font-extrabold text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-400/70 shadow">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" /> MEGA EX
            </div>
          ) : null}

          {/* Mega EX Lightning bolts & 3D Japanese Katakana signature typography */}
          {resolvedAspect === 'holo' && (
            <>
              <div className="absolute top-1 left-2 text-cyan-300 text-lg lightning-bolt select-none pointer-events-none z-20">
                ⚡
              </div>
              <div className="absolute bottom-2 right-2 text-yellow-300 text-xl lightning-bolt select-none pointer-events-none z-20" style={{ animationDelay: '0.8s' }}>
                ⚡
              </div>
              <div className="absolute top-2 right-4 text-rose-400 text-sm lightning-bolt select-none pointer-events-none z-20" style={{ animationDelay: '0.4s' }}>
                ⚡
              </div>

              {/* 3D Japanese Katakana attack name slashed across the card */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-25 text-center pointer-events-none overflow-visible">
                <span className="mega-kanji-text text-xl sm:text-2xl font-black">
                  {getJapaneseAttackText(card.type, card.name)}
                </span>
              </div>
            </>
          )}

          {/* Shiny Star Sparkle Flares for Ultrabrillante aspect */}
          {resolvedAspect === 'cosmos' && (
            <>
              <div className="absolute top-2 right-4 z-20 text-white font-black text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse pointer-events-none select-none">
                ✦
              </div>
              <div className="absolute bottom-3 left-4 z-20 text-amber-300 font-black text-base drop-shadow-[0_0_6px_rgba(255,215,0,0.9)] pointer-events-none select-none animate-bounce" style={{ animationDuration: '2.5s' }}>
                ✦
              </div>
              <div className="absolute top-1/2 right-2 z-20 text-cyan-300 font-black text-sm drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] pointer-events-none select-none">
                ✦
              </div>
            </>
          )}

          {/* Shockwave ring when attacking screen */}
          {isAttackingScreen && (
            <div className="absolute inset-0 m-auto w-20 h-20 rounded-full border-4 border-cyan-300 animate-screen-shockwave pointer-events-none z-40" />
          )}

          {/* Floating alert banner */}
          {isAttackingScreen && (
            <div className="absolute -top-4 inset-x-0 z-50 text-center pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/95 text-cyan-300 text-[9px] font-black border border-cyan-400 shadow-2xl animate-bounce inline-block">
                ⚡ ¡ATAQUE A LA PANTALLA! 💥
              </span>
            </div>
          )}

          {/* Pokemon Artwork / Live Animated Sprite */}
          <img
            src={
              resolvedAspect === 'animated'
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${card.pokedexNumber}.gif`
                : card.imageUrl
            }
            onError={(e) => {
              e.currentTarget.src = card.imageUrl || '';
            }}
            alt={card.name}
            className={`h-full max-h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] ${
              isAttackingScreen
                ? 'animate-screen-attack'
                : resolvedAspect === 'animated'
                ? 'scale-110 drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-float'
                : resolvedAspect === 'holo'
                ? 'scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                : 'group-hover:scale-110'
            } transition-transform duration-300 relative z-20`}
            loading="lazy"
          />
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 z-20">
            #{String(card.pokedexNumber).padStart(3, '0')}
          </div>
        </div>

        {/* Moves / Powers Box */}
        {resolvedAspect === 'holo' ? (
          <div className="space-y-1.5 text-xs">
            {/* Mega Evolution Rule Ribbon */}
            <div className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-y border-amber-500/60 text-[8px] text-amber-200 flex items-center justify-between">
              <span className="font-black text-amber-300 uppercase">Regla Megaevolución</span>
              <span className="text-[7px] text-amber-100/80">Tu turno termina al megaevolucionar</span>
            </div>

            {/* Devastating Mega EX Attack */}
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-950/50 via-red-950/40 to-amber-950/50 border border-amber-500/60 flex flex-col space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[9px]">🔥⚡⚪</span>
                  <span className="font-extrabold text-white text-[11px] tracking-wide truncate max-w-[120px]">
                    {card.type === 'DRAGON' ? 'Dragon Ascent' : card.move2Name}
                  </span>
                </div>
                <span className="font-black text-amber-300 text-sm">
                  300
                </span>
              </div>
              <p className="text-[8px] text-slate-300 leading-tight line-clamp-1">
                Descarta 2 Energías unidas para desatar el ataque definitivo de Megaevolución.
              </p>
            </div>

            {/* Pokemon-EX Rule Banner */}
            <div className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 border border-amber-400/50 text-[7px] text-amber-100 flex items-center justify-between">
              <span className="font-black text-amber-300">Regla Pokémon-EX</span>
              <span>El rival coge 2 cartas de Premio</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-xs">
            {/* Move 1 */}
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-white text-[11px]">{card.move1Name}</span>
                {!compact && card.move1Description && (
                  <span className="text-[9px] text-slate-400 line-clamp-1">{card.move1Description}</span>
                )}
              </div>
              <span className="font-black text-rose-400 text-xs shrink-0 pl-2">
                {card.move1Damage} <span className="text-[9px] text-slate-400">DMG</span>
              </span>
            </div>

            {/* Move 2 (Special Power) */}
            <div className="p-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-bold text-indigo-200 text-[11px]">{card.move2Name}</span>
                </div>
                {!compact && card.move2SpecialEffect && (
                  <span className="text-[9px] font-semibold text-amber-300">
                    Efecto: {card.move2SpecialEffect}
                  </span>
                )}
              </div>
              <span className="font-black text-amber-400 text-xs shrink-0 pl-2">
                {card.move2Damage} <span className="text-[9px] text-slate-400">DMG</span>
              </span>
            </div>
          </div>
        )}

        {/* Mini Stats Line: Attack, Defense, Speed */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center text-[10px] text-slate-300">
          <div className="flex items-center justify-center gap-0.5">
            <Swords className="w-3 h-3 text-rose-400" />
            <span>ATK: {card.attack}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>DEF: {card.defense}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>SPD: {card.speed}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions: View, Deck Toggle, Level Up, Delete */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${rarity.color}`}>
          {rarity.label}
        </span>

        <div className="flex items-center space-x-1.5">
          {onView && (
            <button
              onClick={() => onView(card)}
              title="Inspeccionar aspecto y detalles de la carta"
              className="p-1.5 text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-sky-500/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver</span>
            </button>
          )}

          {onLevelUp && (
            <button
              onClick={() => onLevelUp(card)}
              title="Mejorar carta (aumenta stats con monedas)"
              className="p-1.5 text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-0.5 text-[10px] font-bold border border-amber-500/30"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>+Nv</span>
            </button>
          )}

          {onToggleDeck && (
            <button
              onClick={() => onToggleDeck(card)}
              title={card.isInDeck ? 'Quitar del mazo de combate' : 'Añadir al mazo de combate'}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                card.isInDeck
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-600 hover:text-white'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {card.isInDeck ? 'Quitar' : <><Plus className="w-3 h-3" /> Mazo</>}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(card)}
              title="Reciclar carta por monedas"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
