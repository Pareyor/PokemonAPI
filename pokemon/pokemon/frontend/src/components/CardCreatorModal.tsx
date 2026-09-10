import React, { useState, useEffect } from 'react';
import { PokemonCard, PokemonCardFormData, PokemonType, CardRarity } from '../types';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface CardCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PokemonCardFormData) => Promise<void>;
  cardToEdit: PokemonCard | null;
  loading: boolean;
}

export const CardCreatorModal: React.FC<CardCreatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cardToEdit,
  loading,
}) => {
  const [formData, setFormData] = useState<PokemonCardFormData>({
    pokedexNumber: 25,
    name: 'Pikachu',
    type: 'ELECTRIC',
    rarity: 'RARE',
    hp: 120,
    attack: 85,
    defense: 65,
    speed: 110,
    isHolo: true,
    imageUrl: '',
    move1Name: 'Impactrueno',
    move1Damage: 45,
    move1Description: 'Ataque eléctrico veloz',
    move2Name: 'Rayo Trueno',
    move2Damage: 90,
    move2Description: 'Descarga devastadora de alto voltaje',
    move2SpecialEffect: 'PARALYZE',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cardToEdit) {
      setFormData({
        pokedexNumber: cardToEdit.pokedexNumber,
        name: cardToEdit.name,
        type: cardToEdit.type,
        rarity: cardToEdit.rarity,
        hp: cardToEdit.hp,
        attack: cardToEdit.attack,
        defense: cardToEdit.defense,
        speed: cardToEdit.speed,
        isHolo: cardToEdit.isHolo,
        imageUrl: cardToEdit.imageUrl || '',
        move1Name: cardToEdit.move1Name,
        move1Damage: cardToEdit.move1Damage,
        move1Description: cardToEdit.move1Description || '',
        move2Name: cardToEdit.move2Name,
        move2Damage: cardToEdit.move2Damage,
        move2Description: cardToEdit.move2Description || '',
        move2SpecialEffect: cardToEdit.move2SpecialEffect || 'CRITICAL',
      });
    } else {
      setFormData({
        pokedexNumber: 384,
        name: 'Rayquaza Custom',
        type: 'DRAGON',
        rarity: 'LEGENDARY',
        hp: 190,
        attack: 140,
        defense: 95,
        speed: 120,
        isHolo: true,
        imageUrl: '',
        move1Name: 'Tajo Aéreo',
        move1Damage: 70,
        move1Description: 'Corta el aire a hipervelocidad',
        move2Name: 'Ascenso Draco Supremo',
        move2Damage: 145,
        move2Description: 'Caída cósmica con energía estelar',
        move2SpecialEffect: 'CRITICAL',
      });
    }
    setErrorMsg(null);
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const currentArtworkUrl =
    formData.imageUrl ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formData.pokedexNumber}.png`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onSubmit({
        ...formData,
        imageUrl: currentArtworkUrl,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la carta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">
              {cardToEdit ? 'Editar Carta Pokémon' : 'Forjar Nueva Carta Pokémon (Custom)'}
            </h3>
            <p className="text-xs text-slate-400">
              Personaliza estadísticas, poderes y atributos elementales
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pokédex Number & Sprite Preview */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
            <img
              src={currentArtworkUrl}
              alt="Preview"
              className="w-20 h-20 object-contain p-1 bg-slate-900 rounded-xl border border-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
              }}
            />
            <div className="space-y-1 flex-1">
              <label className="text-xs font-bold text-slate-300">
                Número de Pokédex Oficial (Determina el Sprite)
              </label>
              <input
                type="number"
                min="1"
                max="1025"
                value={formData.pokedexNumber}
                onChange={(e) => setFormData({ ...formData, pokedexNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500">Ej: 6=Charizard, 9=Blastoise, 25=Pikachu, 150=Mewtwo</span>
            </div>
          </div>

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Nombre de la Carta *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Tipo Elemental *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PokemonType })}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="FIRE">Fuego (FIRE)</option>
                <option value="WATER">Agua (WATER)</option>
                <option value="GRASS">Planta (GRASS)</option>
                <option value="ELECTRIC">Eléctrico (ELECTRIC)</option>
                <option value="PSYCHIC">Psíquico (PSYCHIC)</option>
                <option value="FIGHTING">Lucha / Roca (FIGHTING)</option>
                <option value="DRAGON">Dragón (DRAGON)</option>
                <option value="DARK">Siniestro (DARK)</option>
                <option value="STEEL">Acero (STEEL)</option>
                <option value="NORMAL">Normal (NORMAL)</option>
              </select>
            </div>
          </div>

          {/* Rarity & Holo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Rareza de Carta</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as CardRarity })}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="COMMON">Común</option>
                <option value="UNCOMMON">Infrecuente</option>
                <option value="RARE">Rara ★</option>
                <option value="EPIC">Épica ★★</option>
                <option value="LEGENDARY">Legendaria ★★★</option>
              </select>
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isHolo}
                  onChange={(e) => setFormData({ ...formData, isHolo: e.target.checked })}
                  className="rounded border-slate-700 text-rose-600 focus:ring-0"
                />
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Efecto Holográfico Foil</span>
              </label>
            </div>
          </div>

          {/* Core Stats: HP, ATK, DEF, SPD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Salud (HP)</label>
              <input
                type="number"
                min="40"
                max="350"
                value={formData.hp}
                onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-rose-400 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Ataque (ATK)</label>
              <input
                type="number"
                min="20"
                max="250"
                value={formData.attack}
                onChange={(e) => setFormData({ ...formData, attack: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-amber-400 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Defensa (DEF)</label>
              <input
                type="number"
                min="20"
                max="250"
                value={formData.defense}
                onChange={(e) => setFormData({ ...formData, defense: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-blue-400 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Velocidad (SPD)</label>
              <input
                type="number"
                min="20"
                max="250"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-yellow-400 font-bold"
              />
            </div>
          </div>

          {/* Move 1 (Basic Attack) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-black uppercase text-slate-400">Ataque Básico (Movimiento 1)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombre del ataque (Ej. Impactrueno)"
                required
                value={formData.move1Name}
                onChange={(e) => setFormData({ ...formData, move1Name: e.target.value })}
                className="col-span-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="number"
                placeholder="Daño (DMG)"
                min="10"
                max="150"
                required
                value={formData.move1Damage}
                onChange={(e) => setFormData({ ...formData, move1Damage: parseInt(e.target.value) || 20 })}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-400 font-bold"
              />
            </div>
          </div>

          {/* Move 2 (Special Power) */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <span className="text-xs font-black uppercase text-indigo-300">Poder Especial (Movimiento 2)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombre del poder especial"
                required
                value={formData.move2Name}
                onChange={(e) => setFormData({ ...formData, move2Name: e.target.value })}
                className="col-span-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="number"
                placeholder="Daño (DMG)"
                min="20"
                max="250"
                required
                value={formData.move2Damage}
                onChange={(e) => setFormData({ ...formData, move2Damage: parseInt(e.target.value) || 40 })}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-400 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Descripción del poder"
                value={formData.move2Description}
                onChange={(e) => setFormData({ ...formData, move2Description: e.target.value })}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
              />
              <select
                value={formData.move2SpecialEffect}
                onChange={(e) => setFormData({ ...formData, move2SpecialEffect: e.target.value })}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold"
              >
                <option value="CRITICAL">Daño Crítico</option>
                <option value="BURN">Quemadura (BURN)</option>
                <option value="PARALYZE">Parálisis (PARALYZE)</option>
                <option value="HEAL">Auto-curación (HEAL)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Guardando...' : cardToEdit ? 'Guardar Cambios' : 'Forjar Carta en Colección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
