import React from 'react';
import { PokemonCard, PokemonType, CardRarity } from '../types';
import { Shield, Swords, Zap, Heart, Sparkles, Plus, Check, Trash2, ArrowUpCircle } from 'lucide-react';

interface PokemonCardViewProps {
  card: PokemonCard;
  onToggleDeck?: (card: PokemonCard) => void;
  onLevelUp?: (card: PokemonCard) => void;
  onView?: (card: PokemonCard) => void;
  onDelete?: (card: PokemonCard) => void;
  compact?: boolean;
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

export const PokemonCardView: React.FC<PokemonCardViewProps> = ({
  card,
  onToggleDeck,
  onLevelUp,
  onView,
  onDelete,
  compact = false,
}) => {
  const theme = typeThemes[card.type] || typeThemes.NORMAL;
  const rarity = rarityBadges[card.rarity];

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-b ${theme.bg} border-2 ${theme.border} ${
        card.isHolo ? 'holo-card shadow-lg shadow-purple-500/15' : 'shadow-md'
      } p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
    >
      {/* Deck Indicator Pill */}
      {card.isInDeck && (
        <div className="absolute -top-2.5 -right-2.5 z-10 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400">
          <Check className="w-3 h-3" /> En Mazo
        </div>
      )}

      {/* Top Header: Name, Level, HP, Type */}
      <div>
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

        {/* Card Artwork Showcase */}
        <div
          onClick={() => onView && onView(card)}
          className="my-2.5 relative rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800/80 aspect-video flex items-center justify-center p-2 cursor-pointer group-hover:border-slate-700 transition-colors"
        >
          {card.isHolo && (
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-0.5 text-[9px] font-extrabold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
              <Sparkles className="w-2.5 h-2.5" /> HOLO
            </div>
          )}
          <img
            src={card.imageUrl}
            alt={card.name}
            className="h-full max-h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
            #{String(card.pokedexNumber).padStart(3, '0')}
          </div>
        </div>

        {/* Moves / Powers Box */}
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

      {/* Footer Actions: Deck Toggle, Level Up, Delete */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${rarity.color}`}>
          {rarity.label}
        </span>

        <div className="flex items-center space-x-1.5">
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
