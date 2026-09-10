import React, { useState } from 'react';
import { PokemonCard } from '../types';
import { X, Heart, Swords, Shield, Zap, Sparkles, Check, ArrowUpCircle, Layers, Crown } from 'lucide-react';
import { PokemonCardView, CardAspect, getCardAspect, typeThemes, rarityBadges } from './PokemonCardView';

interface CardDetailModalProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: PokemonCard) => void;
  onToggleDeck: (card: PokemonCard) => void;
  onLevelUp: (card: PokemonCard) => void;
  initialAspect?: CardAspect | 'auto';
}

const CARD_ASPECTS: {
  id: CardAspect;
  name: string;
  badge: string;
  icon: React.ComponentType<any>;
  description: string;
  tagColor: string;
}[] = [
  {
    id: 'classic',
    name: 'Clasica Mate',
    badge: 'EDICION BASE',
    icon: Layers,
    description: 'Estilo original con los stats reales de tu carta.',
    tagColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    id: 'holo',
    name: 'Mega EX Full Art',
    badge: 'MEGA EVOLUTION',
    icon: Sparkles,
    description: 'Caligrafia japonesa en 3D, rayos electricos y arte exclusivo.',
    tagColor: 'bg-amber-950/80 text-amber-300 border-amber-400/60',
  },
  {
    id: 'cosmos',
    name: 'Ultrabrillante Shiny',
    badge: 'SHINY TREASURE',
    icon: Sparkles,
    description: 'Borde plateado holografico y destellos en cruz de diamante.',
    tagColor: 'bg-slate-900 text-white border-white/80',
  },
  {
    id: 'animated',
    name: 'Live Animada',
    badge: 'MOVIMIENTO REAL',
    icon: Zap,
    description: 'El Pokemon cobra vida! Sprite animado en tiempo real.',
    tagColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60',
  },
  {
    id: 'gold',
    name: 'Oro Legendario 24K',
    badge: 'SECRET RARE',
    icon: Crown,
    description: 'Acabado en oro puro reluciente y grabados dorados.',
    tagColor: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
  },
];

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onEdit,
  onToggleDeck,
  onLevelUp,
  initialAspect,
}) => {
  const [selectedAspect, setSelectedAspect] = useState<CardAspect>('animated');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (card) {
      if (initialAspect && initialAspect !== 'auto') {
        setSelectedAspect(initialAspect);
      } else {
        setSelectedAspect(getCardAspect(card));
      }
    }
  }, [card, initialAspect]);

  if (!isOpen || !card) return null;

  const theme = typeThemes[card.type] || typeThemes.NORMAL;
  const rarity = rarityBadges[card.rarity];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 20), y: x * 20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border-2 border-[#3B4CCA]/50 rounded-3xl shadow-2xl overflow-hidden my-6">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${theme.lightBg} border ${theme.border}`}>
              <Sparkles className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-mono text-xs font-black text-slate-400">
                  #{String(card.pokedexNumber).padStart(3, '0')}
                </span>
                <h3 className="text-base font-black text-white">{card.name}</h3>
                <span className="text-xs font-bold text-amber-400">Nv.{card.level}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badge}`}>
                  {card.type}
                </span>
              </div>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Inspeccion de carta y galeria de aspectos visuales
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rarity.color}`}>
              {rarity.label}
            </span>
            {card.isInDeck && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                <Check className="w-3.5 h-3.5" /> En Mazo
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* Left: 3D Interactive Card */}
          <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="w-72 cursor-grab active:cursor-grabbing select-none"
            >
              <PokemonCardView card={card} aspect={selectedAspect} />
            </div>

            {selectedAspect === 'animated' && (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-center animate-pulse shadow-lg shadow-cyan-500/20">
                <span className="text-xs font-black text-cyan-300 flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FFCB05]" />
                  Haz clic para que {card.name} ataque a la pantalla!
                </span>
              </div>
            )}

            <span className="text-[11px] text-blue-200/50 font-medium">
              Pasa el raton sobre la carta para inclinarla en 3D
            </span>
          </div>

          {/* Right: Aspect Selector & Stats */}
          <div className="md:col-span-7 space-y-5">

            {/* Aspect Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFCB05]" />
                  Selecciona un Aspecto:
                </h4>
                <span className="text-[10px] font-mono text-slate-400">5 acabados</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CARD_ASPECTS.map((asp) => {
                  const isSelected = selectedAspect === asp.id;
                  const Icon = asp.icon;
                  return (
                    <button
                      key={asp.id}
                      onClick={() => setSelectedAspect(asp.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'border-[#FFCB05] bg-[#FFCB05]/10 shadow-md ring-1 ring-[#FFCB05]/50'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-[#FFCB05] text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white truncate">{asp.name}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${asp.tagColor}`}>{asp.badge}</span>
                        </div>
                        <p className="text-[10px] text-blue-200/60 mt-0.5 line-clamp-2">{asp.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estadisticas de Combate
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">HP</span>
                  <span className="text-xs font-black text-rose-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <Heart className="w-3 h-3 fill-rose-500" /> {card.hp}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">ATK</span>
                  <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <Swords className="w-3 h-3" /> {card.attack}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">DEF</span>
                  <span className="text-xs font-black text-blue-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <Shield className="w-3 h-3" /> {card.defense}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">SPD</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <Zap className="w-3 h-3" /> {card.speed}
                  </span>
                </div>
              </div>

              {/* Moves */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Habilidades y Poderes
                </span>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-white">{card.move1Name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{card.move1Description || 'Ataque basico veloz.'}</p>
                  </div>
                  <span className="text-xs font-black text-rose-400 shrink-0 pl-2">{card.move1Damage} DMG</span>
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
                        Efecto: {card.move2SpecialEffect}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-amber-400 shrink-0 pl-2">{card.move2Damage} DMG</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onLevelUp(card)}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 transition-colors flex items-center gap-1.5"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Mejorar Nivel</span>
              </button>

              <button
                onClick={() => onToggleDeck(card)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 ${
                  card.isInDeck
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{card.isInDeck ? 'Quitar del Mazo' : 'Poner en Mazo'}</span>
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
    </div>
  );
};
