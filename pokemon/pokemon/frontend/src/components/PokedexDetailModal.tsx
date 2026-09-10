import React, { useState } from 'react';
import { PokedexItem, PokemonCard } from '../types';
import { PokemonCardView, CardAspect, typeThemes } from './PokemonCardView';
import { X, Sparkles, Zap, Crown, Layers, BookOpen, CheckCircle2, Lock } from 'lucide-react';

interface PokedexDetailModalProps {
  entry: PokedexItem | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToShop?: () => void;
}

const CARD_ASPECTS: {
  id: CardAspect;
  name: string;
  badge: string;
  icon: React.ComponentType<any>;
  description: string;
  themeColor: string;
  tagColor: string;
}[] = [
  {
    id: 'classic',
    name: 'Clásica Mate',
    badge: 'EDICIÓN BASE',
    icon: Layers,
    description: 'Estilo original clásico de los videojuegos y cartas retro de primera generación.',
    themeColor: '#64748b',
    tagColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    id: 'holo',
    name: 'Mega EX Full Art',
    badge: 'MEGA EVOLUTION',
    icon: Sparkles,
    description: 'Estilo M Rayquaza EX: caligrafía japonesa en 3D, rayos eléctricos, 300 DMG y regla de Megaevolución.',
    themeColor: '#f59e0b',
    tagColor: 'bg-amber-950/80 text-amber-300 border-amber-400/60',
  },
  {
    id: 'cosmos',
    name: 'Ultrabrillante Shiny',
    badge: 'SHINY TREASURE',
    icon: Sparkles,
    description: 'Borde plateado holográfico, destellos en cruz de diamante (✦) y ráfagas prismáticas de cartas de colección.',
    themeColor: '#ffffff',
    tagColor: 'bg-slate-900 text-white border-white/80',
  },
  {
    id: 'animated',
    name: 'Live Animada',
    badge: 'MOVIMIENTO REAL',
    icon: Zap,
    description: '¡El Pokémon cobra vida y se mueve en tiempo real! Con vórtice de energía elemental y animación continua.',
    themeColor: '#00f0ff',
    tagColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60',
  },
  {
    id: 'gold',
    name: 'Oro Legendario 24K',
    badge: 'SECRET RARE',
    icon: Crown,
    description: 'Acabado en oro puro reluciente, grabados dorados y resplandor de lingote.',
    themeColor: '#eab308',
    tagColor: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
  },
];

export const PokedexDetailModal: React.FC<PokedexDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onGoToShop,
}) => {
  const [selectedAspect, setSelectedAspect] = useState<CardAspect>('animated');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!isOpen || !entry) return null;

  const theme = typeThemes[entry.primaryType] || typeThemes.NORMAL;

  // Synthesize a PokemonCard object to render with PokemonCardView
  const previewCard: PokemonCard = {
    id: entry.pokedexNumber,
    pokedexNumber: entry.pokedexNumber,
    name: entry.name,
    type: entry.primaryType,
    rarity:
      entry.pokedexNumber > 140
        ? 'LEGENDARY'
        : entry.pokedexNumber > 100
        ? 'EPIC'
        : entry.pokedexNumber > 50
        ? 'RARE'
        : 'COMMON',
    hp: entry.baseHp || 120,
    attack: entry.baseAttack || 65,
    defense: entry.baseDefense || 60,
    speed: entry.baseSpeed || 70,
    level: entry.highestLevel || 1,
    isHolo: selectedAspect !== 'classic',
    imageUrl: entry.imageUrl,
    move1Name: 'Ataque ' + entry.primaryType,
    move1Damage: entry.baseAttack || 50,
    move1Description: entry.description,
    move2Name: 'Poder Máximo',
    move2Damage: (entry.baseAttack || 50) + 40,
    move2SpecialEffect:
      selectedAspect === 'animated'
        ? 'Aura Dinámica VMAX'
        : selectedAspect === 'gold'
        ? 'Brillo de Oro 24K'
        : 'Efecto Elemental Crítico',
    isInDeck: false,
    isCustom: false,
  };

  // Interactive 3D mouse tilt handler
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
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#CC0000]/20 border border-[#CC0000]/40 text-[#FFCB05]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black text-slate-400">
                  #{String(entry.pokedexNumber).padStart(3, '0')}
                </span>
                <h3 className="text-base font-black text-white">{entry.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badge}`}>
                  {entry.primaryType}
                </span>
                {entry.secondaryType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {entry.secondaryType}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Inspección de Pokédex y Galería de Aspectos Visuales
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {entry.isOwned ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" /> En tu colección ({entry.ownedCount})
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" /> No capturado
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Interactive 3D Card Showcase */}
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
              <PokemonCardView card={previewCard} aspect={selectedAspect} />
            </div>

            {selectedAspect === 'animated' && (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-center animate-pulse shadow-lg shadow-cyan-500/20">
                <span className="text-xs font-black text-cyan-300 flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FFCB05]" />
                  ¡Haz clic en la carta para que {entry.name} ataque a la pantalla!
                </span>
              </div>
            )}

            <span className="text-[11px] text-blue-200/50 font-medium">
              💡 Pasa el ratón sobre la carta para inclinarla en 3D
            </span>
          </div>

          {/* Right Column: Aspect Selector & Pokemon Details */}
          <div className="md:col-span-7 space-y-5">
            {/* Aspect Selector Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFCB05]" />
                  Selecciona un Aspecto de Carta:
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  5 acabados disponibles
                </span>
              </div>

              {/* Skin Aspect Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CARD_ASPECTS.map((aspect) => {
                  const isSelected = selectedAspect === aspect.id;
                  const Icon = aspect.icon;

                  return (
                    <button
                      key={aspect.id}
                      onClick={() => setSelectedAspect(aspect.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'border-[#FFCB05] bg-[#FFCB05]/10 shadow-md ring-1 ring-[#FFCB05]/50'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#FFCB05] text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white block truncate">
                            {aspect.name}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${aspect.tagColor}`}>
                            {aspect.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-200/60 mt-0.5 line-clamp-2">
                          {aspect.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pokemon Pokédex Lore & Base Stats */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Descripción Oficial
                </span>
                <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                  {entry.description ||
                    `${entry.name} es un Pokémon icónico de la región de Kanto. Puede desatar formidables ataques elementales de tipo ${entry.primaryType}.`}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Salud</span>
                  <span className="text-xs font-black text-rose-400">{entry.baseHp} HP</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Ataque</span>
                  <span className="text-xs font-black text-amber-400">{entry.baseAttack}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Defensa</span>
                  <span className="text-xs font-black text-blue-400">{entry.baseDefense}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Velocidad</span>
                  <span className="text-xs font-black text-emerald-400">{entry.baseSpeed}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!entry.isOwned && onGoToShop && (
                <button
                  onClick={() => {
                    onClose();
                    onGoToShop();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#CC0000] to-[#E83030] hover:from-[#E83030] hover:to-[#FF4444] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Abrir Sobres para Conseguir a {entry.name}</span>
                </button>
              )}

              {entry.isOwned && (
                <div className="w-full py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Posees {entry.ownedCount} cartas de {entry.name} (Nivel Máximo {entry.highestLevel})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
