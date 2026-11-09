import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { BottomNav } from '../components/shared/bottom-nav';
import { MessageSquare, Calendar, MapPin, Users, HeartHandshake, Compass } from 'lucide-react';
import { NotificationBell } from '../components/notifications/NotificationBell';

export default function Chats() {
  const { data: activities, isLoading } = useActivities();
  const navigate = useNavigate();

  // Highlight activities that user has joined/opted-in-to
  const joinedActivities = activities?.filter(act => act.isJoined) || [];

  return (
    <div className="bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen pb-24 max-w-2xl mx-auto flex flex-col border-x border-[#DDE1E5] dark:border-[#2A2D34] transition-colors">
      {/* Search/Header branding */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-5 py-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-2">
              <MessageSquare className="w-5.5 h-5.5 text-[#008B8B] dark:text-[#14B8A6]" />
              Mensajes Grupales
            </h1>
            <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] font-medium mt-0.5">
              Coordinación y puntos de encuentro para tus salidas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className="text-xs bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] font-black px-2.5 py-1 rounded-full">
              {joinedActivities.length} {joinedActivities.length === 1 ? 'canal' : 'canales'}
            </span>
          </div>
        </div>
      </header>

      {/* Primary body section content */}
      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1E2025] rounded-2xl p-4 space-y-3 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-9 bg-slate-150 dark:bg-slate-800 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : joinedActivities.length === 0 ? (
          // Friendly empty state
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#1E2025] rounded-3xl border border-[#DDE1E5] dark:border-[#2A2D34] py-16 px-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center mb-4">
              <HeartHandshake className="w-8 h-8" />
            </div>
            
            <h3 className="text-base font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">No tienes chats activos aún</h3>
            <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] max-w-sm mt-1.5 leading-relaxed">
              Los chats grupales se habilitan automáticamente cuando te unes a un plan. ¡Encuentra tu próxima aventura en el feed!
            </p>
            
            <button
              onClick={() => navigate('/feed')}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              id="empty-chat-cta"
            >
              <Compass className="w-4 h-4" />
              Explorar actividades
            </button>
          </div>
        ) : (
          // List of chats
          <div className="space-y-3">
            {joinedActivities.map((activity) => {
              const getCategoryStyle = (cat: string) => {
                const c = cat.toLowerCase();
                if (c === 'sports' || c === 'deportes') return { bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', emoji: '⚽' };
                if (c === 'tech' || c === 'tecnología') return { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700', emoji: '💻' };
                if (c === 'creative' || c === 'creatividad') return { bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', emoji: '🎨' };
                if (c === 'cultura' || c === 'cultura / historia' || c === 'cultura / arte') return { bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', emoji: '🎭' };
                if (c === 'gastronomía') return { bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800', emoji: '🍕' };
                if (c === 'bienestar' || c === 'naturaleza / relax') return { bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800', emoji: '🧘' };
                if (c === 'aventura / naturaleza') return { bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', emoji: '⛰️' };
                if (c === 'entretenimiento / noche') return { bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', emoji: '✨' };
                return { bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', emoji: '📅' };
              };

              const catData = getCategoryStyle(activity.category);

              return (
                <div 
                  key={activity.id} 
                  className="bg-white dark:bg-[#1E2025] rounded-2xl p-4 border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs hover:border-[#008B8B] dark:hover:border-[#14B8A6] transition-all flex flex-col gap-3 group"
                  id={`chat-card-${activity.id}`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Category Icon Capsule */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${catData.bg} border shadow-2xs`}>
                      {catData.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${catData.bg}`}>
                          {activity.category}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          Inscrito ✓
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] group-hover:text-[#008B8B] dark:group-hover:text-[#14B8A6] transition-colors mt-1.5 truncate leading-snug">
                        {activity.title}
                      </h3>

                      {/* Detail points */}
                      <div className="flex flex-col gap-1 mt-2 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                        <span className="flex items-center gap-1 font-semibold truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                          {activity.location}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                            {activity.date} - {activity.time}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Users className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                            {activity.currentAttendees}/{activity.maxAttendees} confirmados
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Immediate enter button */}
                  <button
                    onClick={() => navigate(`/chat/${activity.id}`)}
                    className="w-full py-2.5 bg-[#008B8B]/10 hover:bg-[#008B8B] text-[#008B8B] hover:text-white dark:bg-[#14B8A6]/15 dark:hover:bg-[#14B8A6] dark:text-[#14B8A6] dark:hover:text-[#121316] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border border-[#008B8B]/20 dark:border-[#14B8A6]/30 cursor-pointer"
                    id={`enter-chat-btn-${activity.id}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Entrar al chat de coordinación
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation bar at bottom */}
      <BottomNav activeTab="chats" />
    </div>
  );
}
