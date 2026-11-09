import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { MessageSquare, UserCheck, X, ChevronRight, Bell, Sparkles } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, markAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeToast) return;

    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);

    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const handleClick = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.linkUrl) {
      navigate(activeToast.linkUrl);
    }
  };

  const isChat = activeToast.type === 'chat_message';
  const isNewMember = activeToast.type === 'new_member';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div 
        onClick={handleClick}
        className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 hover:border-violet-500/80 cursor-pointer transition-all flex items-start gap-3 group relative overflow-hidden ring-1 ring-white/10"
      >
        {/* Glowing accent border top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isChat 
            ? 'bg-gradient-to-r from-violet-500 to-indigo-500' 
            : isNewMember 
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
            : 'bg-gradient-to-r from-amber-400 to-orange-500'
        }`} />

        {/* Avatar or Icon */}
        <div className="relative shrink-0 mt-0.5">
          {isChat ? (
            activeToast.senderAvatarUrl ? (
              <div className="relative">
                <img 
                  src={activeToast.senderAvatarUrl} 
                  alt={activeToast.senderName || 'Sender'} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-400"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                  <MessageSquare className="w-2.5 h-2.5" />
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            )
          ) : isNewMember ? (
            activeToast.memberAvatarUrl ? (
              <div className="relative">
                <img 
                  src={activeToast.memberAvatarUrl} 
                  alt={activeToast.memberName || 'Member'} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                  <UserCheck className="w-2.5 h-2.5" />
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            )
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isChat 
                ? 'bg-violet-950 text-violet-300 border border-violet-800' 
                : isNewMember 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {isChat ? 'Mensaje en chat' : isNewMember ? 'Nuevo miembro' : 'Aviso'}
            </span>
            <span className="text-[10px] text-slate-400">Ahora mismo</span>
          </div>

          <h4 className="text-xs font-bold text-white leading-tight truncate group-hover:text-violet-300 transition-colors">
            {activeToast.title}
          </h4>

          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {activeToast.message}
          </p>

          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-violet-400 group-hover:translate-x-0.5 transition-transform">
            <span>{isChat ? 'Ir al chat grupal' : isNewMember ? 'Ver detalles de la salida' : 'Ver más'}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
