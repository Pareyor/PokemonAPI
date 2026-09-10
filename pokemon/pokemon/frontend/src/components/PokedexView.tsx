import React, { useState, useEffect, useCallback } from 'react';
import { PokedexItem, PokedexStats, PokemonType } from '../types';
import { api } from '../services/api';
import { typeThemes } from './PokemonCardView';
import { PokedexDetailModal } from './PokedexDetailModal';
import { Search, CheckCircle2, Lock, Sparkles, Filter, BookOpen } from 'lucide-react';

interface PokedexViewProps {
  onGoToShop?: () => void;
}

export const PokedexView: React.FC<PokedexViewProps> = ({ onGoToShop }) => {
  const [entries, setEntries] = useState<PokedexItem[]>([]);
  const [stats, setStats] = useState<PokedexStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<PokedexItem | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OWNED' | 'MISSING'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PokemonType | ''>('');

  const loadPokedex = useCallback(async () => {
    try {
      setLoading(true);
      const [items, statsData] = await Promise.all([
        api.getPokedex({
          search: search || undefined,
          type: (typeFilter as PokemonType) || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        api.getPokedexStats(),
      ]);
      setEntries(items);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadPokedex();
  }, [loadPokedex]);

  return (
    <div className="space-y-6">
      {/* Pokédex Progress Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/50 via-slate-900 to-indigo-950/40 border border-red-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3.5 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-600/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">Pokédex PokéPulse TCG</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                  MULTI-GEN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Registro enciclopédico de todas las especies Pokémon. Comprueba cuáles posees en tu colección y cuáles te faltan por capturar.
              </p>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capturados</span>
                <span className="text-lg font-black text-emerald-400">{stats.ownedSpecies}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Faltantes</span>
                <span className="text-lg font-black text-rose-400">{stats.missingSpecies}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Compleción</span>
                <span className="text-lg font-black text-amber-400">{stats.completionPercentage}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Animated Progress Bar */}
        {stats && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Progreso del Entrenador:</span>
              <span className="text-amber-400">{stats.ownedSpecies} de {stats.totalSpecies} especies descubiertas</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${Math.max(2, stats.completionPercentage)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o # número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Ver:</span>
          </div>

          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({stats?.totalSpecies ?? 0})
            </button>
            <button
              onClick={() => setStatusFilter('OWNED')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'OWNED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Capturados ({stats?.ownedSpecies ?? 0})
            </button>
            <button
              onClick={() => setStatusFilter('MISSING')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'MISSING' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Por Capturar ({stats?.missingSpecies ?? 0})
            </button>
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
        </div>
      </div>

      {/* Pokédex Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Sincronizando Pokédex...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
          No se encontraron especies con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {entries.map((entry) => {
            const theme = typeThemes[entry.primaryType] || typeThemes.NORMAL;

            return (
              <div
                key={entry.pokedexNumber}
                onClick={() => setSelectedEntry(entry)}
                className={`relative rounded-2xl border p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none group ${
                  entry.isOwned
                    ? `bg-gradient-to-b ${theme.bg} ${theme.border} shadow-lg hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400/60`
                    : 'bg-slate-900/30 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-600 hover:-translate-y-1'
                }`}
              >
                {/* Header: Number & Status Badge */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-400">
                      #{String(entry.pokedexNumber).padStart(3, '0')}
                    </span>
                    {entry.isOwned ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {entry.ownedCount}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                        <Lock className="w-2.5 h-2.5" /> Faltante
                      </span>
                    )}
                  </div>

                  {/* Artwork */}
                  <div className="my-2 relative aspect-square rounded-xl bg-slate-950/60 flex items-center justify-center p-2 overflow-hidden border border-slate-800/60 group-hover:border-slate-600 transition-colors">
                    <img
                      src={entry.imageUrl}
                      alt={entry.name}
                      className={`h-full object-contain transition-all duration-300 ${
                        entry.isOwned
                          ? 'filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)] group-hover:scale-110'
                          : 'opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-500'
                      }`}
                      loading="lazy"
                    />
                    {!entry.isOwned && (
                      <div className="absolute bottom-1 inset-x-0 flex justify-center">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-500 border border-slate-700/60">
                          No capturado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4
                    className={`text-xs font-black text-center truncate ${
                      entry.isOwned ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {entry.name}
                  </h4>
                </div>

                {/* Types and Details Footer */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        entry.isOwned ? theme.badge : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {entry.primaryType}
                    </span>
                    {entry.secondaryType && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                        {entry.secondaryType}
                      </span>
                    )}
                  </div>

                  {entry.isOwned ? (
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Nv. Máx: {entry.highestLevel}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-medium group-hover:text-blue-300 transition-colors">
                      Ver aspectos ➔
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pokedex Detail & Card Aspects Modal */}
      <PokedexDetailModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onGoToShop={onGoToShop}
      />
    </div>
  );
};
