import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { BattleActionType, BattleEvent, BattleOpponent, BattleState, Combatant, PokemonCard, PokemonType } from '../types';
import { typeThemes } from './PokemonCardView';
import { ArrowUpDown, BookOpen, Coins, Crown, Flag, Shield, Sparkles, Swords, Trophy, Zap } from 'lucide-react';

interface BattleArenaProps {
  deckCards: PokemonCard[];
  allCards: PokemonCard[];
  opponents: BattleOpponent[];
  onBattleFinished: (won: boolean, opponentName: string, coins: number) => void;
  onSwitchToAlbum: () => void;
}

const MAX_TEAM = 6;
const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

export const TYPE_LABELS: Record<PokemonType, string> = {
  FIRE: 'Fuego', WATER: 'Agua', GRASS: 'Planta', ELECTRIC: 'Eléctrico', PSYCHIC: 'Psíquico', FIGHTING: 'Lucha',
  DRAGON: 'Dragón', DARK: 'Siniestro', STEEL: 'Acero', NORMAL: 'Normal', BUG: 'Bicho', FLYING: 'Volador',
  POISON: 'Veneno', GROUND: 'Tierra', ROCK: 'Roca', GHOST: 'Fantasma', ICE: 'Hielo', FAIRY: 'Hada',
};

const EFFECT_LABELS: Record<string, string> = {
  BURN: '🔥 Puede quemar', POISON: '🔥 Puede quemar',
  PARALYZE: '⚡ Puede paralizar', FREEZE: '⚡ Puede paralizar',
  HEAL: '💚 Recupera PS', CRITICAL: '💥 Crítico seguro',
};

const DIFFICULTY_STYLE: Record<string, string> = {
  'FÁCIL': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'MEDIA': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'DIFÍCIL': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'EXTREMA': 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
};

// Duración de cada tipo de evento al reproducirlo (ms)
const EVENT_DELAY: Partial<Record<BattleEvent['type'], number>> = {
  SUMMON: 750, MOVE: 450, DAMAGE: 850, HEAL: 650, FAINT: 950, STATUS: 700, STATUS_DAMAGE: 700,
  GUARD: 600, GUARD_FAILED: 700, PARALYZED: 750, SWITCH: 450, END: 300,
};

// ─── Sonido (un único AudioContext compartido) ───
let audioCtx: AudioContext | null = null;
const sfx = (kind: 'attack' | 'hit' | 'super' | 'faint' | 'summon' | 'guard' | 'heal') => {
  try {
    audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    const c = audioCtx; const t = c.currentTime;
    const tone = (f1: number, f2: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t + delay); o.frequency.exponentialRampToValueAtTime(f2, t + delay + dur);
      g.gain.setValueAtTime(vol, t + delay); g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g); g.connect(c.destination); o.start(t + delay); o.stop(t + delay + dur + 0.02);
    };
    if (kind === 'attack') tone(320, 90, 0.18, 0.15, 'sawtooth');
    if (kind === 'hit') {
      const b = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate); const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.04));
      const s = c.createBufferSource(); const f = c.createBiquadFilter(); const g = c.createGain();
      s.buffer = b; f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0.45;
      s.connect(f); f.connect(g); g.connect(c.destination); s.start();
    }
    if (kind === 'super') [440, 554, 659, 880].forEach((f, i) => tone(f, f, 0.25, 0.08, 'triangle', i * 0.06));
    if (kind === 'faint') tone(320, 55, 0.7, 0.15);
    if (kind === 'summon') tone(400, 900, 0.22, 0.08, 'triangle');
    if (kind === 'guard') tone(700, 1200, 0.15, 0.06, 'square');
    if (kind === 'heal') [523, 659, 784].forEach((f, i) => tone(f, f, 0.3, 0.06, 'sine', i * 0.08));
  } catch { /* sin audio */ }
};

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const clone = (s: BattleState): BattleState => JSON.parse(JSON.stringify(s));

const TypeChip: React.FC<{ type?: PokemonType; small?: boolean }> = ({ type, small }) =>
  type ? (
    <span className={`inline-flex rounded-md border font-black uppercase tracking-wide ${typeThemes[type].badge} ${small ? 'px-1 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'}`}>
      {TYPE_LABELS[type]}
    </span>
  ) : null;

