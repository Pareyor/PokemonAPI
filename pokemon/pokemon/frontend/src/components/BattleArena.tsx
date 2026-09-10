import React, { useState } from 'react';
import { PokemonCard, BattleOpponent, PokemonType } from '../types';
import { Swords, Zap, Heart, Trophy, RotateCcw, AlertTriangle, ArrowRight, Flame } from 'lucide-react';

interface BattleArenaProps {
  deckCards: PokemonCard[];
  opponents: BattleOpponent[];
  onBattleEnd: (opponentName: string, won: boolean, coins: number, log: string) => Promise<void>;
  onSwitchToAlbum: () => void;
}

// Elemental effectiveness map: Attacker Type -> Defender Type -> Multiplier
const EFFECTIVENESS: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  FIRE: { GRASS: 1.5, STEEL: 1.5, WATER: 0.7, FIRE: 0.7, DRAGON: 0.7 },
  WATER: { FIRE: 1.5, FIGHTING: 1.2, GRASS: 0.7, WATER: 0.7, DRAGON: 0.7 },
  GRASS: { WATER: 1.5, FIGHTING: 1.2, FIRE: 0.7, GRASS: 0.7, DRAGON: 0.7, STEEL: 0.7 },
  ELECTRIC: { WATER: 1.5, ELECTRIC: 0.7, GRASS: 0.7, DRAGON: 0.7 },
  FIGHTING: { NORMAL: 1.5, DARK: 1.5, STEEL: 1.5, PSYCHIC: 0.7 },
  PSYCHIC: { FIGHTING: 1.5, DARK: 0.6, PSYCHIC: 0.7, STEEL: 0.7 },
  DARK: { PSYCHIC: 1.5, DARK: 0.7, FIGHTING: 0.7 },
  DRAGON: { DRAGON: 1.5, STEEL: 0.7 },
};

