import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, MessageSquare, Plus, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

interface BottomNavProps {
  activeTab: 'home' | 'chats' | 'create' | 'profile';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const unreadChatCount = useNotificationStore((state) =>
    state.notifications.filter((n) => !n.read && n.type === 'chat_message').length
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E2025] border-t border-[#DDE1E5] dark:border-[#2A2D34] pb-safe z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center h-16 max-w-3xl mx-auto px-4 relative">
        {/* Home/Feed */}
        <button
          type="button"
          onClick={() => navigate('/feed')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#008B8B] dark:text-[#14B8A6]' 
              : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <div className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'home' 
              ? 'bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 font-black' 
              : 'bg-transparent'
          }`}>
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold leading-none">Home</span>
          </div>
        </button>

        {/* Chats */}
        <button
          type="button"
          onClick={() => navigate('/chats')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
            activeTab === 'chats' 
              ? 'text-[#008B8B] dark:text-[#14B8A6]' 
              : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
          }`}
          id="nav-chats-btn"
        >
          <div className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'chats' 
              ? 'bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 font-black' 
              : 'bg-transparent'
          }`}>
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FF5733] text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-[#1E2025]">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold leading-none">Chats</span>
          </div>
        </button>

        {/* Floating Action Button (+) in Coral Orange */}
        <div className="relative flex flex-col items-center justify-center -mt-6">
          <button
            type="button"
            onClick={() => navigate('/activity/create')}
            className="w-13 h-13 rounded-full bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white flex items-center justify-center shadow-lg shadow-[#FF5733]/30 border-4 border-white dark:border-[#1E2025] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Crear nueva actividad"
            title="Crear salida"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className={`text-[10px] font-black mt-0.5 ${
            activeTab === 'create' 
              ? 'text-[#FF5733] dark:text-[#FF6B4A]' 
              : 'text-[#65676B] dark:text-[#9CA3AF]'
          }`}>
            Crear
          </span>
        </div>

        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
            activeTab === 'profile' 
              ? 'text-[#008B8B] dark:text-[#14B8A6]' 
              : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <div className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'profile' 
              ? 'bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 font-black' 
              : 'bg-transparent'
          }`}>
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="Perfil" 
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover mb-0.5 ring-2 ring-[#008B8B] dark:ring-[#14B8A6]" 
              />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span className="text-[10px] font-extrabold leading-none">Perfil</span>
          </div>
        </button>
      </div>
    </nav>
  );
};
