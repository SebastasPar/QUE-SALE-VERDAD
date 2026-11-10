import React, { useState, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useActivities, useJoinActivity, Activity } from '../hooks/useActivities';
import { ActivityCard, ActivityCardSkeleton } from '../components/shared/activity-card';
import { Search, SlidersHorizontal, X, RotateCcw, MapPin, Building2, User, Moon, Sun, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/shared/bottom-nav';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { 
  AdvancedFiltersModal, 
  AdvancedFilterState, 
  DEFAULT_FILTERS 
} from '../components/shared/AdvancedFiltersModal';
import { useWalletStore } from '../store/walletStore';
import { useLocationStore, calculateDistanceKm } from '../store/locationStore';
import { SaleCoinsBadge } from '../components/wallet/SaleCoinsBadge';
import { RechargeModal } from '../components/wallet/RechargeModal';
import { NotificationBell } from '../components/notifications/NotificationBell';

const CATEGORIES = ['Recomendados', 'Deportes', 'Cultura', 'Gastronomía', 'Bienestar'];

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="bg-red-50 text-red-800 p-4 rounded-xl flex flex-col items-center justify-center my-8 text-center border border-red-200">
      <p className="font-semibold mb-2">Algo salió mal cargando el feed</p>
      <p className="text-sm opacity-80 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

