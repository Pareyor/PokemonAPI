import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { BoosterPackResult, BoosterPackType, CardRarity, PackCard, PackCatalogItem, PackSlotType, SealedPack } from '../types';
import { PokemonCardView, getCardAspect, rarityBadges } from './PokemonCardView';
import { ChevronDown, Coins, Crown, Hand, Layers, Package, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';

interface BoosterPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackOpened: (result: BoosterPackResult) => void;
  onCoinsChanged: () => void;
  trainerCoins: number;
  /** Modo pruebas del backend: las compras no descuentan monedas. */
  infiniteCoins?: boolean;
  /** Integrado en la página (pestaña Sobres) en lugar de como ventana modal a pantalla completa. */
  inline?: boolean;
}

type Stage = 'shop' | 'table' | 'ripping' | 'reveal' | 'summary';

const ARTWORK = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

// Geometría del sobre en la mesa. El corte sigue un borde dentado, como el aluminio real.
const PACK_W = 260;
const PACK_H = 400;
const CUT_Y = 54;
const CUT_ZONE = 120; // px desde arriba donde se puede empezar a cortar
const CUT_DONE = 0.9; // fracción del ancho que hay que recorrer
const ZIGZAG = Array.from({ length: PACK_W / 10 + 1 }, (_, i) => `${i * 10}px ${CUT_Y + (i % 2 ? 3 : -3)}px`);
const TOP_CLIP = `polygon(0 0, ${PACK_W}px 0, ${[...ZIGZAG].reverse().join(', ')})`;
const BODY_CLIP = `polygon(${ZIGZAG.join(', ')}, ${PACK_W}px ${PACK_H}px, 0 ${PACK_H}px)`;

const SLOT_LABELS: Record<PackSlotType, string> = {
  COMMON: 'Común',
  UNCOMMON: 'Infrecuente',
  REVERSE_HOLO: 'Reverse Holo',
  REVERSE_HOLO_HIT: 'Reverse Holo',
  RARE: 'Slot de rara',
  GOD_PACK: 'God Pack',
};

const auraFor = (rarity: CardRarity) =>
  rarity === 'SECRET_RARE' ? 'aura-secret' : rarity === 'LEGENDARY' ? 'aura-legendary' : 'aura-epic';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

// ─── Sonido: un único AudioContext compartido (los navegadores limitan cuántos se pueden crear) ───
let audioCtx: AudioContext | null = null;
const ctx = () => {
  try {
    audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
};
const noise = (duration: number, freq: number, volume: number) => {
  const c = ctx(); if (!c) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * duration * 0.4));
  const src = c.createBufferSource(); const filter = c.createBiquadFilter(); const gain = c.createGain();
  src.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = freq; gain.gain.value = volume;
  src.connect(filter); filter.connect(gain); gain.connect(c.destination); src.start();
};
const tone = (freq: number, start: number, duration: number, volume = 0.08, type: OscillatorType = 'sine') => {
  const c = ctx(); if (!c) return;
  const t = c.currentTime + start; const osc = c.createOscillator(); const gain = c.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain); gain.connect(c.destination); osc.start(t); osc.stop(t + duration + 0.02);
};
const sfx = {
  tick: () => noise(0.05, 3200 + Math.random() * 1500, 0.12),
  rip: () => noise(0.45, 2200, 0.35),
  swish: () => noise(0.18, 900, 0.15),
  flip: () => tone(520, 0, 0.15, 0.08, 'triangle'),
  chime: (rarity: CardRarity) => {
    const notes = rarity === 'SECRET_RARE' ? [523, 659, 784, 1047, 1319] : rarity === 'LEGENDARY' ? [523, 659, 784, 1047] : [587, 740, 880];
    notes.forEach((n, i) => tone(n, i * 0.09, 0.5, 0.07));
  },
};