export const BattleArena: React.FC<BattleArenaProps> = ({
  deckCards,
  opponents,
  onBattleEnd,
  onSwitchToAlbum,
}) => {
  // Opponent Selection
  const [selectedOpponent, setSelectedOpponent] = useState<BattleOpponent | null>(opponents[0] || null);

  // Active Battle State
  const [inBattle, setInBattle] = useState(false);
  const [playerActiveCard, setPlayerActiveCard] = useState<PokemonCard | null>(null);
  const [playerCurrentHp, setPlayerCurrentHp] = useState<number>(100);
  const [opponentCardIndex, setOpponentCardIndex] = useState<number>(0);
  const [opponentCurrentHp, setOpponentCurrentHp] = useState<number>(100);

  // Battle Animation & Logs
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isTurnProcessing, setIsTurnProcessing] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [damagePopup, setDamagePopup] = useState<{ text: string; isPlayer: boolean } | null>(null);

  const activeOpponentCard = selectedOpponent?.team[opponentCardIndex] || null;

  const startBattle = (card: PokemonCard) => {
    if (!selectedOpponent) return;
    setPlayerActiveCard(card);
    setPlayerCurrentHp(card.hp);
    setOpponentCardIndex(0);
    setOpponentCurrentHp(selectedOpponent.team[0].hp);
    setBattleLogs([
      `¡Comienza el combate contra ${selectedOpponent.name}!`,
      `Envías a ${card.name} al campo de batalla.`,
      `${selectedOpponent.name} envía a ${selectedOpponent.team[0].name}.`
    ]);
    setBattleEnded(false);
    setPlayerWon(false);
    setInBattle(true);
  };

  const getMultiplier = (atkType: PokemonType, defType: PokemonType): number => {
    return EFFECTIVENESS[atkType]?.[defType] || 1.0;
  };

  const executeAttack = async (isMove2: boolean) => {
    if (!playerActiveCard || !activeOpponentCard || isTurnProcessing || battleEnded) return;

    setIsTurnProcessing(true);
    const moveName = isMove2 ? playerActiveCard.move2Name : playerActiveCard.move1Name;
    const baseDamage = isMove2 ? playerActiveCard.move2Damage : playerActiveCard.move1Damage;

    // 1. Calculate player damage to opponent
    const multiplier = getMultiplier(playerActiveCard.type, activeOpponentCard.type);
    const rawDamage = Math.round(
      ((playerActiveCard.attack * 0.4 + baseDamage) / (activeOpponentCard.defense * 0.2 + 10)) * 20 * multiplier
    );
    const playerDamage = Math.max(15, rawDamage);

    let multMsg = '';
    if (multiplier > 1.2) multMsg = ' ¡Es súper eficaz! 💥';
    if (multiplier < 0.9) multMsg = ' No es muy eficaz... 🛡️';

    setDamagePopup({ text: `-${playerDamage}${multMsg}`, isPlayer: false });
    const newOppHp = Math.max(0, opponentCurrentHp - playerDamage);
    setOpponentCurrentHp(newOppHp);

    const logEntry = `¡${playerActiveCard.name} usó ${moveName}! Causa ${playerDamage} de daño.${multMsg}`;
    setBattleLogs((prev) => [logEntry, ...prev]);

    // Check if opponent card fainted
    if (newOppHp === 0) {
      if (selectedOpponent && opponentCardIndex < selectedOpponent.team.length - 1) {
        // Opponent sends next Pokémon
        const nextIdx = opponentCardIndex + 1;
        const nextCard = selectedOpponent.team[nextIdx];
        setTimeout(() => {
          setOpponentCardIndex(nextIdx);
          setOpponentCurrentHp(nextCard.hp);
          setBattleLogs((prev) => [
            `¡${activeOpponentCard.name} se ha debilitado!`,
            `${selectedOpponent.name} envía a ${nextCard.name}.`,
            ...prev,
          ]);
          setIsTurnProcessing(false);
        }, 1200);
        return;
      } else {
        // Opponent has no more Pokémon: Player Wins!
        setTimeout(async () => {
          setBattleEnded(true);
          setPlayerWon(true);
          setBattleLogs((prev) => [`🏆 ¡Has derrotado a ${selectedOpponent?.name}!`, ...prev]);
          if (selectedOpponent) {
            await onBattleEnd(
              selectedOpponent.name,
              true,
              selectedOpponent.rewardCoins,
              `Victoria contra ${selectedOpponent.name} con ${playerActiveCard.name}`
            );
          }
          setIsTurnProcessing(false);
        }, 1000);
        return;
      }
    }

    // 2. Opponent counter-attacks after small delay
    setTimeout(() => {
      const oppUsesMove2 = Math.random() > 0.5;
      const oppMoveName = oppUsesMove2 ? activeOpponentCard.move2Name : activeOpponentCard.move1Name;
      const oppBaseDmg = oppUsesMove2 ? activeOpponentCard.move2Damage : activeOpponentCard.move1Damage;

      const oppMult = getMultiplier(activeOpponentCard.type, playerActiveCard.type);
      const oppRawDmg = Math.round(
        ((activeOpponentCard.attack * 0.4 + oppBaseDmg) / (playerActiveCard.defense * 0.2 + 10)) * 20 * oppMult
      );
      const oppDamage = Math.max(12, oppRawDmg);

      let oppMultMsg = '';
      if (oppMult > 1.2) oppMultMsg = ' ¡Es súper eficaz contra ti!';
      if (oppMult < 0.9) oppMultMsg = ' No es muy eficaz contra ti.';

      setDamagePopup({ text: `-${oppDamage}${oppMultMsg}`, isPlayer: true });
      const newPlayerHp = Math.max(0, playerCurrentHp - oppDamage);
      setPlayerCurrentHp(newPlayerHp);

      const oppLog = `¡${activeOpponentCard.name} rival usó ${oppMoveName}! Te causa ${oppDamage} de daño.${oppMultMsg}`;
      setBattleLogs((prev) => [oppLog, ...prev]);

      if (newPlayerHp === 0) {
        // Player card fainted
        setTimeout(async () => {
          setBattleEnded(true);
          setPlayerWon(false);
          setBattleLogs((prev) => [`💀 ¡Tu ${playerActiveCard.name} se ha debilitado! Has sido derrotado.`, ...prev]);
          if (selectedOpponent) {
            await onBattleEnd(selectedOpponent.name, false, 0, `Derrota frente a ${selectedOpponent.name}`);
          }
          setIsTurnProcessing(false);
        }, 1000);
      } else {
        setIsTurnProcessing(false);
      }
    }, 1000);
  };

  // If user has no deck cards
  if (deckCards.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white">Tu Mazo de Combate está Vacío</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para entrar a la Arena de Combate necesitas al menos 1 carta asignada a tu mazo de combate (máximo 5).
        </p>
        <button
          onClick={onSwitchToAlbum}
          className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 transition-colors inline-flex items-center gap-2 shadow-lg shadow-rose-600/30"
        >
          <span>Ir a mi Álbum y Asignar Mazo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!inBattle ? (
        /* Pre-Battle: Select Opponent & Choose Active Card */
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <Swords className="w-6 h-6 text-amber-400" />
              Arena de Combates Pokémon
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona un entrenador rival y escoge a tu Pokémon de cabecera de tu mazo para iniciar el duelo.
            </p>
          </div>

          {/* Opponent Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {opponents.map((opp) => {
              const isSelected = selectedOpponent?.id === opp.id;

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpponent(opp)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={opp.avatarUrl}
                      alt={opp.name}
                      className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{opp.name}</h4>
                      <span className="text-[10px] font-bold text-indigo-300">{opp.difficulty}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">{opp.title}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
                    <span className="text-[11px] text-slate-400">Equipo: {opp.team.length} Pokémon</span>
                    <span className="font-bold text-amber-400">+{opp.rewardCoins} 🪙</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Choose Active Card From Deck */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Selecciona tu Pokémon para entrar al Combate ({deckCards.length} en mazo):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {deckCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => startBattle(card)}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/60 cursor-pointer transition-all hover:scale-105 group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-black text-white group-hover:text-rose-400 transition-colors">
                      {card.name}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-0.5">
                      <Heart className="w-3 h-3 fill-rose-500" /> {card.hp}
                    </span>
                  </div>
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-24 object-contain my-1 group-hover:scale-110 transition-transform"
                  />
                  <div className="text-[10px] text-center text-indigo-300 font-bold bg-indigo-950/60 py-1 rounded-md mt-2">
                    ⚔️ Iniciar con {card.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* In-Battle Interactive Arena View */
        <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Battlefield: Opponent Side */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800 gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={selectedOpponent?.avatarUrl}
                alt="Trainer"
                className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-slate-700"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">Rival</span>
                <h4 className="text-sm font-black text-white">{selectedOpponent?.name}</h4>
                <div className="flex gap-1 mt-1">
                  {selectedOpponent?.team.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < opponentCardIndex
                          ? 'bg-slate-700'
                          : i === opponentCardIndex
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Active Opponent Pokémon Stats & HP */}
            {activeOpponentCard && (
              <div className="w-full sm:w-64 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">{activeOpponentCard.name}</span>
                  <span className="font-mono text-[11px] font-bold text-rose-400">
                    {opponentCurrentHp} / {activeOpponentCard.hp} HP
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      (opponentCurrentHp / activeOpponentCard.hp) > 0.5
                        ? 'bg-emerald-400'
                        : (opponentCurrentHp / activeOpponentCard.hp) > 0.2
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${(opponentCurrentHp / activeOpponentCard.hp) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Central Combat Arena: Opponent & Player Pokémon Sprites */}
          <div className="py-6 px-4 flex flex-col md:flex-row items-center justify-around gap-6 relative min-h-[220px]">
            {/* Player Pokémon Sprite */}
            {playerActiveCard && (
              <div className="flex flex-col items-center space-y-2 animate-float">
                <img
                  src={playerActiveCard.imageUrl}
                  alt={playerActiveCard.name}
                  className="w-36 h-36 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                />
                <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                  {playerActiveCard.name} (Nv.{playerActiveCard.level})
                </span>
              </div>
            )}

            {/* VS Emblem & Damage Notification */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-xl shadow-rose-600/30">
                VS
              </div>
              {damagePopup && (
                <div className="mt-2 text-xs font-extrabold px-3 py-1 rounded-lg bg-black/80 text-amber-300 border border-amber-500/40 animate-bounce">
                  {damagePopup.text}
                </div>
              )}
            </div>

            {/* Opponent Pokémon Sprite */}
            {activeOpponentCard && (
              <div className="flex flex-col items-center space-y-2 animate-float">
                <img
                  src={activeOpponentCard.imageUrl}
                  alt={activeOpponentCard.name}
                  className="w-36 h-36 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                />
                <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                  {activeOpponentCard.name} (Rival)
                </span>
              </div>
            )}
          </div>

          {/* Bottom Battlefield: Player HP Bar & Power Moves Controls */}
          {playerActiveCard && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              {/* Player HP Bar */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-400">
                  {playerActiveCard.name} — Salud:
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {playerCurrentHp} / {playerActiveCard.hp} HP
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    (playerCurrentHp / playerActiveCard.hp) > 0.5
                      ? 'bg-emerald-400'
                      : (playerCurrentHp / playerActiveCard.hp) > 0.2
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${(playerCurrentHp / playerActiveCard.hp) * 100}%` }}
                />
              </div>

              {/* Move Attack Buttons (If battle is not finished) */}
              {!battleEnded ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => executeAttack(false)}
                    disabled={isTurnProcessing}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all disabled:opacity-50 group hover:border-slate-500"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-white">{playerActiveCard.move1Name}</span>
                      <span className="text-xs font-bold text-rose-400">{playerActiveCard.move1Damage} DMG</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Ataque Rápido Básico</p>
                  </button>

                  <button
                    onClick={() => executeAttack(true)}
                    disabled={isTurnProcessing}
                    className="p-3 rounded-xl bg-gradient-to-r from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 border border-indigo-500/50 text-left transition-all disabled:opacity-50 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-indigo-200">{playerActiveCard.move2Name}</span>
                      </div>
                      <span className="text-xs font-black text-amber-400">{playerActiveCard.move2Damage} DMG</span>
                    </div>
                    <p className="text-[10px] text-amber-300 font-semibold">
                      Poder Especial: {playerActiveCard.move2SpecialEffect || 'Daño Crítico'}
                    </p>
                  </button>
                </div>
              ) : (
                /* Victory / Defeat Finish Screen */
                <div className="p-4 rounded-xl bg-slate-900 text-center space-y-3">
                  <div className="text-base font-black text-white flex items-center justify-center gap-2">
                    {playerWon ? (
                      <>
                        <Trophy className="w-6 h-6 text-amber-400" />
                        <span>¡VICTORIA! Has ganado el combate</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-6 h-6 text-rose-400" />
                        <span>DERROTA. ¡Tu Pokémon ha caído!</span>
                      </>
                    )}
                  </div>
                  {playerWon && selectedOpponent && (
                    <p className="text-xs font-bold text-amber-300">
                      Recompensa obtenida: +{selectedOpponent.rewardCoins} PokéMonedas
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setInBattle(false)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-colors"
                    >
                      Elegir Otro Rival
                    </button>
                    <button
                      onClick={() => playerActiveCard && startBattle(playerActiveCard)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revancha</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Battle Event Ticker Log */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registro de Turnos</span>
            <div className="max-h-24 overflow-y-auto space-y-1 text-slate-300 font-mono text-[11px] pr-1">
              {battleLogs.slice(0, 5).map((log, i) => (
                <p key={i} className="leading-snug">{log}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