export default function Feed() {
  const { user: currentUser } = useAuthStore();
  const { canAfford } = useWalletStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { isGeolocationEnabled, coordinates } = useLocationStore();
  const { data: activities, isLoading, refetch } = useActivities();
  const { mutate: joinActivity } = useJoinActivity();
  const [activeCategory, setActiveCategory] = useState('Recomendados');
  const [search, setSearch] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(DEFAULT_FILTERS);
  const navigate = useNavigate();

  const handleJoin = (e: React.MouseEvent, id: string) => {
    const act = activities?.find((a) => a.id === id);
    if (act && !act.isJoined && !canAfford(20)) {
      e.stopPropagation();
      setIsRechargeOpen(true);
      return;
    }
    joinActivity(id, {
      onError: (err) => {
        if (err.message && err.message.includes('SALECOINS_INSUFFICIENT')) {
          setIsRechargeOpen(true);
        }
      }
    });
  };

  // Helper function to check relative date matching
  const matchesDate = (actDateStr?: string, filter?: string) => {
    if (!filter || filter === 'all') return true;
    if (!actDateStr) return false;

    const now = new Date();
    const actDate = new Date(actDateStr + 'T00:00:00');
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const actDay = new Date(actDate.getFullYear(), actDate.getMonth(), actDate.getDate());
    const diffDays = Math.round((actDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (filter === 'today') {
      return diffDays === 0;
    }
    if (filter === 'tomorrow') {
      return diffDays === 1;
    }
    if (filter === 'weekend') {
      const dayOfWeek = actDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }
    if (filter === 'week') {
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  };

  // Helper function to check time of day
  const matchesTime = (timeStr?: string, filter?: string) => {
    if (!filter || filter === 'all') return true;
    if (!timeStr) return true;

    const hour = parseInt(timeStr.split(':')[0], 10);
    if (isNaN(hour)) return true;

    if (filter === 'morning') return hour < 12;
    if (filter === 'afternoon') return hour >= 12 && hour < 18;
    if (filter === 'night') return hour >= 18;
    return true;
  };

  // Filter predicate
  const filterActivity = (act: Activity) => {
    // 1. Text Search (title, description, location, category)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSearch = 
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.location.toLowerCase().includes(q) ||
        act.category.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // 2. Quick top Category Pill
    if (activeCategory !== 'Recomendados') {
      if (!act.category.toLowerCase().includes(activeCategory.toLowerCase())) {
        return false;
      }
    }

    // 3. Advanced Categories filter
    if (advancedFilters.categories.length > 0) {
      const actCat = act.category.toLowerCase();
      const hasMatch = advancedFilters.categories.some(cat => 
        actCat.includes(cat.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    // 4. Organizer Type (Planes de usuarios vs Planes de locales)
    if (advancedFilters.organizerType !== 'all') {
      const currentOrgType = act.organizerType || 'user';
      if (currentOrgType !== advancedFilters.organizerType) {
        return false;
      }
    }

    // 5. Distance Filter
    if (advancedFilters.maxDistanceKm < 30) {
      const distance = isGeolocationEnabled && coordinates && act.latitude !== undefined && act.longitude !== undefined
        ? calculateDistanceKm(coordinates.latitude, coordinates.longitude, act.latitude, act.longitude)
        : (act.distanceKm ?? 2.0);
      if (distance > advancedFilters.maxDistanceKm) {
        return false;
      }
    }

    // 6. Price Filter
    if (advancedFilters.priceType !== 'all') {
      const isFree = act.priceType === 'free' || !act.price || act.price === 0;
      if (advancedFilters.priceType === 'free' && !isFree) return false;
      if (advancedFilters.priceType === 'paid' && isFree) return false;
    }

    // 7. Date Filter
    if (!matchesDate(act.date, advancedFilters.dateFilter)) {
      return false;
    }

    // 8. Time of Day Filter
    if (!matchesTime(act.time, advancedFilters.timeOfDay)) {
      return false;
    }

    // 9. Available Spots Only
    if (advancedFilters.onlyAvailableSpots) {
      if (act.currentAttendees >= act.maxAttendees) {
        return false;
      }
    }

    return true;
  };

  const filteredActivities = useMemo(() => {
    const list = activities?.filter(filterActivity) || [];
    if (isGeolocationEnabled && coordinates) {
      return [...list].sort((a, b) => {
        const distA = a.latitude !== undefined && a.longitude !== undefined
          ? calculateDistanceKm(coordinates.latitude, coordinates.longitude, a.latitude, a.longitude)
          : (a.distanceKm ?? 999);
        const distB = b.latitude !== undefined && b.longitude !== undefined
          ? calculateDistanceKm(coordinates.latitude, coordinates.longitude, b.latitude, b.longitude)
          : (b.distanceKm ?? 999);
        return distA - distB;
      });
    }
    return list;
  }, [activities, search, activeCategory, advancedFilters, isGeolocationEnabled, coordinates]);

  // Count active advanced filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.organizerType !== 'all') count++;
    if (advancedFilters.categories.length > 0) count += advancedFilters.categories.length;
    if (advancedFilters.maxDistanceKm < 30) count++;
    if (advancedFilters.priceType !== 'all') count++;
    if (advancedFilters.dateFilter !== 'all') count++;
    if (advancedFilters.timeOfDay !== 'all') count++;
    if (advancedFilters.onlyAvailableSpots) count++;
    return count;
  }, [advancedFilters]);

  return (
    <div className="w-full pb-28 min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] transition-colors">
      {/* Header */}
      <header className="w-full sticky top-0 z-20 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 shadow-2xs">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex justify-between items-center gap-2 mb-2.5">
            <h1 className="shrink-0 text-lg sm:text-xl font-black text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 flex items-center justify-center text-[#008B8B] dark:text-[#14B8A6] font-bold text-base shadow-2xs shrink-0">
                ✨
              </span>
              ¿Qué Sale?
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Theme toggle switch (Light/Dark Mode) */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-[#65676B] dark:text-[#9CA3AF] hover:text-[#008B8B] dark:hover:text-[#14B8A6] hover:bg-[#EFEFF1] dark:hover:bg-[#121316] transition-colors cursor-pointer"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                aria-label="Alternar tema claro/oscuro"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <NotificationBell />
              <SaleCoinsBadge />
              <div 
                className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-slate-200 dark:bg-[#121316] ring-2 ring-[#008B8B]/30 dark:ring-[#14B8A6]/40 cursor-pointer shadow-xs transition-transform hover:scale-105" 
                onClick={() => navigate('/profile')}
                title="Ver mi perfil"
              >
                <img 
                  src={currentUser?.avatarUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238596a0' style='background-color:%23dfe5e7'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"} 
                  alt="Profile" 
                  referrerPolicy="no-referrer" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>

          {/* Search Bar with high contrast */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#65676B] dark:text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, distrito o palabra clave..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-[#EFEFF1] dark:bg-[#121316] hover:bg-white dark:hover:bg-[#1E2025] focus:bg-white dark:focus:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl placeholder-[#65676B] dark:placeholder-[#9CA3AF] text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 dark:focus:ring-[#14B8A6]/20 focus:border-[#008B8B] dark:focus:border-[#14B8A6] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories & Filter Button Section */}
      <div className="w-full sticky top-[105px] z-10 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-2.5 shadow-2xs">
        <div className="w-full max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-[#008B8B] text-white dark:bg-[#14B8A6] dark:text-[#121316] border-[#008B8B] dark:border-[#14B8A6] shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] border-[#DDE1E5] dark:border-[#2A2D34] hover:border-[#008B8B] hover:text-[#008B8B] dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6] shadow-2xs'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros avanzados</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white dark:bg-[#121316] text-[#008B8B] dark:text-[#14B8A6] text-[10px] flex items-center justify-center font-extrabold ml-0.5 shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick Categories Bar (Teal accent for selected items) */}
            {CATEGORIES.map(cat => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#008B8B] text-white dark:bg-[#14B8A6] dark:text-[#121316] font-extrabold shadow-xs' 
                      : 'bg-[#EFEFF1] dark:bg-[#121316] text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6] border border-transparent font-medium'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips Bar (dismissible) */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] font-bold text-[#65676B] dark:text-[#9CA3AF] uppercase tracking-wider mr-1">
                Filtros:
              </span>

              {/* Organizer Type Chip */}
              {advancedFilters.organizerType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  {advancedFilters.organizerType === 'user' ? '👤 Solo usuarios' : '🏢 Solo locales'}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, organizerType: 'all' }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category Chips */}
              {advancedFilters.categories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  {cat}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Distance Chip */}
              {advancedFilters.maxDistanceKm < 30 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  &lt; {advancedFilters.maxDistanceKm} km
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, maxDistanceKm: 30 }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Price Chip */}
              {advancedFilters.priceType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  {advancedFilters.priceType === 'free' ? '🟢 Gratis' : '💳 De pago'}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, priceType: 'all' }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Date Chip */}
              {advancedFilters.dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  {advancedFilters.dateFilter === 'today' ? 'Hoy' : advancedFilters.dateFilter === 'tomorrow' ? 'Mañana' : advancedFilters.dateFilter === 'weekend' ? 'Fin de semana' : 'Próx. 7 días'}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, dateFilter: 'all' }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Time of Day Chip */}
              {advancedFilters.timeOfDay !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  {advancedFilters.timeOfDay === 'morning' ? '☀️ Mañana' : advancedFilters.timeOfDay === 'afternoon' ? '🌤️ Tarde' : '🌙 Noche'}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, timeOfDay: 'all' }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Spots Chip */}
              {advancedFilters.onlyAvailableSpots && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/25">
                  Con cupos libres
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, onlyAvailableSpots: false }))}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Clear All active */}
              <button 
                type="button"
                onClick={() => setAdvancedFilters(DEFAULT_FILTERS)}
                className="text-[11px] font-bold text-[#FF5733] hover:text-[#E04826] dark:text-[#FF6B4A] hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="w-full max-w-3xl mx-auto px-4 mt-4">
        {/* Results summary header */}
        <div className="flex justify-between items-center mb-3 text-xs text-[#65676B] dark:text-[#9CA3AF] font-medium">
          <span>
            {isLoading 
              ? 'Buscando planes...' 
              : `${filteredActivities.length} ${filteredActivities.length === 1 ? 'actividad encontrada' : 'actividades encontradas'}`
            }
          </span>
          {activeFilterCount > 0 && (
            <span className="text-[#008B8B] dark:text-[#14B8A6] font-bold">
              Filtros avanzados aplicados
            </span>
          )}
        </div>

        {/* GPS Proximity Indicator Banner */}
        {isGeolocationEnabled && coordinates && (
          <div className="w-full mb-4 p-3 bg-white dark:bg-[#1E2025] border border-[#008B8B]/30 dark:border-[#14B8A6]/30 rounded-2xl flex items-center justify-between gap-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="p-2 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] rounded-xl font-bold shrink-0">
                <Navigation className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-1.5 leading-snug">
                  <span className="truncate sm:whitespace-normal">Ordenado por cercanía a tu ubicación GPS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </p>
                <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] leading-snug mt-0.5">
                  Mostrando los planes más próximos a tu ubicación actual primero
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile/me')}
              className="text-[11px] font-black text-[#FF5733] dark:text-[#FF6B4A] hover:underline shrink-0 cursor-pointer"
            >
              Ajustes GPS
            </button>
          </div>
        )}

        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={refetch}>
          {isLoading ? (
            <div className="space-y-6">
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </div>
          ) : filteredActivities?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-[#1E2025] rounded-3xl border border-[#DDE1E5] dark:border-[#2A2D34] mt-4 shadow-xs">
              <div className="w-16 h-16 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] rounded-2xl flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] mb-1">Sin actividades para estos filtros</h3>
              <p className="text-[#65676B] dark:text-[#9CA3AF] mb-6 text-sm max-w-sm">
                No encontramos planes que coincidan con todos tus criterios. Prueba ampliar la distancia o remover filtros para descubrir más opciones.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setAdvancedFilters(DEFAULT_FILTERS);
                    setActiveCategory('Recomendados');
                    setSearch('');
                  }}
                  className="px-4 py-2 bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl font-bold text-xs hover:border-[#008B8B] transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
                <button 
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="px-5 py-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Ajustar filtros avanzados
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredActivities?.map((activity) => {
                const computedDistance = isGeolocationEnabled && coordinates && activity.latitude !== undefined && activity.longitude !== undefined
                  ? calculateDistanceKm(coordinates.latitude, coordinates.longitude, activity.latitude, activity.longitude)
                  : activity.distanceKm;

                return (
                  <ActivityCard 
                    key={activity.id} 
                    {...activity} 
                    distanceKm={computedDistance}
                    imageUrl={activity.imageUrl || `https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80`}
                    onJoinClick={handleJoin} 
                  />
                );
              })}
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onChange={setAdvancedFilters}
        totalResultsCount={filteredActivities.length}
      />

      {/* SaleCoins Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        requiredAmount={20}
      />

      {/* Navigation Bar */}
      <BottomNav activeTab="home" />
    </div>
  );
}
