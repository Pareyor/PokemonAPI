import React, { useState, useEffect } from 'react';
import { PokemonCard, BattleOpponent, PokemonType, CardRarity } from '../types';
import { Swords, Zap, Heart, Trophy, RotateCcw, AlertTriangle, Shield, ArrowUpDown, PersonStanding, Sparkles, Check, BookOpen } from 'lucide-react';

interface BattleArenaProps {
  deckCards: PokemonCard[];
  allCards?: PokemonCard[];
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

// Full 6-Pokémon teams for Gym Leaders / Champions
const EXPANDED_OPPONENT_TEAMS: Record<string, { id: number; name: string; type: PokemonType; rarity: CardRarity; hp: number; atk: number; def: number; spd: number; m1: string; d1: number; m2: string; d2: number; eff: string }[]> = {
  brock: [
    { id: 74, name: 'Geodude', type: 'FIGHTING', rarity: 'COMMON', hp: 110, atk: 70, def: 90, spd: 40, m1: 'Lanzarrocas', d1: 40, m2: 'Magnitud', d2: 70, eff: 'CRITICAL' },
    { id: 95, name: 'Onix', type: 'FIGHTING', rarity: 'UNCOMMON', hp: 140, atk: 80, def: 120, spd: 50, m1: 'Atadura', d1: 45, m2: 'Avalancha Rocosa', d2: 85, eff: 'PARALYZE' },
    { id: 111, name: 'Rhyhorn', type: 'FIGHTING', rarity: 'COMMON', hp: 135, atk: 85, def: 95, spd: 45, m1: 'Cornada', d1: 45, m2: 'Pisotón', d2: 80, eff: 'CRITICAL' },
    { id: 141, name: 'Kabutops', type: 'WATER', rarity: 'RARE', hp: 150, atk: 115, def: 105, spd: 80, m1: 'Megaagotar', d1: 50, m2: 'Cuchillada Fósil', d2: 100, eff: 'CRITICAL' },
    { id: 142, name: 'Aerodactyl', type: 'NORMAL', rarity: 'EPIC', hp: 160, atk: 120, def: 75, spd: 130, m1: 'Mordisco', d1: 55, m2: 'Hiperrayo Prehistórico', d2: 125, eff: 'CRITICAL' },
    { id: 76, name: 'Golem', type: 'FIGHTING', rarity: 'RARE', hp: 170, atk: 120, def: 130, spd: 45, m1: 'Desenrollar', d1: 55, m2: 'Terremoto Sísmico', d2: 130, eff: 'CRITICAL' },
  ],
  blaine: [
    { id: 38, name: 'Ninetales', type: 'FIRE', rarity: 'RARE', hp: 145, atk: 90, def: 85, spd: 100, m1: 'Giro Fuego', d1: 45, m2: 'Llamarada Mística', d2: 95, eff: 'BURN' },
    { id: 78, name: 'Rapidash', type: 'FIRE', rarity: 'UNCOMMON', hp: 135, atk: 100, def: 75, spd: 115, m1: 'Ascuas', d1: 50, m2: 'Rueda Fuego', d2: 90, eff: 'BURN' },
    { id: 136, name: 'Flareon', type: 'FIRE', rarity: 'RARE', hp: 140, atk: 130, def: 65, spd: 70, m1: 'Nitocarga', d1: 50, m2: 'Envite Ígneo', d2: 115, eff: 'BURN' },
    { id: 126, name: 'Magmar', type: 'FIRE', rarity: 'RARE', hp: 155, atk: 115, def: 70, spd: 90, m1: 'Puño Fuego', d1: 55, m2: 'Lanzallamas Voraz', d2: 110, eff: 'BURN' },
    { id: 59, name: 'Arcanine', type: 'FIRE', rarity: 'RARE', hp: 170, atk: 125, def: 85, spd: 95, m1: 'Colmillo Ígneo', d1: 60, m2: 'Velocidad Extrema', d2: 120, eff: 'CRITICAL' },
    { id: 6, name: 'Charizard', type: 'FIRE', rarity: 'EPIC', hp: 185, atk: 135, def: 85, spd: 105, m1: 'Garra Dragón', d1: 65, m2: 'Llamarada Cataclísmica', d2: 140, eff: 'BURN' },
  ],
  blue: [
    { id: 18, name: 'Pidgeot', type: 'NORMAL', rarity: 'RARE', hp: 155, atk: 100, def: 85, spd: 110, m1: 'Ataque Rápido', d1: 50, m2: 'Vendaval Huracanado', d2: 100, eff: 'CRITICAL' },
    { id: 65, name: 'Alakazam', type: 'PSYCHIC', rarity: 'RARE', hp: 135, atk: 145, def: 60, spd: 125, m1: 'Confusión', d1: 60, m2: 'Psíquico Supremo', d2: 125, eff: 'PARALYZE' },
    { id: 112, name: 'Rhydon', type: 'FIGHTING', rarity: 'RARE', hp: 175, atk: 130, def: 120, spd: 40, m1: 'Perforador', d1: 55, m2: 'Terremoto Destructor', d2: 120, eff: 'CRITICAL' },
    { id: 103, name: 'Exeggutor', type: 'GRASS', rarity: 'RARE', hp: 165, atk: 125, def: 85, spd: 55, m1: 'Bomba Huevo', d1: 55, m2: 'Rayo Solar', d2: 130, eff: 'CRITICAL' },
    { id: 130, name: 'Gyarados', type: 'WATER', rarity: 'EPIC', hp: 180, atk: 140, def: 90, spd: 85, m1: 'Cascada', d1: 65, m2: 'Furia Dragón', d2: 135, eff: 'CRITICAL' },
    { id: 9, name: 'Blastoise', type: 'WATER', rarity: 'EPIC', hp: 195, atk: 120, def: 130, spd: 80, m1: 'Pistola Agua', d1: 60, m2: 'Hidrobomba Titánica', d2: 145, eff: 'CRITICAL' },
  ],
  cynthia: [
    { id: 442, name: 'Spiritomb', type: 'DARK', rarity: 'RARE', hp: 160, atk: 110, def: 125, spd: 50, m1: 'Viento Aciago', d1: 60, m2: 'Pulso Sombrío', d2: 115, eff: 'PARALYZE' },
    { id: 407, name: 'Roserade', type: 'GRASS', rarity: 'RARE', hp: 145, atk: 125, def: 75, spd: 95, m1: 'Hoja Afilada', d1: 55, m2: 'Bomba Lodo', d2: 110, eff: 'POISON' },
    { id: 468, name: 'Togekiss', type: 'NORMAL', rarity: 'RARE', hp: 165, atk: 120, def: 115, spd: 80, m1: 'Tajo Aéreo', d1: 60, m2: 'Esfera Aural', d2: 120, eff: 'CRITICAL' },
    { id: 350, name: 'Milotic', type: 'WATER', rarity: 'EPIC', hp: 185, atk: 110, def: 125, spd: 85, m1: 'Surf', d1: 65, m2: 'Hidropulso Glacial', d2: 130, eff: 'FREEZE' },
    { id: 448, name: 'Lucario', type: 'FIGHTING', rarity: 'EPIC', hp: 175, atk: 140, def: 85, spd: 115, m1: 'Puño Incremento', d1: 65, m2: 'Esfera Aural Devastadora', d2: 140, eff: 'CRITICAL' },
    { id: 445, name: 'Garchomp', type: 'DRAGON', rarity: 'LEGENDARY', hp: 220, atk: 165, def: 110, spd: 120, m1: 'Garra Dragón', d1: 80, m2: 'Carga Dragón Catastrófica', d2: 170, eff: 'CRITICAL' },
  ],
};

// Web Audio sound effects for attacks, hits, dodge, faint
const playBattleAudio = (type: 'attack' | 'hit' | 'superEffective' | 'faint' | 'dodge' | 'summon') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (type === 'attack') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'hit') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } else if (type === 'superEffective') {
      [440, 554, 659, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } else if (type === 'faint') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } else if (type === 'dodge') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'summon') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {}
};