// ─── Arte del sobre (se usa en miniatura en la tienda y a tamaño real en la mesa) ───
const PackArt: React.FC<{ item: PackCatalogItem }> = ({ item }) => (
  <div className="pack-art" style={{ '--pack-color': item.accentColor } as React.CSSProperties}>
    <i className="pack-crimp" />
    <div className="pack-face">
      <span className="pack-brand">POKÉPULSE · TCG</span>
      <img src={ARTWORK + item.mascotPokedexNumber + '.png'} alt="" draggable={false} />
      <b>{item.name}</b>
      <small>{item.cardCount} CARTAS · BOOSTER</small>
    </div>
    <i className="pack-sheen" />
    <i className="pack-crimp" />
  </div>
);

const CardBack: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={'tcg-card-back ' + className}>
    <em>POKÉ</em><b />
    <em>PULSE</em>
  </div>
);

export const BoosterPackModal: React.FC<BoosterPackModalProps> = ({ isOpen, onClose, onPackOpened, onCoinsChanged, trainerCoins, infiniteCoins = false, inline = false }) => {
  const [stage, setStage] = useState<Stage>('shop');
  const [catalog, setCatalog] = useState<PackCatalogItem[]>([]);
  const [sealed, setSealed] = useState<SealedPack[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [oddsOpen, setOddsOpen] = useState<BoosterPackType | null>(null);

  const [active, setActive] = useState<SealedPack | null>(null);
  const [result, setResult] = useState<BoosterPackResult | null>(null);

  // Mesa: inclinación del sobre y progreso del corte
  const packRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cut, setCut] = useState<{ from: number; to: number; at: number } | null>(null);
  const cutRef = useRef<{ min: number; max: number; lastTick: number } | null>(null);

  // Revelado: carta superior arrastrable
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<{ x: number; y: number } | null>(null);
  const [burst, setBurst] = useState(0);
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);

  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);
  const activeItem = active ? catalogById.get(active.packType) : undefined;
  const cards = result?.cards ?? [];
  const current: PackCard | undefined = cards[index];
  const needsFlip = !!current && current.hit && !flipped.has(index);

  const loadShop = useCallback(async () => {
    try {
      const [cat, inv] = await Promise.all([api.getPackCatalog(), api.getSealedPacks()]);
      setCatalog(cat);
      setSealed(inv);
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar la tienda.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadShop();
  }, [isOpen, loadShop]);

  const resetTable = () => {
    setCut(null); cutRef.current = null; setTilt({ x: 0, y: 0 });
    setIndex(0); setFlipped(new Set()); setOffset({ x: 0, y: 0 }); setLeaving(null); setDragging(false);
  };

  const backToShop = () => {
    resetTable(); setActive(null); setResult(null); setError(''); setStage('shop');
    loadShop();
  };

  const placeOnTable = (pack: SealedPack) => {
    resetTable(); setResult(null); setError(''); setActive(pack); setStage('table');
  };

  // ─── Tienda ───
  const buy = async (item: PackCatalogItem, quantity: number, openNow: boolean) => {
    setBusy(item.id + quantity); setError('');
    try {
      const purchase = await api.purchasePacks(item.id, quantity);
      onCoinsChanged();
      setSealed((prev) => [...prev, ...purchase.purchased]);
      if (openNow) placeOnTable(purchase.purchased[0]);
    } catch (e: any) {
      setError(e.message || 'No se pudo completar la compra.');
    } finally {
      setBusy(null);
    }
  };

  // ─── Mesa: cortar el sobre ───
  const localPoint = (e: React.PointerEvent) => {
    const rect = packRef.current!.getBoundingClientRect();
    const scale = rect.width / PACK_W;
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const completeCut = async () => {
    if (!active) return;
    cutRef.current = null;
    setCut({ from: 0, to: PACK_W, at: PACK_W });
    setStage('ripping');
    sfx.rip();
    try {
      // La animación de rasgado dura lo mismo que tarde la API como mínimo, para que no haya saltos
      const [opened] = await Promise.all([api.openSealedPack(active.id), wait(1300)]);
      setResult(opened);
      setSealed((prev) => prev.filter((p) => p.id !== active.id));
      onPackOpened(opened);
      setStage(opened.cards.length ? 'reveal' : 'summary');
    } catch (e: any) {
      setError(e.message || 'No se pudo abrir el sobre.');
      setCut(null);
      setStage('table');
    }
  };

  const onPackPointerDown = (e: React.PointerEvent) => {
    if (stage !== 'table') return;
    const p = localPoint(e);
    if (p.y > CUT_ZONE) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cutRef.current = { min: p.x, max: p.x, lastTick: 0 };
    setCut({ from: p.x, to: p.x, at: p.x });
  };

  const onPackPointerMove = (e: React.PointerEvent) => {
    if (stage !== 'table') return;
    const p = localPoint(e);
    const state = cutRef.current;
    if (!state) {
      setTilt({ x: (p.y / PACK_H - 0.5) * -14, y: (p.x / PACK_W - 0.5) * 18 });
      return;
    }
    const x = Math.max(0, Math.min(PACK_W, p.x));
    state.min = Math.min(state.min, x);
    state.max = Math.max(state.max, x);
    const progress = (state.max - state.min) / PACK_W;
    if (progress - state.lastTick >= 0.08) { state.lastTick = progress; sfx.tick(); }
    setCut({ from: state.min, to: state.max, at: x });
    if (progress >= CUT_DONE) completeCut();
  };

  const onPackPointerUp = () => {
    if (cutRef.current) { cutRef.current = null; setCut(null); }
  };

  const autoCut = async () => {
    if (stage !== 'table') return;
    for (let x = 0; x <= PACK_W; x += 26) {
      setCut({ from: 0, to: x, at: x }); sfx.tick();
      await wait(45);
    }
    completeCut();
  };

  // ─── Revelado: deslizar cartas ───
  const advance = useCallback(() => {
    if (index + 1 >= cards.length) setStage('summary');
    else { setIndex(index + 1); setOffset({ x: 0, y: 0 }); setLeaving(null); }
  }, [index, cards.length]);

  const flip = useCallback(() => {
    if (!current) return;
    setFlipped((prev) => new Set(prev).add(index));
    sfx.flip();
    window.setTimeout(() => { sfx.chime(current.card.rarity); setBurst((b) => b + 1); }, 320);
  }, [current, index]);

  const throwCard = useCallback((dx: number, dy: number) => {
    if (leaving) return;
    const len = Math.hypot(dx, dy) || 1;
    setLeaving({ x: (dx / len) * 900, y: (dy / len) * 900 });
    sfx.swish();
    window.setTimeout(advance, 280);
  }, [leaving, advance]);

  const onCardPointerDown = (e: React.PointerEvent) => {
    if (leaving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setDragging(true);
  };

  const onCardPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || needsFlip) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };

  const onCardPointerUp = (e: React.PointerEvent) => {
    const start = drag.current;
    drag.current = null;
    setDragging(false);
    if (!start) return;
    const dx = e.clientX - start.x; const dy = e.clientY - start.y;
    const dist = Math.hypot(dx, dy);
    const speed = dist / Math.max(1, performance.now() - start.t);
    if (dist < 8) { needsFlip ? flip() : throwCard(-1, -0.25); return; }
    if (needsFlip) return;
    if (dist > 110 || (dist > 35 && speed > 0.6)) throwCard(dx, dy);
    else setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (stage !== 'reveal') return;
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', ' ', 'Enter'].includes(e.key)) return;
      e.preventDefault();
      if (needsFlip) flip();
      else throwCard(e.key === 'ArrowRight' ? 1 : -1, -0.2);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, needsFlip, flip, throwCard]);

  if (!isOpen) return null;

  const canAfford = (cost: number) => infiniteCoins || trainerCoins >= cost;

  const sealedByType = catalog
    .map((item) => ({ item, packs: sealed.filter((p) => p.packType === item.id) }))
    .filter((g) => g.packs.length > 0);
  const nextSealed = sealed.find((p) => p.id !== active?.id);
  const cutProgress = cut ? (cut.to - cut.from) / PACK_W : 0;

  const subtitle: Record<Stage, string> = {
    shop: 'Compra sobres sellados y ábrelos cuando quieras.',
    table: 'Desliza el dedo por la parte superior para cortar el sobre.',
    ripping: '¡El aluminio cede!',
    reveal: needsFlip ? 'Algo brilla… toca la carta para darle la vuelta.' : 'Desliza la carta hacia cualquier lado para ver la siguiente.',
    summary: 'Todas las cartas ya están en tu colección.',
  };

  const cardTransform = leaving
    ? `translate(${leaving.x}px, ${leaving.y}px) rotate(${leaving.x * 0.04}deg)`
    : `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x * 0.05}deg)`;

  return (
    <div className={inline ? '' : 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#030712]/95 p-3 backdrop-blur-md'}>
      <div className={'w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020] shadow-2xl ' + (inline ? '' : 'my-3 max-w-5xl')}>
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/25 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-amber-300"><Sparkles className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h2 className="font-black text-white">Mesa de apertura</h2>
              <p className="truncate text-xs text-slate-400">{subtitle[stage]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-black text-amber-300"><Coins className="h-4 w-4" />{infiniteCoins ? '∞' : trainerCoins}</span>
            {(stage === 'table' || stage === 'summary') && (
              <button onClick={backToShop} className="hidden rounded-lg px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 sm:block">Tienda</button>
            )}
            {!inline && <button aria-label="Cerrar" onClick={() => { backToShop(); onClose(); }} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>}
          </div>
        </header>

        {error && <p role="alert" className="mx-5 mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200 sm:mx-7">{error}</p>}

        <main className="booster-table flex min-h-[600px] items-center justify-center overflow-hidden p-4 sm:p-8">
          {/* ─── TIENDA ─── */}
          {stage === 'shop' && (
            <div className="w-full space-y-8">
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
                {catalog.map((item) => (
                  <article key={item.id} className="flex flex-col rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-xl">
                    <div className="pack-mini mx-auto"><PackArt item={item} /></div>
                    <h3 className="mt-4 font-black text-white">{item.name}</h3>
                    <p className="mt-1 min-h-10 text-xs leading-relaxed text-slate-400">{item.description}</p>
                    <p className="mt-2 text-[11px] font-bold text-amber-200/80">
                      <Crown className="mr-1 inline h-3.5 w-3.5" />
                      Legendaria garantizada en {item.packsUntilPity} {item.packsUntilPity === 1 ? 'sobre' : 'sobres'} como máximo
                    </p>
                    <button onClick={() => setOddsOpen(oddsOpen === item.id ? null : item.id)} className="mt-2 flex items-center gap-1 self-start text-[11px] font-bold text-sky-300 hover:text-sky-200" aria-expanded={oddsOpen === item.id}>
                      Probabilidades <ChevronDown className={'h-3.5 w-3.5 transition-transform ' + (oddsOpen === item.id ? 'rotate-180' : '')} />
                    </button>
                    {oddsOpen === item.id && (
                      <dl className="mt-2 space-y-1.5 rounded-xl border border-white/10 bg-black/30 p-3 text-[11px]">
                        {item.slots.map((slot) => (
                          <div key={slot.slotType}>
                            <dt className="font-bold text-slate-300">{slot.count}× {SLOT_LABELS[slot.slotType]}{slot.slotType === 'REVERSE_HOLO_HIT' ? ' (alta)' : ''}</dt>
                            <dd className="text-slate-400">
                              {Object.entries(slot.odds).map(([rarity, pct]) => `${rarityBadges[rarity as CardRarity].label} ${pct}%`).join(' · ')}
                            </dd>
                          </div>
                        ))}
                        <div className="border-t border-white/10 pt-1.5 text-amber-200">God Pack (10 cartas Épica+): {item.godPackChance}%</div>
                      </dl>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <span className="flex items-center gap-1 text-sm font-black text-amber-300"><Coins className="h-4 w-4" />{item.cost}</span>
                      <div className="flex gap-2">
                        <button disabled={!!busy || !canAfford(item.cost * 5)} onClick={() => buy(item, 5, false)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-40">{busy === item.id + 5 ? '…' : '×5'}</button>
                        <button disabled={!!busy || !canAfford(item.cost)} onClick={() => buy(item, 1, true)} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-500 disabled:bg-slate-700">{busy === item.id + 1 ? 'Comprando…' : 'Comprar y abrir'}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <section aria-label="Sobres sellados">
                <h3 className="flex items-center gap-2 text-sm font-black text-white"><Package className="h-4 w-4 text-amber-300" />Tus sobres sellados ({sealed.length})</h3>
                {sealedByType.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">No tienes sobres sin abrir. Compra unos cuantos con ×5 y ábrelos con calma.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {sealedByType.map(({ item, packs }) => (
                      <button key={item.id} onClick={() => placeOnTable(packs[0])} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-2 pr-4 text-left hover:border-amber-300/40">
                        <div className="pack-thumb"><PackArt item={item} /></div>
                        <div>
                          <p className="text-xs font-black text-white">{item.name}</p>
                          <p className="text-[11px] text-slate-400">×{packs.length} · Toca para abrir</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ─── MESA: CORTAR EL SOBRE ─── */}
          {(stage === 'table' || stage === 'ripping') && activeItem && (
            <section className="flex flex-col items-center text-center">
              <div className="pack-stage" style={{ perspective: '1100px' }}>
                {stage === 'ripping' && (
                  <div className="emerging-cards" aria-hidden>
                    <CardBack className="stack-depth-2" /><CardBack className="stack-depth-1" /><CardBack />
                  </div>
                )}
                <div
                  ref={packRef}
                  role="button"
                  tabIndex={0}
                  aria-label="Sobre sellado. Pulsa Enter para abrirlo."
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autoCut(); } }}
                  onPointerDown={onPackPointerDown}
                  onPointerMove={onPackPointerMove}
                  onPointerUp={onPackPointerUp}
                  onPointerCancel={onPackPointerUp}
                  onPointerLeave={() => !cutRef.current && setTilt({ x: 0, y: 0 })}
                  className={'table-pack ' + (stage === 'ripping' ? 'is-ripping' : '') + (cut ? ' is-cutting' : '')}
                  style={{
                    width: PACK_W, height: PACK_H,
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    '--mx': `${50 + tilt.y * 2.5}%`, '--my': `${50 - tilt.x * 3}%`,
                  } as React.CSSProperties}
                >
                  <div className="pack-piece pack-top" style={{ clipPath: TOP_CLIP }}><PackArt item={activeItem} /></div>
                  <div className="pack-piece pack-body" style={{ clipPath: BODY_CLIP }}><PackArt item={activeItem} /></div>
                  {stage === 'table' && (
                    <>
                      <i className="cut-guide" style={{ top: CUT_Y }} />
                      {cut ? (
                        <>
                          <i className="cut-line" style={{ top: CUT_Y - 1, left: cut.from, width: cut.to - cut.from }} />
                          <i className="cut-spark" style={{ top: CUT_Y, left: cut.at }} />
                        </>
                      ) : (
                        <span className="cut-hint" style={{ top: CUT_Y - 14 }}><Hand className="h-5 w-5" /></span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {stage === 'table' && (
                <>
                  <div className="mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-white/10" aria-hidden>
                    <div className="h-full bg-amber-300 transition-[width] duration-75" style={{ width: Math.min(100, (cutProgress / CUT_DONE) * 100) + '%' }} />
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-400">
                    {cut ? 'Sigue, de lado a lado sin soltar…' : 'Arrastra a lo largo de la línea discontinua'}
                  </p>
                  <button onClick={autoCut} className="mt-2 text-[11px] font-bold text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">Abrir sin deslizar</button>
                </>
              )}
            </section>
          )}

          {/* ─── REVELADO: MAZO EN LA MANO ─── */}
          {stage === 'reveal' && result && current && (
            <section className="flex w-full max-w-xl flex-col items-center text-center">
              <div className="flex w-full items-center justify-between text-xs font-black text-slate-300">
                <span className="flex gap-1.5"><Layers className="h-4 w-4 text-amber-300" />CARTA {index + 1} / {cards.length}</span>
                <button onClick={() => setStage('summary')} className="text-slate-500 hover:text-white">Ver todas →</button>
              </div>
              <div className="mt-2 flex gap-1" aria-hidden>
                {cards.map((c, i) => (
                  <i key={i} className={'h-1.5 rounded-full ' + (i < index ? 'w-1.5 ' + (c.hit ? 'bg-amber-300' : 'bg-emerald-400') : i === index ? 'w-7 bg-amber-300' : 'w-1.5 bg-white/15')} />
                ))}
              </div>
              {result.godPack && index === 0 && <p className="god-pack-banner mt-3">✦ ¡GOD PACK! Todas las cartas son especiales ✦</p>}

              <div className="reveal-stage mt-4">
                {burst > 0 && flipped.has(index) && (
                  <div key={burst} className={'reveal-burst ' + auraFor(current.card.rarity)} aria-hidden><i /><i /><i /></div>
                )}
                {/* Cartas que quedan debajo en el mazo */}
                {cards.length - index > 2 && <CardBack className="stack-under stack-depth-2" />}
                {cards.length - index > 1 && <CardBack className="stack-under stack-depth-1" />}

                <div
                  key={index}
                  className={'swipe-card ' + (dragging && !needsFlip ? 'is-dragging ' : '') + (leaving ? 'is-leaving ' : '') + (needsFlip ? 'is-facedown ' + auraFor(current.card.rarity) : '')}
                  style={{ transform: cardTransform }}
                  onPointerDown={onCardPointerDown}
                  onPointerMove={onCardPointerMove}
                  onPointerUp={onCardPointerUp}
                  onPointerCancel={() => { drag.current = null; setDragging(false); setOffset({ x: 0, y: 0 }); }}
                  role="button"
                  tabIndex={0}
                  aria-label={needsFlip ? 'Carta boca abajo. Pulsa para darle la vuelta.' : `${current.card.name}. Pulsa para ver la siguiente.`}
                >
                  <div className={'flip-inner ' + (current.hit && !needsFlip ? 'is-flipped' : '') + (current.hit ? '' : ' no-flip')}>
                    <div className="flip-face flip-front">
                      <PokemonCardView card={current.card} aspect={getCardAspect(current.card)} />
                    </div>
                    {current.hit && <div className="flip-face flip-back"><CardBack /></div>}
                  </div>
                  {!needsFlip && (
                    <div className="card-tags">
                      {current.isNew && <span className="tag-new">NUEVA</span>}
                      {current.slotType !== 'COMMON' && current.slotType !== 'UNCOMMON' && <span className="tag-slot">{SLOT_LABELS[current.slotType]}</span>}
                    </div>
                  )}
                </div>
              </div>

              <p className={'mt-5 flex items-center gap-1 text-xs font-black ' + (current.hit && !needsFlip ? 'text-amber-300' : 'text-slate-400')}>
                {needsFlip ? <>Toca la carta para darle la vuelta</> : current.hit ? <><Crown className="h-4 w-4" /> {rarityBadges[current.card.rarity].label}</> : <>Desliza o pulsa → para continuar</>}
              </p>
              {result.pityTriggered && index === cards.length - 1 && !needsFlip && (
                <p className="mt-1 text-[11px] font-bold text-amber-200/80">Garantía de Legendaria activada en este sobre.</p>
              )}
            </section>
          )}

          {/* ─── RESUMEN ─── */}
          {stage === 'summary' && result && (
            <section className="w-full">
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex gap-2 font-black text-white"><ShieldCheck className="h-5 w-5 text-emerald-300" />{result.godPack ? '¡GOD PACK abierto!' : result.packName}</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    {cards.length} cartas · {cards.filter((c) => c.isNew).length} nuevas en tu colección · {cards.filter((c) => c.hit).length} especiales
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Legendaria garantizada en {result.packsUntilPity} {result.packsUntilPity === 1 ? 'sobre' : 'sobres'} como máximo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nextSealed && (
                    <button onClick={() => placeOnTable(nextSealed)} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white hover:bg-red-500">
                      <Package className="h-4 w-4" />Abrir siguiente ({sealed.length})
                    </button>
                  )}
                  <button onClick={backToShop} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-black text-white hover:bg-white/10">
                    <RotateCcw className="h-4 w-4" />Volver a la tienda
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {cards.map((c) => (
                  <div key={c.card.id} className={'relative ' + (c.hit ? 'summary-hit ' + auraFor(c.card.rarity) : '')}>
                    {c.isNew && <span className="tag-new absolute -top-2 left-2 z-20">NUEVA</span>}
                    <PokemonCardView compact card={c.card} aspect={getCardAspect(c.card)} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
