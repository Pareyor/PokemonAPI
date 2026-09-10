import React, { useState, useEffect, useCallback } from 'react';
import { PokemonCard, PokemonCardFormData, TrainerProfile, BattleOpponent, PokemonType, CardRarity } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { PokemonCardView } from './components/PokemonCardView';
import { BoosterPackModal } from './components/BoosterPackModal';
import { BattleArena } from './components/BattleArena';
import { CardCreatorModal } from './components/CardCreatorModal';
import { CardDetailModal } from './components/CardDetailModal';
import { PokedexView } from './components/PokedexView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Search, Filter, Sparkles, Swords } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'album' | 'pokedex' | 'arena' | 'packs'>('album');

  // Core Data
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [opponents, setOpponents] = useState<BattleOpponent[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | ''>('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | ''>('');
  const [onlyDeckFilter, setOnlyDeckFilter] = useState(false);

  // Modals
  const [isPackOpen, setIsPackOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<PokemonCard | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);

  const [detailCard, setDetailCard] = useState<PokemonCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cardsData, profileData, oppsData] = await Promise.all([
        api.getCards({
          search: search || undefined,
          type: (typeFilter as PokemonType) || undefined,
          rarity: (rarityFilter as CardRarity) || undefined,
          inDeck: onlyDeckFilter ? true : undefined,
        }),
        api.getProfile(),
        api.getOpponents(),
      ]);
      setCards(cardsData);
      setProfile(profileData);
      setOpponents(oppsData);
    } catch (err: any) {
      addToast('error', 'Error al cargar datos', err.message || 'No se pudo conectar con el backend de Pokémon.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, rarityFilter, onlyDeckFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Toggle Deck
  const handleToggleDeck = async (card: PokemonCard) => {
    try {
      const updated = await api.toggleDeck(card.id);
      setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)));
      api.getProfile().then(setProfile).catch(() => {});
      if (updated.isInDeck) {
        addToast('success', '¡Añadido al Mazo!', `${card.name} ahora está listo para combatir.`);
      } else {
        addToast('info', 'Quitado del Mazo', `${card.name} devuelto al álbum.`);
      }
    } catch (err: any) {
      addToast('warning', 'Aviso de Mazo', err.message);
    }
  };

  // Handler: Level Up
  const handleLevelUp = async (card: PokemonCard) => {
    try {
      const updated = await api.levelUp(card.id);
      setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)));
      api.getProfile().then(setProfile).catch(() => {});
      addToast('success', '¡Nivel Aumentado!', `${card.name} subió al Nivel ${updated.level} (+HP, +ATK).`);
    } catch (err: any) {
      addToast('error', 'Error al subir nivel', err.message);
    }
  };

  // Handler: Delete / Recycle Card
  const handleDeleteCard = async (card: PokemonCard) => {
    if (!window.confirm(`¿Seguro que deseas reciclar a ${card.name}? Recibirás monedas a cambio.`)) {
      return;
    }
    try {
      await api.deleteCard(card.id);
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      api.getProfile().then(setProfile).catch(() => {});
      addToast('info', 'Carta Reciclada', `Recibiste monedas por reciclar a ${card.name}.`);
      if (isDetailOpen && detailCard?.id === card.id) {
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      addToast('error', 'Error al reciclar', err.message);
    }
  };

  // Handler: Save / Edit Custom Card
  const handleSaveCard = async (formData: PokemonCardFormData) => {
    setCreatorLoading(true);
    try {
      if (cardToEdit) {
        const updated = await api.updateCard(cardToEdit.id, formData);
        setCards((prev) => prev.map((c) => (c.id === cardToEdit.id ? updated : c)));
        addToast('success', 'Carta Actualizada', `${updated.name} fue guardado.`);
      } else {
        const created = await api.createCard(formData);
        setCards((prev) => [created, ...prev]);
        addToast('success', '¡Carta Forjada!', `Se creó ${created.name} exitosamente.`);
      }
      setIsCreatorOpen(false);
      setCardToEdit(null);
      api.getProfile().then(setProfile).catch(() => {});
    } catch (err: any) {
      throw err;
    } finally {
      setCreatorLoading(false);
    }
  };

  // Handler: Open Booster Pack
  const handleOpenPack = async (packType: string) => {
    const result = await api.openPack(packType);
    setCards((prev) => [...result.cardsObtained, ...prev]);
    api.getProfile().then(setProfile).catch(() => {});
    addToast('success', '¡Sobre Abierto!', `${result.cardsObtained.length} cartas añadidas.`);
    return result;
  };

  // Handler: Claim Daily Coins Bonus
  const handleClaimBonus = async () => {
    try {
      const updated = await api.claimBonus();
      setProfile(updated);
      addToast('success', '¡Bono Reclamado!', 'Has recibido +150 PokéMonedas gratis.');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Handler: Battle Finish
  const handleBattleEnd = async (opponentName: string, won: boolean, coins: number, log: string) => {
    try {
      await api.recordBattle(opponentName, won, coins, log);
      api.getProfile().then(setProfile).catch(() => {});
      if (won) {
        addToast('success', '¡Victoria!', `Venciste a ${opponentName} y ganaste +${coins} monedas.`);
      } else {
        addToast('warning', 'Combate Finalizado', `Has sido derrotado por ${opponentName}.`);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const deckCards = cards.filter((c) => c.isInDeck);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: 'transparent' }}>
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        onClaimBonus={handleClaimBonus}
        onOpenBoosterShop={() => setIsPackOpen(true)}
        onOpenCardCreator={() => {
          setCardToEdit(null);
          setIsCreatorOpen(true);
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: ÁLBUM / COLECCIÓN DE CARTAS */}
        {activeTab === 'album' && (
          <div className="space-y-6">
            {/* Active Deck Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-white">Mazo de Combate Activo</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                      {deckCards.length} / 5 Cartas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Las cartas en tu mazo son las que usarás para combatir en la Arena contra los Líderes de Gimnasio.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('arena')}
                  disabled={deckCards.length === 0}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-lg shadow-amber-600/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>Ir a Combatir</span>
                </button>
              </div>
            </div>

            {/* Filter Bar: Search, Type, Rarity, InDeck Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar Pokémon, ataque..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center space-x-1 text-xs text-slate-400 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtros:</span>
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as PokemonType | '')}
                  className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                >
                  <option value="">Todos los Tipos</option>
                  <option value="FIRE">Fuego</option>
                  <option value="WATER">Agua</option>
                  <option value="GRASS">Planta</option>
                  <option value="ELECTRIC">Eléctrico</option>
                  <option value="PSYCHIC">Psíquico</option>
                  <option value="FIGHTING">Lucha</option>
                  <option value="DRAGON">Dragón</option>
                  <option value="DARK">Siniestro</option>
                  <option value="NORMAL">Normal</option>
                </select>

                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as CardRarity | '')}
                  className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                >
                  <option value="">Todas las Rarezas</option>
                  <option value="COMMON">Común</option>
                  <option value="UNCOMMON">Infrecuente</option>
                  <option value="RARE">Rara ★</option>
                  <option value="EPIC">Épica ★★</option>
                  <option value="LEGENDARY">Legendaria ★★★</option>
                </select>

                <button
                  onClick={() => setOnlyDeckFilter(!onlyDeckFilter)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    onlyDeckFilter
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Solo en Mazo
                </button>

                {(search || typeFilter || rarityFilter || onlyDeckFilter) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setTypeFilter('');
                      setRarityFilter('');
                      setOnlyDeckFilter(false);
                    }}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Accediendo a la colección...</span>
              </div>
            ) : cards.length === 0 ? (
              <div className="p-14 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-black text-white">No se encontraron cartas</h4>
                <p className="text-xs text-slate-400">
                  Prueba a cambiar los filtros o abre sobres en la tienda para conseguir más cartas.
                </p>
                <button
                  onClick={() => setIsPackOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl"
                >
                  Abrir Sobres Ahora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {cards.map((card) => (
                  <PokemonCardView
                    key={card.id}
                    card={card}
                    onToggleDeck={handleToggleDeck}
                    onLevelUp={handleLevelUp}
                    onView={(c) => {
                      setDetailCard(c);
                      setIsDetailOpen(true);
                    }}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POKÉDEX (BASE DE DATOS COMPLETA + TENIDOS/FALTANTES) */}
        {activeTab === 'pokedex' && (
          <PokedexView onGoToShop={() => setActiveTab('packs')} />
        )}

        {/* TAB 3: ARENA DE COMBATE */}
        {activeTab === 'arena' && (
          <BattleArena
            deckCards={deckCards}
            allCards={cards}
            opponents={opponents}
            onBattleEnd={handleBattleEnd}
            onSwitchToAlbum={() => setActiveTab('album')}
          />
        )}

        {/* TAB 4: TIENDA DE SOBRES */}
        {activeTab === 'packs' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Tienda Oficial de Sobres Booster
              </h2>
              <p className="text-xs text-slate-400">
                Gasta tus PokéMonedas para expandir tu colección y encontrar cartas Legendarias con efecto Holo.
              </p>
            </div>

            <BoosterPackModal
              isOpen={true}
              onClose={() => setActiveTab('album')}
              onOpenPack={handleOpenPack}
              trainerCoins={profile?.coins ?? 0}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-[#CC0000]/20 py-6 text-center text-xs text-blue-300/40"
        style={{ background: 'linear-gradient(0deg, #0A1628 0%, #0D1B3E 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PokéPulse TCG &copy; {new Date().getFullYear()} — Spring Boot 3.4 · React 18 · TypeScript · PostgreSQL</span>
          <span className="text-blue-300/30">localhost: 3001 (Front) | 8089 (Back) | 5434 (Postgres)</span>
        </div>
      </footer>


      {/* Booster Shop Modal (when opened from navbar) */}
      <BoosterPackModal
        isOpen={isPackOpen}
        onClose={() => setIsPackOpen(false)}
        onOpenPack={handleOpenPack}
        trainerCoins={profile?.coins ?? 0}
      />

      {/* Card Creator / Edit Modal */}
      <CardCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSubmit={handleSaveCard}
        cardToEdit={cardToEdit}
        loading={creatorLoading}
      />

      {/* Card Detail Inspector Modal */}
      <CardDetailModal
        card={detailCard}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(c) => {
          setIsDetailOpen(false);
          setCardToEdit(c);
          setIsCreatorOpen(true);
        }}
        onToggleDeck={handleToggleDeck}
        onLevelUp={handleLevelUp}
      />

      {/* Toasts Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
