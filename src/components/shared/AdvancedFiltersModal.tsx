import React from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  Users, 
  Building2, 
  Sparkles, 
  MapPin, 
  Tag, 
  Calendar, 
  Clock, 
  Coins, 
  SlidersHorizontal 
} from 'lucide-react';

export interface AdvancedFilterState {
  organizerType: 'all' | 'user' | 'venue';
  categories: string[];
  maxDistanceKm: number; // 1 to 30. 30 = 'Sin límite'
  priceType: 'all' | 'free' | 'paid';
  dateFilter: 'all' | 'today' | 'tomorrow' | 'weekend' | 'week';
  timeOfDay: 'all' | 'morning' | 'afternoon' | 'night';
  onlyAvailableSpots: boolean;
}

export const DEFAULT_FILTERS: AdvancedFilterState = {
  organizerType: 'all',
  categories: [],
  maxDistanceKm: 30,
  priceType: 'all',
  dateFilter: 'all',
  timeOfDay: 'all',
  onlyAvailableSpots: false,
};

export const AVAILABLE_CATEGORIES = [
  { id: 'Deportes', label: 'Deportes & Fitness', icon: '⚽' },
  { id: 'Cultura', label: 'Cultura & Arte', icon: '🎭' },
  { id: 'Gastronomía', label: 'Gastronomía & Bares', icon: '🍕' },
  { id: 'Bienestar', label: 'Bienestar & Relax', icon: '🧘' },
  { id: 'Naturaleza', label: 'Naturaleza & Trekking', icon: '🌳' },
  { id: 'Noche', label: 'Fiesta & Vida Nocturna', icon: '✨' },
  { id: 'Juegos', label: 'Juegos de Mesa & Geek', icon: '🎲' },
  { id: 'Idiomas', label: 'Idiomas & Networking', icon: '🗣️' },
  { id: 'Música', label: 'Música en Vivo', icon: '🎵' },
];

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  totalResultsCount: number;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  totalResultsCount,
}) => {
  if (!isOpen) return null;

  const handleOrganizerChange = (type: 'all' | 'user' | 'venue') => {
    onChange({ ...filters, organizerType: type });
  };

  const toggleCategory = (catId: string) => {
    const isSelected = filters.categories.includes(catId);
    const updated = isSelected 
      ? filters.categories.filter(c => c !== catId)
      : [...filters.categories, catId];
    onChange({ ...filters, categories: updated });
  };

  const handleDistanceChange = (dist: number) => {
    onChange({ ...filters, maxDistanceKm: dist });
  };

  const handlePriceChange = (type: 'all' | 'free' | 'paid') => {
    onChange({ ...filters, priceType: type });
  };

  const handleDateChange = (dateKey: 'all' | 'today' | 'tomorrow' | 'weekend' | 'week') => {
    onChange({ ...filters, dateFilter: dateKey });
  };

  const handleTimeOfDayChange = (timeKey: 'all' | 'morning' | 'afternoon' | 'night') => {
    onChange({ ...filters, timeOfDay: timeKey });
  };

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  const countActive = () => {
    let count = 0;
    if (filters.organizerType !== 'all') count++;
    if (filters.categories.length > 0) count++;
    if (filters.maxDistanceKm < 30) count++;
    if (filters.priceType !== 'all') count++;
    if (filters.dateFilter !== 'all') count++;
    if (filters.timeOfDay !== 'all') count++;
    if (filters.onlyAvailableSpots) count++;
    return count;
  };

  const activeCount = countActive();

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full sm:max-w-xl max-h-[90vh] bg-white dark:bg-[#1E2025] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#DDE1E5] dark:border-[#2A2D34] animate-in fade-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DDE1E5] dark:border-[#2A2D34] flex items-center justify-between bg-[#EFEFF1] dark:bg-[#121316]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">Filtros avanzados</h2>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316]">
                    {activeCount} activo{activeCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">Encuentra planes a tu medida exacta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button 
                type="button"
                onClick={handleReset}
                className="text-xs text-[#65676B] dark:text-[#9CA3AF] hover:text-[#FF5733] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#EFEFF1] dark:hover:bg-[#121316] transition-colors cursor-pointer font-bold"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6] hover:bg-[#EFEFF1] dark:hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-[#1C1E21] dark:text-[#F3F4F6]">

          {/* 1. Tipo de Organizador: Planes de usuarios vs Planes de locales */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                Tipo de organizador / Origen
              </label>
              {filters.organizerType !== 'all' && (
                <span className="text-[11px] font-bold text-[#008B8B] dark:text-[#14B8A6]">Filtrado</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOrganizerChange('all')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  filters.organizerType === 'all'
                    ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-[#F3F4F6] ring-2 ring-[#008B8B]/20 shadow-xs'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1A1C22] hover:border-[#008B8B]/40 text-[#65676B] dark:text-[#9CA3AF]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">🌐</span>
                  {filters.organizerType === 'all' && <Check className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-[#1C1E21] dark:text-[#F3F4F6]">Todos</p>
                  <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] mt-0.5">Cualquier origen</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOrganizerChange('user')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  filters.organizerType === 'user'
                    ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-[#F3F4F6] ring-2 ring-[#008B8B]/20 shadow-xs'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1A1C22] hover:border-[#008B8B]/40 text-[#65676B] dark:text-[#9CA3AF]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">👤</span>
                  {filters.organizerType === 'user' && <Check className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-[#1C1E21] dark:text-[#F3F4F6]">Planes de usuarios</p>
                  <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] mt-0.5">Gente de la comunidad</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOrganizerChange('venue')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  filters.organizerType === 'venue'
                    ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-[#F3F4F6] ring-2 ring-[#008B8B]/20 shadow-xs'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1A1C22] hover:border-[#008B8B]/40 text-[#65676B] dark:text-[#9CA3AF]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">🏢</span>
                  {filters.organizerType === 'venue' && <Check className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-[#1C1E21] dark:text-[#F3F4F6]">Planes de locales</p>
                  <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] mt-0.5">Bares, museos y clubes</p>
                </div>
              </button>
            </div>
          </section>

          {/* 2. Categorías Ampliadas */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                Más categorías
              </label>
              <span className="text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                {filters.categories.length === 0 ? 'Todas seleccionadas' : `${filters.categories.length} seleccionada(s)`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map(cat => {
                const isSelected = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#008B8B] text-white dark:bg-[#14B8A6] dark:text-[#121316] font-bold shadow-xs'
                        : 'bg-[#EFEFF1] dark:bg-[#121316] hover:bg-slate-200 dark:hover:bg-[#252830] text-[#1C1E21] dark:text-[#F3F4F6] border border-[#DDE1E5] dark:border-[#2A2D34]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Filtro por Distancia */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                Distancia máxima
              </label>
              <span className="text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 px-2 py-0.5 rounded-md">
                {filters.maxDistanceKm >= 30 ? 'Sin límite (Toda la ciudad)' : `Hasta ${filters.maxDistanceKm} km`}
              </span>
            </div>

            {/* Slider */}
            <div className="py-2">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={filters.maxDistanceKm}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                className="w-full h-2 bg-[#DDE1E5] dark:bg-[#2A2D34] rounded-lg appearance-none cursor-pointer accent-[#008B8B] dark:accent-[#14B8A6]"
              />
              <div className="flex justify-between text-[10px] text-[#65676B] dark:text-[#9CA3AF] mt-1 font-medium">
                <span>1 km (A pie)</span>
                <span>5 km</span>
                <span>15 km</span>
                <span>30 km (Sin límite)</span>
              </div>
            </div>

            {/* Quick Distance Presets */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: '< 3 km', value: 3 },
                { label: '< 6 km', value: 6 },
                { label: '< 12 km', value: 12 },
                { label: 'Cualquiera', value: 30 },
              ].map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleDistanceChange(preset.value)}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                    filters.maxDistanceKm === preset.value
                      ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#14B8A6] dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          {/* 4. Precio / Costo */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                Precio / Costo
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePriceChange('all')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  filters.priceType === 'all'
                    ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#14B8A6] dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                }`}
              >
                Cualquiera
              </button>
              <button
                type="button"
                onClick={() => handlePriceChange('free')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  filters.priceType === 'free'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                }`}
              >
                🟢 Solo Gratis
              </button>
              <button
                type="button"
                onClick={() => handlePriceChange('paid')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  filters.priceType === 'paid'
                    ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#14B8A6] dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                }`}
              >
                💳 De pago / Consumo
              </button>
            </div>
          </section>

          {/* 5. Fecha / Cuándo */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                ¿Cuándo es el plan?
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Cualquier fecha' },
                { id: 'today', label: '⚡ Hoy' },
                { id: 'tomorrow', label: '🌅 Mañana' },
                { id: 'weekend', label: '🎉 Este fin de semana' },
                { id: 'week', label: '📆 Próximos 7 días' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleDateChange(opt.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    filters.dateFilter === opt.id
                      ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#14B8A6] dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 6. Horario del día */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                Horario preferido
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Cualquier hora' },
                { id: 'morning', label: '☀️ Mañana' },
                { id: 'afternoon', label: '🌤️ Tarde' },
                { id: 'night', label: '🌙 Noche' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTimeOfDayChange(opt.id as any)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    filters.timeOfDay === opt.id
                      ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#008B8B] dark:border-[#14B8A6] dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:bg-[#EFEFF1] dark:hover:bg-[#121316]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 7. Disponibilidad de cupos */}
          <section className="pt-2 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] cursor-pointer hover:border-[#008B8B] transition-colors">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#1C1E21] dark:text-[#F3F4F6]">Solo con cupos disponibles</p>
                  <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF]">Ocultar planes que ya están al 100% de aforo</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.onlyAvailableSpots}
                onChange={(e) => onChange({ ...filters, onlyAvailableSpots: e.target.checked })}
                className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] rounded border-[#DDE1E5] focus:ring-[#008B8B] accent-[#008B8B] cursor-pointer"
              />
            </label>
          </section>

        </div>

        {/* Footer with Coral Orange CTA button */}
        <div className="px-6 py-4 border-t border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 border border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6] rounded-xl text-xs font-bold hover:bg-[#EFEFF1] dark:hover:bg-[#121316] transition-colors shrink-0 cursor-pointer"
          >
            Limpiar todo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-xl text-sm font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver resultados ({totalResultsCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
