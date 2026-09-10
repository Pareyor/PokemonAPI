import React, { useState } from 'react';
import { BoosterPackResult, PokemonCard } from '../types';
import { PokemonCardView, getCardAspect } from './PokemonCardView';
import { Sparkles, X, Coins, ShieldCheck, Scissors, ChevronRight, Layers, RotateCcw } from 'lucide-react';

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
    themeColor: '#2563eb',
    gradient: 'from-blue-600 via-indigo-700 to-sky-500',
    border: 'border-blue-500/50',
    glow: 'rgba(37, 99, 235, 0.4)',
    badge: 'PRINCIPIANTE',
    mascot: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu
    mascotName: 'Pikachu',
  },
  {
    id: 'KANTO_MASTERS',
    name: 'Sobre Maestros de Kanto',
    cost: 200,
    cardCount: 4,
    description: 'Contiene 4 cartas. ¡Garantiza al menos 1 carta Rara o superior!',
    themeColor: '#9333ea',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    border: 'border-purple-500/60',
    glow: 'rgba(147, 51, 234, 0.4)',
    badge: 'RARA GARANTIZADA ★',
    mascot: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', // Charizard
    mascotName: 'Charizard',
  },
  {
    id: 'LEGENDARY_ECLIPSE',
    name: 'Sobre Eclipse Legendario',
    cost: 350,
    cardCount: 5,
    description: 'Contiene 5 cartas. ¡Garantiza al menos 1 carta Épica o Legendaria con efecto Holo!',
    themeColor: '#d97706',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    border: 'border-amber-500/70',
    glow: 'rgba(217, 119, 6, 0.5)',
    badge: 'ÉPICA / LEGENDARIA ★★',
    mascot: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', // Mewtwo
    mascotName: 'Mewtwo',
  },
];

// Web Audio API Synthesizer for pack tear, whoosh, and rare sparkles
const playSound = (type: 'tear' | 'whoosh' | 'rare' | 'click') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (type === 'tear') {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'rare') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.45);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // AudioContext fallback
  }
};

