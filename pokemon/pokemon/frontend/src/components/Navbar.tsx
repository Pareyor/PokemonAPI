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
    <header
      className="sticky top-0 z-30 border-b-2 border-[#CC0000]/60"
      style={{ background: 'linear-gradient(180deg, #1a0505 0%, #0D1B3E 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo — Pokéball style */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('album')}>
            <div className="w-10 h-10 rounded-full border-2 border-white/80 flex flex-col overflow-hidden relative shadow-lg shadow-red-900/50">
              <div className="bg-[#CC0000] h-1/2 w-full" />
              <div className="bg-white h-1/2 w-full" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-900/80" />
              <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white border-2 border-gray-900/80 shadow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">PokéPulse</span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#FFCB05]/20 text-[#FFCB05] rounded-full border border-[#FFCB05]/40">
                  TCG ARENA
                </span>
              </div>
              <p className="text-[11px] text-blue-300/70 hidden sm:block">Cartas Coleccionables &amp; Combates</p>
            </div>
          </div>

          {/* Navigation Tabs — Pokémon Blue style */}
          <nav
            className="hidden md:flex items-center space-x-1 p-1 rounded-xl border border-[#3B4CCA]/40"
            style={{ background: 'rgba(13,27,62,0.8)' }}
          >
            <button
              onClick={() => onSelectTab('album')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'album'
                  ? 'bg-[#CC0000] text-white shadow-md shadow-red-900/50'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Colección ({profile?.totalCards || 0})
            </button>
            <button
              onClick={() => onSelectTab('pokedex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'pokedex'
                  ? 'bg-[#CC0000] text-white shadow-md shadow-red-900/50'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pokédex (151)</span>
            </button>
            <button
              onClick={() => onSelectTab('arena')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'arena'
                  ? 'bg-[#CC0000] text-white shadow-md shadow-red-900/50'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Arena de Combate</span>
            </button>
            <button
              onClick={() => onSelectTab('packs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'packs'
                  ? 'bg-[#CC0000] text-white shadow-md shadow-red-900/50'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tienda Sobres</span>
            </button>
          </nav>

          {/* Trainer Stats & CTAs */}
          <div className="flex items-center space-x-2.5">
            {/* PokéCoins — Pikachu yellow */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#FFCB05]/40 text-[#FFCB05] text-xs font-black shadow-sm"
              style={{ background: 'rgba(255,203,5,0.08)' }}
            >
              <Coins className="w-4 h-4 text-[#FFCB05]" />
              <span>{profile?.coins ?? 0}</span>
              <span className="text-[10px] text-[#FFCB05]/70 font-bold hidden sm:inline">PokéMonedas</span>
            </div>

            {/* Daily Bonus */}
            <button
              onClick={onClaimBonus}
              title="Reclamar 150 monedas gratis"
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#FFCB05] border border-[#FFCB05]/30 transition-colors hover:bg-[#FFCB05]/10"
              style={{ background: 'rgba(255,203,5,0.05)' }}
            >
              <Gift className="w-3.5 h-3.5 text-[#FFCB05]" />
              <span>+150</span>
            </button>

            {/* Open Pack */}
            <button
              onClick={onOpenBoosterShop}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #3B4CCA, #6366f1)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir Sobres</span>
            </button>

            {/* Forge Card */}
            <button
              onClick={onOpenCardCreator}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #CC0000, #E83030)' }}
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
              className="hidden lg:inline-flex p-2 rounded-lg text-blue-300/60 hover:text-white border border-[#3B4CCA]/30 hover:bg-[#3B4CCA]/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
