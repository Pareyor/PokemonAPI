import React, { useState } from 'react';
import { BoosterPackResult, PokemonCard } from '../types';
import { PokemonCardView } from './PokemonCardView';
import { Sparkles, X, Coins, ShieldCheck } from 'lucide-react';

interface BoosterPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPack: (packType: string) => Promise<BoosterPackResult>;
  trainerCoins: number;
}

const PACKS = [
  {
    id: 'BASIC',
    name: 'Sobre Básico PokéPulse',
    cost: 100,
    cardCount: 3,
    description: 'Contiene 3 cartas Pokémon variadas. Probabilidad de cartas holográficas.',
    color: 'from-blue-600 via-indigo-600 to-cyan-500',
    border: 'border-blue-500/40',
    badge: 'IDEAL PRINCIPIANTE',
  },
  {
    id: 'KANTO_MASTERS',
    name: 'Sobre Maestros de Kanto',
    cost: 200,
    cardCount: 4,
    description: 'Contiene 4 cartas. ¡Garantiza al menos 1 carta Rara o superior!',
    color: 'from-purple-600 via-pink-600 to-rose-500',
    border: 'border-purple-500/50',
    badge: 'RARA GARANTIZADA ★',
  },
  {
    id: 'LEGENDARY_ECLIPSE',
    name: 'Sobre Eclipse Legendario',
    cost: 350,
    cardCount: 5,
    description: 'Contiene 5 cartas. ¡Garantiza al menos 1 carta Épica o Legendaria con efecto Holo!',
    color: 'from-amber-500 via-orange-600 to-red-600',
    border: 'border-amber-500/60',
    badge: 'ÉPICA / LEGENDARIA ★★',
  },
];

export const BoosterPackModal: React.FC<BoosterPackModalProps> = ({
  isOpen,
  onClose,
  onOpenPack,
  trainerCoins,
}) => {
  const [loading, setLoading] = useState(false);
  const [packResult, setPackResult] = useState<BoosterPackResult | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuyAndOpen = async (packId: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await onOpenPack(packId);
      setPackResult(result);
      // Auto-reveal the first card
      setRevealedIndices([0]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al abrir el sobre');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealCard = (idx: number) => {
    if (!revealedIndices.includes(idx)) {
      setRevealedIndices((prev) => [...prev, idx]);
    }
  };

  const handleRevealAll = () => {
    if (packResult) {
      setRevealedIndices(packResult.cardsObtained.map((_, i) => i));
    }
  };

  const handleReset = () => {
    setPackResult(null);
    setRevealedIndices([]);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Tienda de Sobres Booster</h3>
              <p className="text-xs text-slate-400">Desbloquea nuevas cartas con poderes únicos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{trainerCoins}</span>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {!packResult ? (
            /* Pack Selection View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PACKS.map((pack) => {
                const canAfford = trainerCoins >= pack.cost;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 ${pack.border} p-5 flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-transform`}
                  >
                    <div>
                      {/* Badge */}
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                        {pack.badge}
                      </span>

                      {/* Pack Visual Art Mock */}
                      <div
                        className={`w-full h-36 rounded-xl bg-gradient-to-tr ${pack.color} flex flex-col items-center justify-center p-4 text-center shadow-lg relative overflow-hidden mb-4`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
                        <Sparkles className="w-8 h-8 text-white mb-1 drop-shadow-md animate-pulse" />
                        <span className="font-black text-sm text-white tracking-wide drop-shadow">
                          {pack.name}
                        </span>
                        <span className="text-[10px] font-bold text-white/80 mt-0.5">
                          {pack.cardCount} CARTAS
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                        {pack.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-black text-amber-400">
                        <Coins className="w-4 h-4" />
                        <span>{pack.cost}</span>
                      </div>

                      <button
                        onClick={() => handleBuyAndOpen(pack.id)}
                        disabled={loading || !canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                          canAfford
                            ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/20 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {loading ? 'Abriendo...' : canAfford ? 'Abrir Sobre' : 'Monedas insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Opened Cards Reveal View */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    ¡Sobre {packResult.packName} abierto con éxito!
                  </h4>
                  <p className="text-xs text-indigo-300">
                    Haz clic en cada carta para revelarla o pulsa &quot;Revelar Todas&quot;.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRevealAll}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Revelar Todas
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Abrir Otro Sobre
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {packResult.cardsObtained.map((card: PokemonCard, idx: number) => {
                  const isRevealed = revealedIndices.includes(idx);

                  if (!isRevealed) {
                    return (
                      <div
                        key={idx}
                        onClick={() => handleRevealCard(idx)}
                        className="h-80 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 border-2 border-dashed border-indigo-500/40 flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-105 transition-all shadow-xl text-center group"
                      >
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center group-hover:animate-bounce mb-3">
                          <Sparkles className="w-8 h-8 text-amber-400" />
                        </div>
                        <span className="text-sm font-black text-white">Carta #{idx + 1}</span>
                        <span className="text-xs text-indigo-300 mt-1">¡Toca para revelar!</span>
                      </div>
                    );
                  }

                  return (
                    <div key={card.id || idx} className="animate-float">
                      <PokemonCardView card={card} compact />
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" /> Todas las cartas han sido guardadas en tu colección de PostgreSQL
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