export const BoosterPackModal: React.FC<BoosterPackModalProps> = ({
  isOpen,
  onClose,
  onOpenPack,
  trainerCoins,
}) => {
  const [step, setStep] = useState<'shop' | 'ready_to_tear' | 'tearing' | 'revealing' | 'summary'>('shop');
  const [selectedPack, setSelectedPack] = useState<(typeof PACKS)[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [packResult, setPackResult] = useState<BoosterPackResult | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isExitingCard, setIsExitingCard] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. User picks pack to buy
  const handleSelectAndBuyPack = async (pack: (typeof PACKS)[0]) => {
    setErrorMsg(null);
    setLoading(true);
    setSelectedPack(pack);
    try {
      playSound('click');
      const result = await onOpenPack(pack.id);
      setPackResult(result);
      setStep('ready_to_tear');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al comprar el sobre');
      setSelectedPack(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. Tear the foil pack
  const handleTearPack = () => {
    if (step !== 'ready_to_tear') return;
    playSound('tear');
    setStep('tearing');

    setTimeout(() => {
      setStep('revealing');
      setCurrentCardIndex(0);
      playSound('whoosh');

      if (packResult?.cardsObtained[0]?.isHolo || packResult?.cardsObtained[0]?.rarity !== 'COMMON') {
        setTimeout(() => playSound('rare'), 300);
      }
    }, 950);
  };

  // 3. User clicks on current card to pass to next card
  const handleNextCard = () => {
    if (isExitingCard || !packResult) return;

    setIsExitingCard(true);
    playSound('whoosh');

    setTimeout(() => {
      if (currentCardIndex + 1 < packResult.cardsObtained.length) {
        const nextIdx = currentCardIndex + 1;
        setCurrentCardIndex(nextIdx);
        setIsExitingCard(false);

        const nextCard = packResult.cardsObtained[nextIdx];
        if (nextCard.isHolo || nextCard.rarity === 'EPIC' || nextCard.rarity === 'LEGENDARY') {
          setTimeout(() => playSound('rare'), 200);
        }
      } else {
        setIsExitingCard(false);
        setStep('summary');
        playSound('rare');
      }
    }, 300);
  };

  const handleReset = () => {
    setStep('shop');
    setSelectedPack(null);
    setPackResult(null);
    setCurrentCardIndex(0);
    setIsExitingCard(false);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-[#3B4CCA]/40 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col min-h-[600px]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#CC0000]/20 border border-[#CC0000]/40 text-[#FFCB05]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Tienda Oficial de Sobres Booster
              </h3>
              <p className="text-xs text-blue-200/70">
                {step === 'shop' && 'Selecciona un sobre para abrir'}
                {step === 'ready_to_tear' && '¡Sobre listo! Rompe el envoltorio para abrirlo'}
                {step === 'tearing' && '¡Abriendo sobre...!'}
                {step === 'revealing' && `Carta ${currentCardIndex + 1} de ${packResult?.cardsObtained.length} (Toca la carta para continuar)`}
                {step === 'summary' && '¡Cartas desbloqueadas y guardadas!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FFCB05]/40 text-[#FFCB05] text-xs font-black shadow-sm"
              style={{ background: 'rgba(255, 203, 5, 0.08)' }}
            >
              <Coins className="w-4 h-4 text-[#FFCB05]" />
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

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center">

          {/* ======================================================== */}
          {/* STEP 1: SHOP CATALOG */}
          {/* ======================================================== */}
          {step === 'shop' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
              {PACKS.map((pack) => {
                const canAfford = trainerCoins >= pack.cost;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 ${pack.border} p-5 flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-transform relative overflow-hidden group`}
                  >
                    <div>
                      {/* Badge */}
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/10 text-white border border-white/20 mb-3">
                        {pack.badge}
                      </span>

                      {/* Foil Pack Preview Visual */}
                      <div
                        className={`w-full h-44 rounded-2xl bg-gradient-to-tr ${pack.gradient} flex flex-col items-center justify-between p-3 text-center shadow-2xl relative overflow-hidden mb-4 border border-white/20`}
                        style={{
                          boxShadow: `0 10px 25px -5px ${pack.glow}`,
                        }}
                      >
                        {/* Crimped top seal */}
                        <div className="w-full h-2.5 bg-black/30 border-b border-white/20 flex items-center justify-around opacity-60">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-0.5 h-full bg-white/40" />
                          ))}
                        </div>

                        {/* Mascot artwork */}
                        <div className="relative flex-1 flex items-center justify-center">
                          <img
                            src={pack.mascot}
                            alt={pack.name}
                            className="w-24 h-24 object-contain filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Pack Name on Foil */}
                        <div className="z-10 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/10 w-full">
                          <span className="font-black text-xs text-white tracking-wide block truncate drop-shadow">
                            {pack.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#FFCB05]">
                            {pack.cardCount} CARTAS
                          </span>
                        </div>

                        {/* Crimped bottom seal */}
                        <div className="w-full h-2.5 bg-black/30 border-t border-white/20 flex items-center justify-around opacity-60">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-0.5 h-full bg-white/40" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-blue-100/70 leading-relaxed min-h-[36px]">
                        {pack.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-black text-[#FFCB05]">
                        <Coins className="w-4 h-4" />
                        <span>{pack.cost}</span>
                      </div>

                      <button
                        onClick={() => handleSelectAndBuyPack(pack)}
                        disabled={loading || !canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                          canAfford
                            ? 'bg-[#CC0000] hover:bg-[#E83030] text-white shadow-red-900/30 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {loading && selectedPack?.id === pack.id
                          ? 'Comprando...'
                          : canAfford
                          ? 'Comprar y Abrir'
                          : 'Monedas insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2 & 3: REALISTIC BOOSTER PACK WITH TEAR ANIMATION */}
          {/* ======================================================== */}
          {(step === 'ready_to_tear' || step === 'tearing') && selectedPack && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full py-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[#FFCB05]">
                  {selectedPack.badge}
                </span>
                <h3 className="text-xl font-black text-white">
                  ¡Tienes en tus manos el sobre!
                </h3>
                <p className="text-xs text-blue-200/70">
                  Haz clic en la parte superior o pulsa el botón para rasgar el envoltorio.
                </p>
              </div>

              {/* Realistic 3D Foil Booster Pack */}
              <div className="relative w-64 h-[380px] select-none">
                {/* Back glow */}
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-60 -z-10"
                  style={{ background: selectedPack.glow }}
                />

                {/* The Full Foil Pack Container */}
                <div
                  onClick={handleTearPack}
                  className={`w-full h-full rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer shadow-2xl relative border-2 border-white/30 transition-transform duration-300 ${
                    step === 'ready_to_tear' ? 'hover:scale-105 active:scale-95' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${selectedPack.themeColor}, #0D1B3E 60%, ${selectedPack.themeColor})`,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {/* Metallic Light Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />

                  {/* TOP TEAR STRIP (Animates ripping off when torn) */}
                  <div
                    className={`relative z-20 w-full h-16 bg-black/40 border-b-2 border-dashed border-yellow-300/80 flex flex-col justify-between p-1.5 transition-all duration-700 origin-top-right ${
                      step === 'tearing'
                        ? 'translate-x-32 -translate-y-16 rotate-45 opacity-0'
                        : ''
                    }`}
                    style={{
                      background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, ${selectedPack.themeColor} 100%)`,
                    }}
                  >
                    {/* Top crimped seal */}
                    <div className="w-full h-3 bg-black/60 flex items-center justify-around">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="w-0.5 h-full bg-white/30" />
                      ))}
                    </div>

                    {/* Tear strip guidance */}
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-yellow-300 animate-pulse">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>¡TOCA AQUÍ PARA RASGAR!</span>
                    </div>

                    {/* Perforated dotted line */}
                    <div className="w-full border-b border-dashed border-white/60" />
                  </div>

                  {/* CARDS PEEKING OUT when tearing */}
                  {step === 'tearing' && (
                    <div className="absolute inset-x-6 top-6 h-40 bg-gradient-to-b from-blue-900 to-indigo-950 rounded-xl border-2 border-amber-400 z-10 shadow-2xl flex items-center justify-center animate-bounce">
                      <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
                    </div>
                  )}

                  {/* PACK CENTER ARTWORK */}
                  <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
                    <img
                      src={selectedPack.mascot}
                      alt={selectedPack.mascotName}
                      className="w-36 h-36 object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.7)]"
                    />

                    <div className="mt-2 text-center bg-black/50 px-3 py-1.5 rounded-xl border border-white/20 w-full">
                      <span className="font-pixel text-[9px] text-[#FFCB05] block tracking-wider">
                        POKÉPULSE TCG
                      </span>
                      <span className="font-black text-sm text-white tracking-wide drop-shadow">
                        {selectedPack.name}
                      </span>
                      <span className="text-[10px] font-bold text-blue-200">
                        {selectedPack.cardCount} CARTAS
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM CRIMPED SEAL */}
                  <div className="w-full h-5 bg-black/60 border-t border-white/20 flex items-center justify-around">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="w-0.5 h-full bg-white/30" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={handleTearPack}
                disabled={step === 'tearing'}
                className="w-full max-w-xs py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Scissors className="w-4 h-4" />
                <span>{step === 'tearing' ? '¡Rasgando envoltorio...!' : 'Rasgar y Abrir Sobre'}</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: CARD BY CARD INSPECTION (CLICK TO ADVANCE) */}
          {/* ======================================================== */}
          {step === 'revealing' && packResult && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md w-full py-2">
              {/* Progress & Card Counter Indicator */}
              <div className="flex items-center justify-between w-full px-2">
                <span className="text-xs font-black text-[#FFCB05] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FFCB05]" />
                  Carta {currentCardIndex + 1} de {packResult.cardsObtained.length}
                </span>

                {/* Dot trackers */}
                <div className="flex items-center gap-1.5">
                  {packResult.cardsObtained.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentCardIndex
                          ? 'w-6 bg-[#FFCB05]'
                          : i < currentCardIndex
                          ? 'w-2 bg-emerald-500'
                          : 'w-2 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hint badge */}
              {(() => {
                const currentCard = packResult.cardsObtained[currentCardIndex];
                const aspect = getCardAspect(currentCard);
                return (
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold border px-3.5 py-1 rounded-full animate-pulse ${
                    aspect === 'animated'
                      ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
                      : 'text-blue-200 bg-blue-950/60 border-blue-500/30'
                  }`}>
                    <span>
                      {aspect === 'animated'
                        ? '⚡ Toca el sprite del Pokémon · Usa "Siguiente" para avanzar'
                        : '👇 Toca sobre la carta para pasar a la siguiente'}
                    </span>
                  </div>
                );
              })()}

              {/* Stacked Cards Area */}
              {(() => {
                const currentCard = packResult.cardsObtained[currentCardIndex];
                const aspect = getCardAspect(currentCard);
                const isAnimated = aspect === 'animated';
                return (
                  <div
                    onClick={isAnimated ? undefined : handleNextCard}
                    className={`relative w-72 sm:w-80 select-none group ${isAnimated ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {/* Back card shadows representing remaining cards in stack */}
                    {currentCardIndex + 2 < packResult.cardsObtained.length && (
                      <div className="absolute inset-x-4 -top-3 h-full rounded-2xl bg-slate-800/60 border border-slate-700/60 -z-20 transform scale-95" />
                    )}
                    {currentCardIndex + 1 < packResult.cardsObtained.length && (
                      <div className="absolute inset-x-2 -top-1.5 h-full rounded-2xl bg-slate-800/80 border border-slate-700/80 -z-10 transform scale-98" />
                    )}

                    {/* Special card reveal banner */}
                    {(aspect === 'animated' || aspect === 'cosmos') && (
                      <div className={`mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border shadow-lg animate-pulse ${
                        aspect === 'animated'
                          ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300'
                          : 'bg-purple-950/80 border-purple-400/50 text-purple-200'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {aspect === 'animated' ? '⚡ ¡LEGENDARIA! Toca la imagen del Pokémon para ver el ataque' : '⭐ ¡CARTA ESPECIAL ENCONTRADA!'}
                      </div>
                    )}

                    {/* The Active Card */}
                    <div
                      className={`transition-all duration-300 transform ${
                        isExitingCard
                          ? 'translate-x-48 -rotate-12 opacity-0 scale-90'
                          : isAnimated ? '' : 'group-hover:scale-105 group-active:scale-95'
                      }`}
                    >
                      <PokemonCardView
                        card={currentCard}
                        aspect={aspect}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 w-full justify-center pt-2">
                <button
                  onClick={handleNextCard}
                  className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span>
                    {currentCardIndex + 1 < packResult.cardsObtained.length
                      ? 'Siguiente Carta'
                      : 'Ver Resumen Completo'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setStep('summary')}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
                >
                  Saltar
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: RECAP / SUMMARY OF ALL CARDS OBTAINED */}
          {/* ======================================================== */}
          {step === 'summary' && packResult && (
            <div className="w-full space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFCB05]" />
                    ¡Sobre {packResult.packName} abierto!
                  </h4>
                  <p className="text-xs text-blue-200/70">
                    Se han añadido {packResult.cardsObtained.length} cartas directamente a tu álbum.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-[#CC0000] hover:bg-[#E83030] text-white rounded-xl text-xs font-black shadow-md shadow-red-900/30 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Abrir Otro Sobre</span>
                  </button>
                  <button
                    onClick={() => {
                      handleReset();
                      onClose();
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Ver en Colección
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {packResult.cardsObtained.map((card: PokemonCard, idx: number) => (
                  <div key={card.id || idx} className="animate-float">
                    <PokemonCardView card={card} compact aspect={getCardAspect(card)} />
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-4 py-2 rounded-full border border-emerald-500/30 shadow-sm">
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
