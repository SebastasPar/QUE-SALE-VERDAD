import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActivityCardProps {
  id: string;
  title: string;
  category: string;
  location: string;
  time: string;
  date?: string;
  currentAttendees: number;
  imageUrl?: string;
  isJoined?: boolean;
  organizerType?: 'user' | 'venue';
  organizerName?: string;
  distanceKm?: number;
  price?: number;
  priceType?: 'free' | 'paid';
  onJoinClick?: (e: React.MouseEvent, id: string) => void;
}

// Helper to format ISO date strings into gorgeous Spanish friendly strings
const formatSpanishDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  } catch (e) {
    return dateStr;
  }
};

export const ActivityCardSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 animate-pulse">
      <div className="h-48 w-full bg-slate-200"></div>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
        <div className="flex items-center gap-2">
           <div className="h-4 w-4 rounded-full bg-slate-200"></div>
           <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="flex -space-x-2">
             <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white"></div>
             <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white"></div>
             <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white"></div>
          </div>
          <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  category,
  location,
  time,
  date,
  currentAttendees,
  imageUrl,
  isJoined,
  organizerType = 'user',
  organizerName,
  distanceKm,
  price = 0,
  priceType = 'free',
  onJoinClick
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sports':
      case 'deportes':
        return '⚽';
      case 'tech':
      case 'tecnología':
        return '💻';
      case 'creative':
      case 'creatividad':
        return '🎨';
      case 'cultura':
      case 'cultura / historia':
      case 'cultura / arte':
        return '🎭';
      case 'gastronomía':
        return '🍕';
      case 'bienestar':
        return '🧘';
      case 'naturaleza / relax':
        return '🌳';
      case 'aventura / naturaleza':
        return '⛰️';
      case 'entretenimiento / noche':
        return '✨';
      case 'networking':
        return '🤝';
      default:
        return '📅';
    }
  };

  const getCategoryGradient = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sports':
      case 'deportes':
        return 'from-emerald-400 to-teal-600';
      case 'tech':
      case 'tecnología':
        return 'from-slate-800 to-indigo-950';
      case 'creative':
      case 'creatividad':
        return 'from-amber-400 to-rose-500';
      case 'cultura':
      case 'cultura / historia':
      case 'cultura / arte':
        return 'from-amber-500 to-orange-600';
      case 'gastronomía':
        return 'from-orange-500 to-red-600';
      case 'bienestar':
      case 'naturaleza / relax':
        return 'from-emerald-500 to-teal-500';
      case 'aventura / naturaleza':
        return 'from-green-600 to-emerald-800';
      case 'entretenimiento / noche':
        return 'from-indigo-900 to-purple-900';
      case 'networking':
        return 'from-violet-600 to-fuchsia-600';
      default:
        return 'from-slate-500 to-slate-700';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/activity/${id}`)}
      className="w-full group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1E2025] shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] transition-all hover:shadow-md hover:border-[#008B8B]/40 dark:hover:border-[#14B8A6]/40 cursor-pointer"
    >
      <div className="relative h-48 w-full bg-[#EFEFF1] dark:bg-[#121316] overflow-hidden">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={title} 
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryGradient(category)} text-white font-sans relative`}>
            <span className="text-5xl mb-2 animate-pulse">{getCategoryIcon(category)}</span>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-85">{category}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-sm text-[#1C1E21] dark:text-[#F3F4F6] text-xs font-black tracking-wider rounded-lg uppercase shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34]">
          {category}
        </div>
        
        {/* Organizer Type Badge */}
        <div className="absolute top-3 right-3">
          {organizerType === 'venue' ? (
            <span className="px-2.5 py-1 bg-amber-500/90 text-white backdrop-blur-sm text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1">
              🏢 Local
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] backdrop-blur-sm text-[11px] font-black rounded-lg shadow-sm flex items-center gap-1">
              👤 Usuario
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2.5 min-w-0">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base sm:text-lg font-bold text-[#1C1E21] dark:text-[#F3F4F6] leading-snug line-clamp-2 min-w-0">
            {title}
          </h3>
          <button 
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="text-[#65676B] dark:text-[#9CA3AF] hover:text-rose-500 transition-colors p-1 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
        
        {/* Chips row: Date & Distance & Price */}
        <div className="w-full flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          {date && (
            <div className="max-w-full flex items-center gap-1.5 text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/10 border border-[#008B8B]/20 dark:border-[#14B8A6]/20 px-2 py-0.5 rounded-md capitalize min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span className="truncate">{formatSpanishDate(date)}</span>
            </div>
          )}

          {distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium text-[#65676B] dark:text-[#9CA3AF] bg-[#EFEFF1] dark:bg-[#121316] px-2 py-0.5 rounded-md border border-[#DDE1E5] dark:border-[#2A2D34] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#65676B] dark:text-[#9CA3AF] shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{distanceKm} km</span>
            </div>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md shrink-0" title="Reserva de 20 SaleCoins (reembolsable si se cancela)">
            <span>🪙</span>
            <span>20 monedas</span>
          </span>

          {organizerName && (
            <span className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] font-medium truncate max-w-[150px]">
              por {organizerName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#65676B] dark:text-[#9CA3AF] min-w-0">
           <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
           <span className="truncate">{location} • {time}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-[#EFEFF1] dark:bg-[#121316] border-2 border-white dark:border-[#1E2025] overflow-hidden">
                <img src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80`} alt="avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="h-7 w-7 rounded-full bg-[#EFEFF1] dark:bg-[#121316] border-2 border-white dark:border-[#1E2025] overflow-hidden">
                <img src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80`} alt="avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="ml-2.5 text-xs font-bold text-[#65676B] dark:text-[#9CA3AF] bg-[#EFEFF1] dark:bg-[#121316] px-2 py-0.5 rounded-full border border-[#DDE1E5] dark:border-[#2A2D34]">
              +{currentAttendees} inscritos
            </div>
          </div>

          {/* Bold Coral Orange "Join Plan" / "Unirme" CTA button */}
          <button 
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               if(onJoinClick) onJoinClick(e, id);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer",
              isJoined 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200" 
                : "bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white shadow-[#FF5733]/25"
            )}
          >
            {isJoined ? '✓ Confirmado' : 'Unirme • 20 🪙'}
          </button>
        </div>
      </div>
    </div>
  );
};
