import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { clsx } from 'clsx';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { setModalOpen, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  return (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className={clsx(
        "relative p-2 rounded-xl text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-all cursor-pointer group flex items-center justify-center",
        className
      )}
      title="Notificaciones"
      aria-label="Abrir centro de notificaciones"
      id="notification-bell-btn"
    >
      <Bell className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-105" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