export const BattleArena: React.FC<BattleArenaProps> = ({
  deckCards,
  allCards = [],
  opponents,
  onBattleEnd,
  onSwitchToAlbum,
}) => {
  // Available pool of cards: all owned cards, fallback to deckCards
  const availableCards = allCards.length > 0 ? allCards : deckCards;

  // Selected Opponent
  const [selectedOpponent, setSelectedOpponent] = useState<BattleOpponent | null>(opponents[0] || null);

  // PRE-BATTLE: User's 6 selected Pokémon
  const [playerTeam, setPlayerTeam] = useState<PokemonCard[]>([]);

  // BATTLE STATE
  const [inBattle, setInBattle] = useState(false);
  const [playerActiveIndex, setPlayerActiveIndex] = useState(0);
  const [playerHps, setPlayerHps] = useState<number[]>([]);
  const [opponentActiveIndex, setOpponentActiveIndex] = useState(0);
  const [opponentHps, setOpponentHps] = useState<number[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<PokemonCard[]>([]);

  // Energy / Special Charge Meter (0 to 100)
  const [chargeEnergy, setChargeEnergy] = useState(0);

  // Dodging state (lasts 1.5s)
  const [isDodging, setIsDodging] = useState(false);

  // Animations & VFX
  const [playerAnim, setPlayerAnim] = useState<string>('');
  const [opponentAnim, setOpponentAnim] = useState<string>('');
  const [damagePopup, setDamagePopup] = useState<{ text: string; isPlayer: boolean } | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isTurnProcessing, setIsTurnProcessing] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [battleTimer, setBattleTimer] = useState(99);
  const [showSwapDrawer, setShowSwapDrawer] = useState(false);

  // Initialize player's 6-mon team on load
  useEffect(() => {
    if (playerTeam.length === 0 && availableCards.length > 0) {
      // Pick deck cards first, then fill up to 6 from available cards
      const initial: PokemonCard[] = [];
      deckCards.forEach((c) => {
        if (initial.length < 6) initial.push(c);
      });
      availableCards.forEach((c) => {
        if (initial.length < 6 && !initial.some((x) => x.id === c.id)) {
          initial.push(c);
        }
      });
      // If still fewer than 6, repeat available cards
      let i = 0;
      while (initial.length < 6 && availableCards.length > 0) {
        initial.push(availableCards[i % availableCards.length]);
        i++;
      }
      setPlayerTeam(initial);
    }
  }, [availableCards, deckCards]);

  // Battle countdown timer
  useEffect(() => {
    let interval: any;
    if (inBattle && !battleEnded && battleTimer > 0) {
      interval = setInterval(() => {
        setBattleTimer((t) => {
          if (t <= 1) {
            // Time out: check who has more alive mons
            handleTimeoutDefeat();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inBattle, battleEnded, battleTimer]);

  const handleTimeoutDefeat = async () => {
    setBattleEnded(true);
    setPlayerWon(false);
    setBattleLogs((prev) => ['⏰ ¡Se agotó el tiempo de combate!', ...prev]);
    if (selectedOpponent) {
      await onBattleEnd(selectedOpponent.name, false, 0, 'Tiempo agotado');
    }
  };

  // Toggle card in player's 6-member pre-battle team
  const togglePlayerTeamMember = (card: PokemonCard) => {
    if (playerTeam.some((c) => c.id === card.id)) {
      if (playerTeam.length > 1) {
        setPlayerTeam(playerTeam.filter((c) => c.id !== card.id));
      }
    } else {
      if (playerTeam.length < 6) {
        setPlayerTeam([...playerTeam, card]);
      }
    }
  };

  // Generate full 6-mon opponent team
  const buildOpponent6Team = (opp: BattleOpponent): PokemonCard[] => {
    const key = opp.id.toLowerCase();
    const expanded = EXPANDED_OPPONENT_TEAMS[key];
    if (expanded && expanded.length >= 6) {
      return expanded.map((x, idx) => ({
        id: x.id * 100 + idx,
        pokedexNumber: x.id,
        name: x.name,
        type: x.type,
        rarity: x.rarity,
        hp: x.hp,
        attack: x.atk,
        defense: x.def,
        speed: x.spd,
        level: 50,
        isHolo: idx >= 4,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${x.id}.png`,
        move1Name: x.m1,
        move1Damage: x.d1,
        move2Name: x.m2,
        move2Damage: x.d2,
        move2SpecialEffect: x.eff,
        isInDeck: false,
        isCustom: false,
      }));
    }
    // Fallback: fill from opp.team to 6
    const res: PokemonCard[] = [...opp.team];
    let count = 0;
    while (res.length < 6 && opp.team.length > 0) {
      const orig = opp.team[count % opp.team.length];
      res.push({ ...orig, id: orig.id * 1000 + count });
      count++;
    }
    return res;
  };

  // START 6 vs 6 BATTLE
  const handleStartBattle = () => {
    if (!selectedOpponent || playerTeam.length === 0) return;

    const opp6 = buildOpponent6Team(selectedOpponent);
    setOpponentTeam(opp6);

    // Initial HPs
    setPlayerHps(playerTeam.map((c) => c.hp));
    setOpponentHps(opp6.map((c) => c.hp));

    setPlayerActiveIndex(0);
    setOpponentActiveIndex(0);
    setChargeEnergy(0);
    setIsDodging(false);
    setBattleTimer(99);
    setBattleEnded(false);
    setPlayerWon(false);
    setDamagePopup(null);
    setShowSwapDrawer(false);

    setBattleLogs([
      `⚔️ ¡Comienza el combate 6 vs 6 contra ${selectedOpponent.name}!`,
      `¡Adelante, ${playerTeam[0].name}!`,
      `${selectedOpponent.name} envía a ${opp6[0].name}.`,
    ]);

    setPlayerAnim('animate-summon');
    setOpponentAnim('animate-summon');
    playBattleAudio('summon');
    setTimeout(() => {
      setPlayerAnim('');
      setOpponentAnim('');
    }, 750);

    setInBattle(true);
  };

  const getMultiplier = (atkType: PokemonType, defType: PokemonType): number => {
    return EFFECTIVENESS[atkType]?.[defType] || 1.0;
  };

  // Player Dodge action
  const handleDodge = () => {
    if (isTurnProcessing || isDodging || battleEnded) return;
    setIsDodging(true);
    setPlayerAnim('animate-dodge');
    playBattleAudio('dodge');
    setDamagePopup({ text: '💨 ¡ESQUIVANDO!', isPlayer: true });

    setTimeout(() => {
      setPlayerAnim('');
      setIsDodging(false);
    }, 1200);
  };

  // Switch Active Pokémon Mid-Battle
  const handleSwapPokemon = (newIndex: number) => {
    if (newIndex === playerActiveIndex || playerHps[newIndex] <= 0 || isTurnProcessing || battleEnded) return;

    setShowSwapDrawer(false);
    setIsTurnProcessing(true);
    const newMon = playerTeam[newIndex];

    setBattleLogs((prev) => [`🔄 Cambias a ${playerTeam[playerActiveIndex].name} por ${newMon.name}!`, ...prev]);
    setPlayerAnim('animate-faint');
    playBattleAudio('faint');

    setTimeout(() => {
      setPlayerActiveIndex(newIndex);
      setPlayerAnim('animate-summon');
      playBattleAudio('summon');

      setTimeout(() => {
        setPlayerAnim('');
        setIsTurnProcessing(false);
      }, 700);
    }, 500);
  };

  // EXECUTE ATTACK (Move 1 Quick / Move 2 Charged)
  const handleAttack = async (isMove2: boolean) => {
    const activePlayerCard = playerTeam[playerActiveIndex];
    const activeOpponentCard = opponentTeam[opponentActiveIndex];

    if (!activePlayerCard || !activeOpponentCard || isTurnProcessing || battleEnded) return;
    if (isMove2 && chargeEnergy < 100) return; // Special attack requires 100% charge

    setIsTurnProcessing(true);

    const moveName = isMove2 ? activePlayerCard.move2Name : activePlayerCard.move1Name;
    const baseDamage = isMove2 ? activePlayerCard.move2Damage : activePlayerCard.move1Damage;

    // Trigger player lunge attack animation
    setPlayerAnim('animate-player-lunge');
    playBattleAudio('attack');

    setTimeout(() => {
      // Impact on opponent
      setPlayerAnim('');
      setOpponentAnim('animate-hurt');
      playBattleAudio('hit');

      const multiplier = getMultiplier(activePlayerCard.type, activeOpponentCard.type);
      let rawDamage = Math.round(
        ((activePlayerCard.attack * 0.45 + baseDamage) / (activeOpponentCard.defense * 0.2 + 10)) * 22 * multiplier
      );
      if (isMove2) rawDamage = Math.round(rawDamage * 1.35); // Big Charged Move Bonus!

      const damage = Math.max(20, rawDamage);

      let multMsg = '';
      if (multiplier > 1.2) {
        multMsg = ' 💥 ¡SÚPER EFICAZ!';
        playBattleAudio('superEffective');
      } else if (multiplier < 0.9) {
        multMsg = ' 🛡️ No es muy eficaz...';
      }

      setDamagePopup({ text: `-${damage}${multMsg}`, isPlayer: false });

      // Energy charge update
      if (isMove2) {
        setChargeEnergy(0);
      } else {
        setChargeEnergy((prev) => Math.min(100, prev + 35));
      }

      const currentOppHp = opponentHps[opponentActiveIndex];
      const newOppHp = Math.max(0, currentOppHp - damage);

      const updatedOppHps = [...opponentHps];
      updatedOppHps[opponentActiveIndex] = newOppHp;
      setOpponentHps(updatedOppHps);

      setBattleLogs((prev) => [
        `¡${activePlayerCard.name} usó ${moveName}! Causa ${damage} daño.${multMsg}`,
        ...prev,
      ]);

      // Check if Opponent's active mon fainted
      if (newOppHp === 0) {
        setOpponentAnim('animate-faint');
        playBattleAudio('faint');

        setTimeout(() => {
          // Find next alive opponent mon
          const nextOppIdx = updatedOppHps.findIndex((hp, i) => i > opponentActiveIndex && hp > 0);

          if (nextOppIdx !== -1) {
            // Opponent summons next Pokémon
            setOpponentActiveIndex(nextOppIdx);
            setOpponentAnim('animate-summon');
            playBattleAudio('summon');
            setBattleLogs((prev) => [
              `💀 ¡${activeOpponentCard.name} rival se ha debilitado!`,
              `¡${selectedOpponent?.name} envía a ${opponentTeam[nextOppIdx].name}!`,
              ...prev,
            ]);

            setTimeout(() => {
              setOpponentAnim('');
              setIsTurnProcessing(false);
            }, 800);
          } else {
            // ALL 6 OPPONENT POKEMON DEFEATED! PLAYER WINS!
            setBattleEnded(true);
            setPlayerWon(true);
            playBattleAudio('superEffective');
            setBattleLogs((prev) => [
              `🏆 ¡VICTORIA TOTAL! ¡Has derrotado a los 6 Pokémon de ${selectedOpponent?.name}!`,
              ...prev,
            ]);
            if (selectedOpponent) {
              onBattleEnd(selectedOpponent.name, true, selectedOpponent.rewardCoins, `Victoria 6v6`);
            }
            setIsTurnProcessing(false);
          }
        }, 1100);
        return;
      }

      // Opponent counter-attacks after 800ms
      setTimeout(() => {
        setOpponentAnim('animate-opp-lunge');
        playBattleAudio('attack');

        setTimeout(() => {
          setOpponentAnim('');

          // If player dodged, take only 25% damage!
          const oppUsesMove2 = Math.random() > 0.6;
          const oppMoveName = oppUsesMove2 ? activeOpponentCard.move2Name : activeOpponentCard.move1Name;
          const oppBaseDmg = oppUsesMove2 ? activeOpponentCard.move2Damage : activeOpponentCard.move1Damage;

          const oppMult = getMultiplier(activeOpponentCard.type, activePlayerCard.type);
          let oppRawDmg = Math.round(
            ((activeOpponentCard.attack * 0.4 + oppBaseDmg) / (activePlayerCard.defense * 0.2 + 10)) * 20 * oppMult
          );
          if (isDodging) {
            oppRawDmg = Math.round(oppRawDmg * 0.25); // 75% dodge reduction
          }
          const oppDamage = Math.max(10, oppRawDmg);

          setPlayerAnim('animate-hurt');
          playBattleAudio('hit');

          const currentPlHp = playerHps[playerActiveIndex];
          const newPlayerHp = Math.max(0, currentPlHp - oppDamage);

          const updatedPlHps = [...playerHps];
          updatedPlHps[playerActiveIndex] = newPlayerHp;
          setPlayerHps(updatedPlHps);

          setDamagePopup({
            text: isDodging ? `¡Esquivado! -${oppDamage}` : `-${oppDamage}`,
            isPlayer: true,
          });

          setBattleLogs((prev) => [
            `¡${activeOpponentCard.name} usó ${oppMoveName}! Recibes ${oppDamage} daño.${
              isDodging ? ' (¡Daño reducido por esquive!)' : ''
            }`,
            ...prev,
          ]);

          // Check if Player active mon fainted
          if (newPlayerHp === 0) {
            setPlayerAnim('animate-faint');
            playBattleAudio('faint');

            setTimeout(() => {
              // Find next alive player mon
              const nextPlIdx = updatedPlHps.findIndex((hp) => hp > 0);

              if (nextPlIdx !== -1) {
                // Summon next player mon
                setPlayerActiveIndex(nextPlIdx);
                setPlayerAnim('animate-summon');
                playBattleAudio('summon');
                setBattleLogs((prev) => [
                  `💀 ¡Tu ${activePlayerCard.name} se ha debilitado!`,
                  `¡Adelante, ${playerTeam[nextPlIdx].name}!`,
                  ...prev,
                ]);

                setTimeout(() => {
                  setPlayerAnim('');
                  setIsTurnProcessing(false);
                }, 800);
              } else {
                // ALL 6 PLAYER POKÉMON FAINTED! DEFEAT!
                setBattleEnded(true);
                setPlayerWon(false);
                setBattleLogs((prev) => [
                  `💀 ¡Todos tus Pokémon se han debilitado! Has sido derrotado por ${selectedOpponent?.name}.`,
                  ...prev,
                ]);
                if (selectedOpponent) {
                  onBattleEnd(selectedOpponent.name, false, 0, 'Derrota 6v6');
                }
                setIsTurnProcessing(false);
              }
            }, 1100);
          } else {
            setTimeout(() => {
              setPlayerAnim('');
              setIsTurnProcessing(false);
            }, 400);
          }
        }, 300);
      }, 800);
    }, 300);
  };

  const activePlayerCard = playerTeam[playerActiveIndex];
  const activeOpponentCard = opponentTeam[opponentActiveIndex];
  const activePlayerHp = playerHps[playerActiveIndex] || 0;
  const activeOpponentHp = opponentHps[opponentActiveIndex] || 0;

  // Render pre-battle team setup or active 3D arena
  return (
    <div className="space-y-6">
      {!inBattle ? (
        /* ======================================================== */
        /* PRE-BATTLE: SELECT OPPONENT & CHOOSE 6-POKÉMON TEAM      */
        /* ======================================================== */
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Swords className="w-7 h-7 text-[#FFCB05]" />
              Arena de Combates 6 vs 6
            </h2>
            <p className="text-xs text-blue-200/70">
              Escoge a un Líder de Gimnasio y selecciona a tu escuadrón de 6 Pokémon para el combate realista.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={onSwitchToAlbum}
                className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-blue-200/80 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ver Colección / Álbum</span>
              </button>
            </div>
          </div>

          {/* 1. Opponent Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {opponents.map((opp) => {
              const isSelected = selectedOpponent?.id === opp.id;

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpponent(opp)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-[#3B4CCA]/30 border-[#FFCB05] shadow-xl shadow-blue-900/40 scale-[1.02]'
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
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#CC0000]/30 text-red-300 border border-red-500/40">
                        {opp.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-200/60 mb-3">{opp.title}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
                    <span className="text-[11px] text-amber-300 font-bold">Equipo: 6 Pokémon</span>
                    <span className="font-bold text-[#FFCB05]">+{opp.rewardCoins} 🪙</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Player's 6 Selected Pokémon Roster */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-[#3B4CCA]/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FFCB05]" />
                  Tu Equipo de 6 Pokémon para el Combate:
                </h3>
                <p className="text-xs text-blue-200/60">
                  {playerTeam.length} de 6 seleccionados (Toca para quitar o sustituir)
                </p>
              </div>

              <button
                onClick={handleStartBattle}
                disabled={playerTeam.length === 0}
                className="py-3 px-8 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#CC0000] via-[#E83030] to-[#FFCB05] hover:from-[#E83030] hover:to-[#FFCB05] shadow-xl shadow-red-900/50 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              >
                <Swords className="w-5 h-5" />
                <span>¡ENTRAR AL COMBATE 6 VS 6!</span>
              </button>
            </div>

            {/* Selected 6 Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => {
                const card = playerTeam[index];

                if (!card) {
                  return (
                    <div
                      key={index}
                      className="h-36 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center p-3 text-center"
                    >
                      <span className="text-xl font-bold text-slate-600">#{index + 1}</span>
                      <span className="text-[10px] text-slate-500 mt-1 font-bold">Hueco Libre</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    onClick={() => togglePlayerTeamMember(card)}
                    className="relative p-2.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-[#3B4CCA]/60 shadow-lg hover:border-red-500 cursor-pointer group transition-all"
                  >
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-black text-[#FFCB05]">
                      #{index + 1}
                    </div>
                    <div className="absolute top-2 right-2 text-[9px] font-bold text-rose-400 flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-rose-500" /> {card.hp}
                    </div>

                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-20 object-contain my-2 group-hover:scale-110 transition-transform"
                    />

                    <div className="text-center">
                      <span className="text-xs font-black text-white block truncate">{card.name}</span>
                      <span className="text-[9px] font-bold text-blue-300">Nv.{card.level} • {card.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Pokémon to add to team */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Tus Pokémon Disponibles (Toca para añadir al equipo):
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {availableCards.map((card) => {
                  const isInTeam = playerTeam.some((c) => c.id === card.id);

                  return (
                    <div
                      key={card.id}
                      onClick={() => togglePlayerTeamMember(card)}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        isInTeam
                          ? 'border-emerald-500 bg-emerald-950/30 opacity-70'
                          : 'border-slate-800 bg-slate-950/80 hover:border-[#FFCB05] hover:scale-105'
                      }`}
                    >
                      <div className="relative">
                        <img src={card.imageUrl} alt={card.name} className="w-full h-12 object-contain" />
                        {isInTeam && (
                          <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-black text-white block truncate mt-1">{card.name}</span>
                      <span className="text-[9px] text-slate-400">Nv.{card.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* IN-BATTLE REALISTIC 3D ARENA (MATCHING UPLOADED PHOTO)  */
        /* ======================================================== */
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black select-none max-w-5xl mx-auto flex flex-col min-h-[580px]">

          {/* 1. TOP HUD (EXACTLY AS IN PHOTO) */}
          <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-start justify-between">
            {/* Player Info (Top-Left) */}
            <div className="w-40 sm:w-56 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-black text-sm sm:text-base text-white tracking-wide drop-shadow">
                  {activePlayerCard?.name}
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  Nv.{activePlayerCard?.level}
                </span>
              </div>

              {/* HP Bar */}
              <div className="w-full h-2.5 sm:h-3 bg-black/60 rounded-full overflow-hidden border border-white/20">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    activePlayerHp / (activePlayerCard?.hp || 1) > 0.5
                      ? 'bg-emerald-400'
                      : activePlayerHp / (activePlayerCard?.hp || 1) > 0.2
                      ? 'bg-yellow-400'
                      : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${Math.max(0, (activePlayerHp / (activePlayerCard?.hp || 1)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/90">
                <span>HP {activePlayerHp} / {activePlayerCard?.hp}</span>
                {/* 6 Pokéballs Status */}
                <div className="flex gap-1">
                  {playerTeam.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full border border-black ${
                        playerHps[i] > 0 ? (i === playerActiveIndex ? 'bg-[#FFCB05] animate-pulse' : 'bg-emerald-400') : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Center Battle Timer */}
            <div className="flex flex-col items-center justify-center">
              <div className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white font-mono text-xs sm:text-sm font-black shadow-lg">
                ⏱️ {battleTimer}s
              </div>
              {damagePopup && (
                <div className="mt-2 animate-damage-float text-xs sm:text-sm font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {damagePopup.text}
                </div>
              )}
            </div>

            {/* Opponent Info (Top-Right) */}
            <div className="w-40 sm:w-56 space-y-1 text-right">
              <div className="flex items-baseline justify-between flex-row-reverse">
                <span className="font-black text-sm sm:text-base text-white tracking-wide drop-shadow">
                  {activeOpponentCard?.name}
                </span>
                <span className="text-[10px] font-bold text-red-400">
                  {selectedOpponent?.name}
                </span>
              </div>

              {/* HP Bar */}
              <div className="w-full h-2.5 sm:h-3 bg-black/60 rounded-full overflow-hidden border border-white/20">
                <div
                  className={`h-full transition-all duration-300 rounded-full ml-auto ${
                    activeOpponentHp / (activeOpponentCard?.hp || 1) > 0.5
                      ? 'bg-emerald-400'
                      : activeOpponentHp / (activeOpponentCard?.hp || 1) > 0.2
                      ? 'bg-yellow-400'
                      : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${Math.max(0, (activeOpponentHp / (activeOpponentCard?.hp || 1)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/90">
                {/* 6 Pokéballs Status */}
                <div className="flex gap-1">
                  {opponentTeam.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full border border-black ${
                        opponentHps[i] > 0 ? (i === opponentActiveIndex ? 'bg-red-500 animate-pulse' : 'bg-emerald-400') : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span>HP {activeOpponentHp} / {activeOpponentCard?.hp}</span>
              </div>
            </div>
          </div>

          {/* 2. REALISTIC 3D BATTLE ARENA PERSPECTIVE */}
          <div className="relative flex-1 w-full min-h-[440px] overflow-hidden flex flex-col justify-end">
            {/* Sky Background (Blue sky with clouds as in photo) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                background: 'radial-gradient(ellipse at bottom, #2563eb 0%, #0369a1 40%, #0c4a6e 80%, #0f172a 100%)',
              }}
            >
              {/* Soft clouds & horizon glow */}
              <div className="absolute inset-x-0 top-1/4 h-24 bg-gradient-to-t from-cyan-400/20 to-transparent blur-xl" />
              {/* Stadium light poles / perimeter wall */}
              <div className="absolute inset-x-0 bottom-36 h-10 border-b-4 border-blue-400/40 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-blue-900/60 backdrop-blur-xs" />
            </div>

            {/* Stadium Ground (Green Turf with White Circles & Pokéball Mark) */}
            <div className="battle-perspective absolute inset-x-0 bottom-0 h-64 overflow-hidden">
              <div
                className="arena-ground absolute -inset-x-20 bottom-0 h-80 rounded-[100%] border-4 border-white/40 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at center, #15803d 0%, #166534 50%, #14532d 100%)',
                }}
              >
                {/* Concentric white lines & Pokéball circle in center */}
                <div className="w-56 h-56 rounded-full border-4 border-white/60 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white/60 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/80" />
                  </div>
                  <div className="absolute inset-x-0 h-1 bg-white/60" />
                </div>
              </div>
            </div>

            {/* 3. OPPONENT POKÉMON (CENTER-UPPER BACKGROUND) */}
            {activeOpponentCard && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-36 sm:bottom-40 z-10 flex flex-col items-center">
                {/* Ground shadow */}
                <div className="w-28 h-8 bg-black/60 rounded-full blur-sm absolute -bottom-2" />

                <div className={`transition-all duration-300 ${opponentAnim}`}>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${activeOpponentCard.pokedexNumber}.gif`}
                    onError={(e) => {
                      e.currentTarget.src = activeOpponentCard.imageUrl || '';
                    }}
                    alt={activeOpponentCard.name}
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.8)] select-none pointer-events-none"
                  />
                </div>
              </div>
            )}

            {/* 4. PLAYER POKÉMON (BOTTOM-LEFT FOREGROUND - BACK VIEW) */}
            {activePlayerCard && (
              <div className="absolute left-8 sm:left-16 bottom-6 sm:bottom-8 z-20 flex flex-col items-center">
                {/* Ground shadow */}
                <div className="w-36 h-10 bg-black/70 rounded-full blur-md absolute -bottom-2" />

                <div className={`transition-all duration-300 ${playerAnim}`}>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${activePlayerCard.pokedexNumber}.gif`}
                    onError={(e) => {
                      e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${activePlayerCard.pokedexNumber}.png`;
                    }}
                    alt={activePlayerCard.name}
                    className="w-44 h-44 sm:w-56 sm:h-56 object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                  />
                </div>
              </div>
            )}

            {/* 5. INTERACTIVE ACTION BUTTONS (LIKE IN PHOTO) */}
            <div className="absolute bottom-4 inset-x-4 z-30 flex items-end justify-between pointer-events-auto">
              {/* Bottom-Left: Dodge Runner Button */}
              <button
                onClick={handleDodge}
                disabled={isTurnProcessing || battleEnded}
                title="Esquivar ataque rival"
                className="w-14 h-14 rounded-full bg-cyan-900/80 hover:bg-cyan-700 border-2 border-cyan-400 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all disabled:opacity-40"
              >
                <PersonStanding className="w-6 h-6 animate-pulse" />
                <span className="text-[8px] font-black uppercase">Esquivar</span>
              </button>

              {/* Center: Attack Actions (Quick Attack & Charged Move) */}
              <div className="flex flex-col items-center gap-2 max-w-sm w-full mx-2">
                {/* Charged Attack Energy Bars (Like in the photo) */}
                <div className="flex items-center gap-1 w-full max-w-xs px-2">
                  <div className="w-full h-2 rounded-full bg-slate-900/80 border border-blue-400/40 overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${chargeEnergy}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full justify-center">
                  {/* Quick Attack (Move 1) */}
                  <button
                    onClick={() => handleAttack(false)}
                    disabled={isTurnProcessing || battleEnded}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-700 hover:border-amber-400 text-white font-black text-xs shadow-lg active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{activePlayerCard?.move1Name}</span>
                    <span className="text-[10px] text-amber-300">({activePlayerCard?.move1Damage})</span>
                  </button>

                  {/* Charged Attack (Move 2) */}
                  <button
                    onClick={() => handleAttack(true)}
                    disabled={isTurnProcessing || battleEnded || chargeEnergy < 100}
                    className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs text-white shadow-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      chargeEnergy >= 100
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 border-2 border-cyan-300 shadow-cyan-500/50 animate-pulse'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="truncate">{activePlayerCard?.move2Name}</span>
                    <span className="text-[10px] text-cyan-200">({activePlayerCard?.move2Damage})</span>
                  </button>
                </div>
              </div>

              {/* Bottom-Right: Swap Pokémon Button */}
              <button
                onClick={() => setShowSwapDrawer(!showSwapDrawer)}
                disabled={isTurnProcessing || battleEnded}
                title="Cambiar de Pokémon (6v6)"
                className="w-14 h-14 rounded-full bg-indigo-900/80 hover:bg-indigo-700 border-2 border-indigo-400 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowUpDown className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase">Cambiar</span>
              </button>
            </div>
          </div>

          {/* 6. SWAP POKÉMON DRAWER */}
          {showSwapDrawer && (
            <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-950/95 border-t-2 border-[#3B4CCA] p-4 rounded-t-3xl shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-[#FFCB05]" />
                  Selecciona qué Pokémon enviar al combate:
                </span>
                <button
                  onClick={() => setShowSwapDrawer(false)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {playerTeam.map((mon, idx) => {
                  const hp = playerHps[idx];
                  const isCurrent = idx === playerActiveIndex;
                  const isFainted = hp <= 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSwapPokemon(idx)}
                      disabled={isCurrent || isFainted}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-[#FFCB05] bg-[#FFCB05]/10'
                          : isFainted
                          ? 'border-slate-800 bg-slate-950 opacity-40 cursor-not-allowed'
                          : 'border-slate-700 bg-slate-900 hover:border-cyan-400 hover:scale-105'
                      }`}
                    >
                      <img src={mon.imageUrl} alt={mon.name} className="w-12 h-12 object-contain mx-auto" />
                      <span className="text-[11px] font-black text-white block truncate">{mon.name}</span>
                      <span className={`text-[9px] font-bold ${isFainted ? 'text-red-500' : 'text-emerald-400'}`}>
                        {isFainted ? 'Debilitado' : `${hp} HP`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. VICTORY / DEFEAT BANNER OVERLAY */}
          {battleEnded && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div
                className={`p-4 rounded-full mb-3 ${
                  playerWon ? 'bg-[#FFCB05]/20 text-[#FFCB05] border border-[#FFCB05]/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {playerWon ? <Trophy className="w-16 h-16 animate-bounce" /> : <AlertTriangle className="w-16 h-16" />}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {playerWon ? '¡VICTORIA EN LA ARENA!' : 'HAS SIDO DERROTADO'}
              </h3>
              <p className="text-xs text-blue-200/80 mt-1 max-w-sm">
                {playerWon
                  ? `¡Increíble! Venciste a los 6 Pokémon de ${selectedOpponent?.name} y has ganado +${selectedOpponent?.rewardCoins} PokéMonedas.`
                  : `Tus 6 Pokémon han caído frente a ${selectedOpponent?.name}. Mejora tus cartas o prueba otra combinación.`}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleStartBattle}
                  className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#CC0000] to-[#E83030] hover:from-[#E83030] hover:to-[#FF4444] shadow-lg shadow-red-900/40 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Revancha 6 vs 6</span>
                </button>
                <button
                  onClick={() => setInBattle(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Volver a Elegir Rival
                </button>
              </div>
            </div>
          )}

          {/* 8. MINI BATTLE LOG DRAWER (BOTTOM) */}
          <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 text-[11px] text-blue-200/70 flex items-center justify-between">
            <span className="truncate">
              📜 {battleLogs[0] || 'El combate está listo.'}
            </span>
            <button
              onClick={() => {
                if (window.confirm('¿Deseas retirarte del combate?')) setInBattle(false);
              }}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold shrink-0 ml-2"
            >
              Rendirse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
