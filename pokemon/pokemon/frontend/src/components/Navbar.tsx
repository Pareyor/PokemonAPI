import React from 'react';
import { TrainerProfile } from '../types';
import { Coins, Swords, Gift, Sparkles, ExternalLink, Flame, BookOpen } from 'lucide-react';

interface NavbarProps {
  profile: TrainerProfile | null;
  onClaimBonus: () => void;
  onOpenBoosterShop: () => void;
  onOpenCardCreator: () => void;
  activeTab: string;
  onSelectTab: (tab: 'album' | 'pokedex' | 'arena' | 'packs') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onClaimBonus,
  onOpenBoosterShop,
  onOpenCardCreator,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('album')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <div className="w-6 h-6 rounded-full border-2 border-white flex flex-col justify-between overflow-hidden relative">
                <div className="bg-rose-500 h-1/2 w-full" />
                <div className="bg-white h-1/2 w-full" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-black" />
                <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white border border-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">PokéPulse</span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                  TCG ARENA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Cartas Coleccionables & Combates</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('album')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'album'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Colección ({profile?.totalCards || 0})
            </button>
            <button
              onClick={() => onSelectTab('pokedex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'pokedex'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pokédex (151)</span>
            </button>
            <button
              onClick={() => onSelectTab('arena')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'arena'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Arena de Combate</span>
            </button>
            <button
              onClick={() => onSelectTab('packs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'packs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tienda Sobres</span>
            </button>
          </nav>

          {/* Trainer Stats & CTAs */}
          <div className="flex items-center space-x-2.5">
            {/* PokéCoins Balance */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{profile?.coins ?? 0}</span>
              <span className="text-[10px] text-amber-500 font-bold hidden sm:inline">PokéMonedas</span>
            </div>

            {/* Daily Bonus Button */}
            <button
              onClick={onClaimBonus}
              title="Reclamar 150 monedas gratis"
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 transition-colors"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>+150</span>
            </button>

            {/* Open Pack CTA */}
            <button
              onClick={onOpenBoosterShop}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir Sobres</span>
            </button>

            {/* Create Custom Card CTA */}
            <button
              onClick={onOpenCardCreator}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Forjar Carta</span>
            </button>

            {/* Swagger link */}
            <a
              href="http://localhost:8089/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              title="Documentación API Swagger"
              className="hidden lg:inline-flex p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
