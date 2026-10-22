import React from 'react';
import { LogIn, Package, Swords, Layers } from 'lucide-react';

const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

const FEATURES = [
  { icon: Package, title: 'Sobres como los de verdad', text: 'Corta el sobre con el dedo, desliza las cartas y descubre las raras boca abajo.' },
  { icon: Swords, title: 'Combates por turnos', text: 'Tipos, velocidad, energía, quemaduras y parálisis contra líderes con IA.' },
  { icon: Layers, title: 'Tu colección', text: 'Cada entrenador tiene sus cartas, su mazo y su Pokédex.' },
];

export const WelcomeScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <section className="welcome-hero relative overflow-hidden rounded-[32px] border border-white/10 px-6 py-12 sm:px-12 sm:py-16">
    <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-black tracking-[.2em] text-amber-200">
          POKÉPULSE · TRADING CARD GAME
        </span>
        <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white sm:text-5xl">
          Abre sobres.<br />Arma tu mazo.<br /><span className="welcome-gradient">Gana a los líderes.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">
          Inicia sesión para ver tu colección. Cada cuenta tiene sus propias cartas, monedas y combates.
        </p>
        <button
          onClick={onLogin}
          className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#CC0000] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/40 transition hover:bg-red-600 active:scale-95"
        >
          <LogIn className="h-4 w-4" /> Iniciar sesión
        </button>
        <p className="mt-3 text-[11px] text-slate-500">Cuenta demo: <b className="text-slate-300">entrenador</b> / <b className="text-slate-300">pokemon123</b></p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <Icon className="h-5 w-5 text-amber-300" />
              <p className="mt-2 text-xs font-black text-white">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="welcome-fan relative mx-auto h-[340px] w-[300px]" aria-hidden>
        {[{ n: 25, c: '#facc15' }, { n: 6, c: '#f97316' }, { n: 150, c: '#a855f7' }].map(({ n, c }, i) => (
          <div key={n} className={`welcome-card welcome-card-${i}`} style={{ '--glow': c } as React.CSSProperties}>
            <img src={ART + n + '.png'} alt="" />
          </div>
        ))}
      </div>
    </div>
  </section>
);