const hpColor = (ratio: number) => (ratio > 0.5 ? 'bg-emerald-400' : ratio > 0.2 ? 'bg-amber-400' : 'bg-rose-500');

const Hud: React.FC<{ mon: Combatant; team: Combatant[]; active: number; side: 'player' | 'opponent'; energy: number }> = ({ mon, team, active, side, energy }) => {
  const ratio = mon.maxHp ? mon.hp / mon.maxHp : 0;
  return (
    <div className={`bt-hud ${side === 'player' ? 'bt-hud-player' : 'bt-hud-opponent'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-black text-white">{mon.name ?? '???'}</span>
          <TypeChip type={mon.type} small />
          {mon.status === 'BURN' && <span className="rounded bg-orange-600 px-1 text-[8px] font-black text-white">QUE</span>}
          {mon.status === 'PARALYZE' && <span className="rounded bg-yellow-400 px-1 text-[8px] font-black text-slate-900">PAR</span>}
        </div>
        <span className="text-[10px] font-bold text-amber-200">Nv.{mon.level ?? '?'}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="text-[9px] font-black text-amber-300">PS</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-black/40 bg-black/50">
          <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${hpColor(ratio)}`} style={{ width: `${Math.max(0, ratio * 100)}%` }} />
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex gap-1" aria-label={`${team.filter((c) => c.hp > 0).length} de ${team.length} en pie`}>
          {team.map((c, i) => (
            <i key={i} className={`bt-ball ${c.hp <= 0 ? 'is-out' : i === active ? 'is-active' : ''}`} />
          ))}
        </div>
        <span className="font-mono text-[10px] font-bold text-white/80">{side === 'player' ? `${mon.hp}/${mon.maxHp}` : `${Math.round(ratio * 100)}%`}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/40" title={`Energía ${energy}%`}>
        <div className={`h-full transition-[width] duration-500 ${energy >= 100 ? 'bg-cyan-300 bt-energy-full' : 'bg-cyan-500/70'}`} style={{ width: `${energy}%` }} />
      </div>
    </div>
  );
};

