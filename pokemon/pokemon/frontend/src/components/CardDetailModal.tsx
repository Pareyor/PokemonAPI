import React from 'react';
import { PokemonCard } from '../types';
import { X, Heart, Swords, Shield, Zap, Sparkles, Check, ArrowUpCircle } from 'lucide-react';
import { typeThemes, rarityBadges } from './PokemonCardView';

interface CardDetailModalProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: PokemonCard) => void;
  onToggleDeck: (card: PokemonCard) => void;
  onLevelUp: (card: PokemonCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onEdit,
  onToggleDeck,
  onLevelUp,
}) => {
  if (!isOpen || !card) return null;

  const theme = typeThemes[card.type] || typeThemes.NORMAL;
  const rarity = rarityBadges[card.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-black text-slate-400">
              #{String(card.pokedexNumber).padStart(3, '0')}
            </span>
            <h3 className="text-base font-black text-white">{card.name}</h3>
            <span className="text-xs font-bold text-amber-400">Nv.{card.level}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Sprite & Type Overview */}
          <div className={`p-6 rounded-2xl bg-gradient-to-b ${theme.bg} border-2 ${theme.border} flex flex-col items-center justify-center relative shadow-xl`}>
            {card.isHolo && (
              <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                <Sparkles className="w-3 h-3" /> HOLO BRILLANTE
              </div>
            )}
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-40 h-40 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
            />
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs font-black px-3 py-1 rounded-lg border ${theme.badge}`}>
                TIPO {card.type}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${rarity.color}`}>
                {rarity.label}
              </span>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">HP MÁX</span>
              <span className="text-sm font-black text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500" /> {card.hp}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">ATAQUE</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Swords className="w-3.5 h-3.5" /> {card.attack}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">DEFENSA</span>
              <span className="text-sm font-black text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5" /> {card.defense}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">VELOCIDAD</span>
              <span className="text-sm font-black text-yellow-400 flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5" /> {card.speed}
              </span>
            </div>
          </div>

          {/* Moves Detailed */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Habilidades & Poderes</h4>
            
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-xs font-black text-white">{card.move1Name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.move1Description || 'Ataque básico veloz.'}</p>
              </div>
              <span className="text-xs font-black text-rose-400">{card.move1Damage} Daño</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-black text-indigo-200">{card.move2Name}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{card.move2Description || 'Poder especial cargado.'}</p>
                {card.move2SpecialEffect && (
                  <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                    Efecto Adicional: {card.move2SpecialEffect}
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-amber-400">{card.move2Damage} Daño</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={() => onLevelUp(card)}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Mejorar Nivel</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleDeck(card)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 ${
                card.isInDeck
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{card.isInDeck ? 'En Mazo' : 'Poner en Mazo'}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(card);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Editar Carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
