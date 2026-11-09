import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, AppNotification } from '../../store/notificationStore';
import { 
  Bell, 
  MessageSquare, 
  UserCheck, 
  CheckCheck, 
  Trash2, 
  X, 
  ChevronRight, 
  Sparkles,
  Zap,
  Users,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

export const NotificationModal: React.FC = () => {
  const { 
    notifications, 
    isModalOpen, 
    setModalOpen, 
    filter, 
    setFilter,
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAll,
    simulateChatMessage,
    simulateNewMember,
    getUnreadCount
  } = useNotificationStore();

  const navigate = useNavigate();
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const unreadCount = getUnreadCount();

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setModalOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Ahora mismo';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      return `Hace ${diffDays} días`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center relative shadow-xs">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Notificaciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Estás al día con tus salidas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-bold text-violet-700 dark:text-violet-400 hover:text-violet-800 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leídas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Simulation Bar (For Interactive Testing) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              Probar alertas en vivo:
            </span>
            <span className="text-[10px] text-slate-400">Lanza notificación simulada</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const ok = simulateChatMessage();
                if (!ok) {
                  setSimulationNotice('Únete a una salida en el Feed para recibir mensajes de su chat grupal.');
                  setTimeout(() => setSimulationNotice(null), 4000);
                } else {
                  setSimulationNotice(null);
                }
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/60 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/50 text-xs font-bold text-violet-700 dark:text-violet-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
              <span>Simular Mensaje</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const ok = simulateNewMember();
                if (!ok) {
                  setSimulationNotice('Crea una salida con el botón (+) para recibir avisos cuando nuevos miembros se unan.');
                  setTimeout(() => setSimulationNotice(null), 4000);
                } else {
                  setSimulationNotice(null);
                }
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simular Miembro</span>
            </button>
          </div>

          {simulationNotice && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{simulationNotice}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              filter === 'all'
                ? "bg-violet-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            Todas ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('chat_message')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              filter === 'chat_message'
                ? "bg-violet-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Mensajes</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('new_member')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              filter === 'new_member'
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            <UserCheck className="w-3 h-3" />
            <span>Nuevos Miembros</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No tienes notificaciones aún
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                  Para recibir notificaciones, únete a una salida grupal en el Feed o crea tu propio plan. Cuando haya nuevos mensajes o participantes, los verás aquí.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isChat = notif.type === 'chat_message';
              const isMember = notif.type === 'new_member';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={clsx(
                    "p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group relative",
                    !notif.read
                      ? "bg-violet-50/70 dark:bg-violet-950/20 hover:bg-violet-100/60 dark:hover:bg-violet-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0 mt-2" />
                  )}

                  {/* Icon or Avatar */}
                  <div className="relative shrink-0">
                    {isChat ? (
                      notif.senderAvatarUrl ? (
                        <div className="relative">
                          <img 
                            src={notif.senderAvatarUrl} 
                            alt={notif.senderName || 'Sender'} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px]">
                            <MessageSquare className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )
                    ) : isMember ? (
                      notif.memberAvatarUrl ? (
                        <div className="relative">
                          <img 
                            src={notif.memberAvatarUrl} 
                            alt={notif.memberName || 'Member'} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-200 dark:ring-emerald-800"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                            <UserCheck className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        isChat 
                          ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                          : isMember
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}>
                        {isChat ? 'Mensaje' : isMember ? 'Nuevo Miembro' : 'Info'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>

                    <h5 className={clsx(
                      "text-xs leading-tight transition-colors line-clamp-1",
                      !notif.read 
                        ? "font-extrabold text-slate-900 dark:text-white group-hover:text-violet-700"
                        : "font-semibold text-slate-700 dark:text-slate-300"
                    )}>
                      {notif.title}
                    </h5>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                      <span>{isChat ? 'Abrir chat' : isMember ? 'Ver actividad' : 'Ver detalle'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium text-[11px]">
              {notifications.length} notificaciones guardadas
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-rose-500 hover:text-rose-600 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar todo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