export const BattleArena: React.FC<BattleArenaProps> = ({ deckCards, allCards, opponents, onBattleFinished, onSwitchToAlbum }) => {
  const [opponentId, setOpponentId] = useState<string>('');
  const [team, setTeam] = useState<number[]>([]);
  const [battle, setBattle] = useState<BattleState | null>(null); // lo que se muestra (avanza evento a evento)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [anim, setAnim] = useState<{ player: string; opponent: string }>({ player: '', opponent: '' });
  const [popup, setPopup] = useState<{ side: 'PLAYER' | 'OPPONENT'; text: string; kind: string; key: number } | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const lastTeam = useRef<number[]>([]);

  const opponent = opponents.find((o) => o.id === opponentId) ?? opponents[0];

  // Colección ordenada para elegir equipo: mazo primero, luego las más fuertes
  const pickable = useMemo(() => {
    const score = (c: PokemonCard) => c.hp + c.attack + c.defense + c.speed;
    // Las cartas forjadas son proxies: no son legales en la Arena
    return allCards.filter((c) => !c.isCustom).sort((a, b) => Number(b.isInDeck) - Number(a.isInDeck) || score(b) - score(a));
  }, [allCards]);

  useEffect(() => {
    if (team.length === 0 && deckCards.length > 0) setTeam(deckCards.filter((c) => !c.isCustom).slice(0, MAX_TEAM).map((c) => c.id));
  }, [deckCards, team.length]);

  // Retomar un combate a medias (p. ej. tras recargar la página)
  useEffect(() => {
    api.getActiveBattle().then((active) => {
      if (active) {
        setBattle(active);
        setMessage(active.awaitingPlayerSwitch ? 'Elige tu siguiente Pokémon.' : '¿Qué hará tu Pokémon?');
        setShowSwitch(active.awaitingPlayerSwitch);
      }
    }).catch(() => {});
  }, []);

  /** Reproduce los eventos de un turno sobre el estado anterior y termina en el estado del servidor. */
  const play = useCallback(async (from: BattleState | null, next: BattleState) => {
    const view = from ? clone(from) : clone(next);
    view.turn = next.turn;
    for (const e of next.events) {
      const isPlayer = e.side === 'PLAYER';
      const key = isPlayer ? 'player' : 'opponent';
      const team = isPlayer ? view.playerTeam : view.opponentTeam;
      const activeIdx = isPlayer ? view.playerActive : view.opponentActive;
      setMessage(e.text);
      setLog((l) => [e.text, ...l].slice(0, 40));

      switch (e.type) {
        case 'SUMMON':
          if (isPlayer) view.playerActive = e.index ?? 0; else view.opponentActive = e.index ?? 0;
          team[e.index ?? 0] = { ...(isPlayer ? next.playerTeam : next.opponentTeam)[e.index ?? 0], hp: e.hpAfter ?? team[e.index ?? 0].hp };
          setAnim((a) => ({ ...a, [key]: 'animate-summon' })); sfx('summon');
          break;
        case 'MOVE':
          setAnim((a) => ({ ...a, [key]: isPlayer ? 'animate-player-lunge' : 'animate-opp-lunge' }));
          if (e.critical) setPopup({ side: e.side, text: '¡ESPECIAL!', kind: 'special', key: Date.now() });
          sfx('attack');
          break;
        case 'DAMAGE':
        case 'STATUS_DAMAGE':
          team[activeIdx] = { ...team[activeIdx], hp: e.hpAfter ?? team[activeIdx].hp };
          setAnim((a) => ({ ...a, [key]: 'animate-hurt' }));
          setPopup({
            side: e.side, key: Date.now(),
            text: `-${e.amount}${e.critical ? ' ¡CRÍTICO!' : ''}${(e.effectiveness ?? 1) > 1 ? ' ¡SÚPER EFICAZ!' : (e.effectiveness ?? 1) < 1 ? ' poco eficaz' : ''}`,
            kind: (e.effectiveness ?? 1) > 1 || e.critical ? 'big' : 'damage',
          });
          sfx((e.effectiveness ?? 1) > 1 ? 'super' : 'hit');
          break;
        case 'HEAL':
          team[activeIdx] = { ...team[activeIdx], hp: e.hpAfter ?? team[activeIdx].hp };
          setPopup({ side: e.side, text: `+${e.amount}`, kind: 'heal', key: Date.now() }); sfx('heal');
          break;
        case 'STATUS':
          team[activeIdx] = { ...team[activeIdx], status: (isPlayer ? next.playerTeam : next.opponentTeam)[activeIdx]?.status ?? 'NONE' };
          break;
        case 'GUARD':
          setAnim((a) => ({ ...a, [key]: 'bt-guard' })); sfx('guard');
          break;
        case 'FAINT':
          team[e.index ?? activeIdx] = { ...team[e.index ?? activeIdx], hp: 0 };
          setAnim((a) => ({ ...a, [key]: 'animate-faint' })); sfx('faint');
          break;
      }
      setBattle(clone(view));
      await wait(EVENT_DELAY[e.type] ?? 500);
      if (e.type !== 'FAINT') setAnim({ player: '', opponent: '' });
    }
    setAnim({ player: '', opponent: '' });
    setBattle(next);
    if (next.status !== 'ACTIVE') {
      onBattleFinished(next.status === 'WON', next.opponentName, next.coinsEarned);
    } else {
      setMessage(next.awaitingPlayerSwitch ? 'Elige tu siguiente Pokémon.' : '¿Qué hará tu Pokémon?');
      setShowSwitch(next.awaitingPlayerSwitch);
    }
  }, [onBattleFinished]);

  const start = async (cardIds = team) => {
    if (!opponent || cardIds.length === 0) return;
    setBusy(true); setError(''); setLog([]);
    try {
      lastTeam.current = cardIds;
      const s = await api.startBattle(opponent.id, cardIds);
      await play(null, s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (action: BattleActionType, switchTo?: number) => {
    if (!battle || busy) return;
    setBusy(true); setError(''); setShowSwitch(false); setConfirmForfeit(false);
    try {
      const next = await api.battleAction(battle.battleId, action, switchTo);
      await play(battle, next);
    } catch (e: any) {
      setError(e.message);
      if (battle.awaitingPlayerSwitch) setShowSwitch(true);
    } finally {
      setBusy(false);
    }
  };

  const toggleTeam = (id: number) => {
    setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < MAX_TEAM ? [...t, id] : t));
  };

  // ─── PREPARACIÓN ─────────────────────────────────────────────────────────
  if (!battle) {
    const byId = new Map(allCards.map((c) => [c.id, c]));
    return (
      <div className="space-y-8">
        <header className="text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-black text-white"><Swords className="h-7 w-7 text-[#FFCB05]" />Arena de Combate</h2>
          <p className="mt-1 text-xs text-blue-200/70">Combates por turnos: la velocidad decide quién ataca primero, los tipos importan y la energía carga tu ataque especial.</p>
        </header>

        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}

        <section>
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">1 · Elige rival</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {opponents.map((o) => {
              const selected = opponent?.id === o.id;
              return (
                <button key={o.id} onClick={() => setOpponentId(o.id)}
                  className={`bt-rival group relative overflow-hidden rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-300/70 bg-amber-300/[.07] shadow-lg shadow-amber-500/10' : 'border-white/10 bg-slate-950/60 hover:border-white/25'}`}>
                  <div className="flex items-start justify-between">
                    <img src={o.avatarUrl} alt="" className="h-20 w-20 object-contain drop-shadow-xl" style={{ imageRendering: 'pixelated' }} />
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${DIFFICULTY_STYLE[o.difficulty] ?? ''}`}>{o.difficulty}</span>
                  </div>
                  <p className="mt-2 font-black text-white">{o.name}</p>
                  <p className="text-[11px] text-slate-400">{o.title}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-black text-amber-300"><Coins className="h-3.5 w-3.5" />+{o.rewardCoins}</span>
                    <span className="text-slate-400" title="Inteligencia del rival">IA {'★'.repeat(o.aiLevel)}{'☆'.repeat(3 - o.aiLevel)}</span>
                  </div>
                  <div className="mt-3 flex -space-x-2">
                    {o.team.map((m) => (
                      <img key={m.id} src={`${SPRITES}${m.pokedexNumber}.png`} alt={m.name} title={`${m.name} · ${TYPE_LABELS[m.type]}`} className="h-9 w-9 rounded-full border border-white/10 bg-slate-900/80" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">2 · Tu equipo ({team.length}/{MAX_TEAM}) · el primero sale al campo</h3>
            <button onClick={onSwitchToAlbum} className="flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-white"><BookOpen className="h-3.5 w-3.5" />Gestionar mazo</button>
          </div>
          <div className="mb-4 flex min-h-16 flex-wrap gap-2 rounded-2xl border border-dashed border-white/15 bg-black/20 p-3">
            {team.length === 0 && <p className="self-center text-xs text-slate-500">Toca cartas de tu colección para añadirlas.</p>}
            {team.map((id, i) => {
              const c = byId.get(id);
              return c && (
                <button key={id} onClick={() => toggleTeam(id)} title="Quitar del equipo" className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 py-1 pl-1 pr-3 hover:border-rose-400/50">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900">{i + 1}</span>
                  <img src={`${SPRITES}${c.pokedexNumber}.png`} alt="" className="h-8 w-8" />
                  <span className="text-xs font-bold text-white">{c.name}</span>
                </button>
              );
            })}
          </div>
          <div className="grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-6">
            {pickable.map((c) => {
              const pos = team.indexOf(c.id);
              return (
                <button key={c.id} onClick={() => toggleTeam(c.id)} disabled={pos < 0 && team.length >= MAX_TEAM}
                  className={`relative rounded-xl border p-2 text-left transition disabled:opacity-35 ${pos >= 0 ? 'border-amber-300/70 bg-amber-300/10' : 'border-white/10 bg-slate-950/60 hover:border-white/30'}`}>
                  {pos >= 0 && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900">{pos + 1}</span>}
                  <img src={`${SPRITES}${c.pokedexNumber}.png`} alt="" className="mx-auto h-14 w-14" loading="lazy" />
                  <p className="truncate text-xs font-black text-white">{c.name}</p>
                  <div className="mt-0.5 flex items-center justify-between"><TypeChip type={c.type} small /><span className="text-[9px] text-slate-400">PS {c.hp} · VEL {c.speed}</span></div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center">
          <button onClick={() => start()} disabled={busy || team.length === 0 || !opponent}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-rose-900/30 transition hover:brightness-110 active:scale-95 disabled:opacity-40">
            <Swords className="h-5 w-5" />{busy ? 'Entrando a la arena…' : `Combatir contra ${opponent?.name ?? ''}`}
          </button>
        </div>
      </div>
    );
  }

  // ─── COMBATE ─────────────────────────────────────────────────────────────
  const me = battle.playerTeam[battle.playerActive];
  const foe = battle.opponentTeam[battle.opponentActive];
  const finished = battle.status !== 'ACTIVE';
  const locked = busy || finished || battle.awaitingPlayerSwitch;
  const specialReady = battle.playerEnergy >= 100;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="bt-arena relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
        <div className="bt-field">
        <div className="bt-sky" aria-hidden />
        <div className="bt-ground" aria-hidden />
        <div className="absolute right-3 top-3 z-30 rounded-full border border-white/15 bg-black/50 px-3 py-1 font-mono text-[11px] font-black text-white">
          TURNO {battle.turn}/{battle.maxTurns}
        </div>

        {/* Rival */}
        <div className="absolute left-3 top-3 z-20 sm:left-8 sm:top-8"><Hud mon={foe} team={battle.opponentTeam} active={battle.opponentActive} side="opponent" energy={battle.opponentEnergy} /></div>
        <div className="bt-slot bt-slot-opponent">
          <i className="bt-platform" />
          {foe?.pokedexNumber && (
            <img key={`o-${battle.opponentActive}`} src={`${SPRITES}other/showdown/${foe.pokedexNumber}.gif`} onError={(e) => { e.currentTarget.src = foe.imageUrl ?? ''; }}
              alt={foe.name} className={`bt-sprite ${anim.opponent} ${foe.hp <= 0 ? 'opacity-0' : ''}`} />
          )}
          {popup?.side === 'OPPONENT' && <span key={popup.key} className={`bt-popup bt-popup-${popup.kind}`}>{popup.text}</span>}
        </div>

        {/* Jugador */}
        <div className="bt-slot bt-slot-player">
          <i className="bt-platform" />
          {me?.pokedexNumber && (
            <img key={`p-${battle.playerActive}`} src={`${SPRITES}other/showdown/back/${me.pokedexNumber}.gif`} onError={(e) => { e.currentTarget.src = `${SPRITES}back/${me.pokedexNumber}.png`; }}
              alt={me.name} className={`bt-sprite bt-sprite-back ${anim.player} ${me.hp <= 0 ? 'opacity-0' : ''}`} />
          )}
          {popup?.side === 'PLAYER' && <span key={popup.key} className={`bt-popup bt-popup-${popup.kind}`}>{popup.text}</span>}
        </div>
        <div className="absolute bottom-3 right-3 z-20 sm:bottom-6 sm:right-8"><Hud mon={me} team={battle.playerTeam} active={battle.playerActive} side="player" energy={battle.playerEnergy} /></div>
        </div>

        {/* Caja de mensajes + acciones */}
        <div className="relative z-30 grid gap-2 border-t-4 border-[#1e293b] bg-[#0b1222] p-3 sm:grid-cols-[1fr_1.4fr]">
          <p className="bt-message min-h-[52px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-white" aria-live="polite">{message}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => act('ATTACK')} disabled={locked} className="bt-move">
              <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-300" />{me.move1Name}</span>
              <small>Poder {me.move1Power} · +34% energía</small>
            </button>
            <button onClick={() => act('SPECIAL')} disabled={locked || !specialReady} className={`bt-move ${specialReady ? 'bt-move-ready' : ''}`}>
              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-cyan-300" />{me.move2Name}</span>
              <small>{specialReady ? `Poder ${me.move2Power} · ${EFFECT_LABELS[me.move2Effect ?? ''] ?? 'Listo'}` : `Energía ${battle.playerEnergy}%`}</small>
            </button>
            <button onClick={() => act('GUARD')} disabled={locked} className="bt-move" title={battle.playerGuardedLastTurn ? 'Usarlo dos turnos seguidos falla' : 'Reduce el daño recibido este turno'}>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-sky-300" />Proteger</span>
              <small>{battle.playerGuardedLastTurn ? '⚠ Fallará si repites' : '-60% daño · prioridad'}</small>
            </button>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button onClick={() => setShowSwitch(true)} disabled={locked || battle.playerTeam.filter((c) => c.hp > 0).length < 2} className="bt-move">
                <span className="flex items-center gap-1"><ArrowUpDown className="h-3.5 w-3.5 text-indigo-300" />Cambiar</span>
                <small>Gasta el turno</small>
              </button>
              <button onClick={() => (confirmForfeit ? act('FORFEIT') : setConfirmForfeit(true))} disabled={busy || finished}
                className={`bt-move !px-2 ${confirmForfeit ? '!border-rose-400 !bg-rose-600/30' : ''}`} title="Rendirse (cuenta como derrota)">
                <Flag className="h-4 w-4 text-rose-300" />
                <small>{confirmForfeit ? '¿Seguro?' : ''}</small>
              </button>
            </div>
          </div>
        </div>

        {/* Selector de relevo */}
        {showSwitch && !finished && (
          <div className="absolute inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm">
            <div className="w-full rounded-t-3xl border-t border-white/10 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-white">{battle.awaitingPlayerSwitch ? '¡Tu Pokémon se ha debilitado! Elige relevo' : '¿A quién sacas?'}</p>
                {!battle.awaitingPlayerSwitch && <button onClick={() => setShowSwitch(false)} className="text-xs font-bold text-slate-400 hover:text-white">Cancelar</button>}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {battle.playerTeam.map((c, i) => {
                  const out = c.hp <= 0; const current = i === battle.playerActive && !battle.awaitingPlayerSwitch;
                  return (
                    <button key={i} disabled={out || current || busy} onClick={() => act('SWITCH', i)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 p-2 text-left hover:border-amber-300/50 disabled:opacity-35">
                      <img src={`${SPRITES}${c.pokedexNumber}.png`} alt="" className="h-12 w-12" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-white">{c.name}</p>
                        <TypeChip type={c.type} small />
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50"><div className={`h-full ${hpColor(c.hp / c.maxHp)}`} style={{ width: `${(c.hp / c.maxHp) * 100}%` }} /></div>
                        <p className="mt-0.5 text-[9px] text-slate-400">{out ? 'Debilitado' : current ? 'En el campo' : `PS ${c.hp}/${c.maxHp} · VEL ${c.speed}`}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Resultado */}
        {finished && !busy && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-md">
            {battle.status === 'WON' ? <Trophy className="h-16 w-16 animate-bounce text-amber-300" /> : <Crown className="h-16 w-16 text-slate-500" />}
            <h3 className={`mt-3 text-3xl font-black ${battle.status === 'WON' ? 'welcome-gradient' : 'text-slate-200'}`}>{battle.status === 'WON' ? '¡VICTORIA!' : 'Derrota'}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {battle.status === 'WON' ? `Has vencido a ${battle.opponentName} en ${battle.turn} turnos.` : `${battle.opponentName} ha ganado esta vez.`}
            </p>
            {battle.coinsEarned > 0 && <p className="mt-2 flex items-center gap-1 text-lg font-black text-amber-300"><Coins className="h-5 w-5" />+{battle.coinsEarned}</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => { setBattle(null); start(lastTeam.current.length ? lastTeam.current : team); }} className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-900 hover:bg-amber-300">Revancha</button>
              <button onClick={() => { setBattle(null); setMessage(''); }} className="rounded-xl border border-white/20 px-5 py-2.5 text-xs font-black text-white hover:bg-white/10">Elegir otro rival</button>
            </div>
          </div>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}

      <details className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-slate-400">Registro del combate</summary>
        <ol className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-300">
          {log.map((l, i) => <li key={i} className={i === 0 ? 'text-white' : ''}>{l}</li>)}
        </ol>
      </details>
    </div>
  );
};
