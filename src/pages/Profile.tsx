import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserProfile } from '../hooks/useUsers';
import { useThemeStore } from '../store/themeStore';
import { BottomNav } from '../components/shared/bottom-nav';
import { ActivityCard } from '../components/shared/activity-card';
import { 
  LogOut, 
  Award, 
  Calendar, 
  Heart, 
  Moon, 
  Sun, 
  Star, 
  MessageSquare, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Edit3,
  Camera,
  Upload,
  X,
  User as UserIcon,
  Check,
  Coins,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Zap,
  Navigation,
  MapPin,
  LocateFixed,
} from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { useLocationStore } from '../store/locationStore';
import { RechargeModal } from '../components/wallet/RechargeModal';
import { SaleCoinsExplanationModal } from '../components/wallet/SaleCoinsExplanationModal';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';
import { NotificationBell } from '../components/notifications/NotificationBell';

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  
  const { user: currentUser, logout, updateProfile } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { balance, transactions } = useWalletStore();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const { 
    isGeolocationEnabled, 
    status: geoStatus, 
    coordinates: geoCoordinates, 
    requestLocation, 
    disableLocation 
  } = useLocationStore();
  
  // Custom hook extracts profile dynamically (Static profiles block for hosts, fallback to me)
  const profile = useUserProfile(userId);
  const isOwnProfile = !userId || userId === 'me' || (currentUser && userId === currentUser.id);

  // Tabs layout
  const [activeTab, setActiveTab] = useState<'plans' | 'reviews' | 'interests' | 'wallet'>('plans');
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [editName, setEditName] = useState(currentUser?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditModal = () => {
    setEditBio(currentUser?.bio || profile?.bio || '');
    setEditAvatarUrl(currentUser?.avatarUrl || profile?.avatarUrl || '');
    setEditName(currentUser?.name || profile?.name || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || currentUser?.name,
      bio: editBio.trim(),
      avatarUrl: editAvatarUrl
    });
    setIsEditingProfile(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!profile) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-600 font-bold mb-4">Perfil no encontrado</p>
        <button
          onClick={() => navigate('/feed')}
          className="px-5 py-2.5 bg-violet-700 text-white text-xs font-bold rounded-xl"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Convert key IDs to human friendly display icons/tags
  const getInterestBadge = (id: string) => {
    const map: Record<string, { label: string, icon: string }> = {
      football: { label: 'Fútbol', icon: '⚽' },
      gaming: { label: 'Gaming', icon: '🎮' },
      reading: { label: 'Lectura', icon: '📖' },
      travel: { label: 'Viajes', icon: '✈️' },
      tech: { label: 'Tecnología', icon: '💻' },
      music: { label: 'Música', icon: '🎵' },
      cinema: { label: 'Cine', icon: '🎬' },
      art: { label: 'Arte & Foto', icon: '🎨' },
      cooking: { label: 'Gastronomía', icon: '🍳' },
      fitness: { label: 'Gimnasio & Deporte', icon: '🏋️' },
      photography: { label: 'Fotografía', icon: '📷' },
      sustainability: { label: 'Ecología', icon: '🌿' },
      yoga: { label: 'Yoga & Meditación', icon: '🧘' },
      investing: { label: 'Inversiones', icon: '📈' },
      design: { label: 'Diseño', icon: '🎨' },
    };
    return map[id] || { label: id, icon: '✨' };
  };

  // Convert stars count to styled stars elements
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.round(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i < fullStars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
        />
      );
    }
    return stars;
  };

  const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238596a0' style='background-color:%23dfe5e7'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  const [isCalendarSynced, setIsCalendarSynced] = useState(() => {
    return localStorage.getItem('quesale_calendar_synced') === 'true';
  });

  const [calNotice, setCalNotice] = useState<string | null>(null);

  const handleToggleCalendar = () => {
    const nextState = !isCalendarSynced;
    setIsCalendarSynced(nextState);
    localStorage.setItem('quesale_calendar_synced', String(nextState));
    if (nextState) {
      setCalNotice('¡Conexión exitosa! Los planes de ¿Qué Sale? se exportarán automáticamente a tu cuenta de Google Calendar.');
    } else {
      setCalNotice('Sincronización desactivada.');
    }
    setTimeout(() => setCalNotice(null), 5000);
  };

  return (
    <div className="bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen pb-24 max-w-3xl mx-auto flex flex-col transition-colors">
      {/* Profile Header Block */}
      <div className="bg-white dark:bg-[#1E2025] border-b border-[#DDE1E5] dark:border-[#2A2D34] px-6 pt-7 pb-6 shadow-xs rounded-b-3xl relative">
        {/* Navigation / Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          {isOwnProfile ? (
            <h1 className="text-xl font-black text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight">Mi Perfil</h1>
          ) : (
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 hover:bg-[#008B8B]/20 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </button>
          )}

          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
          
          {!isOwnProfile && (
            <div className="text-xs font-extrabold bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] px-3.5 py-1.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Perfil Verificado
            </div>
          )}
        </div>

        {/* User Card Layout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-100 bg-emerald-50 overflow-hidden shadow-sm relative shrink-0">
            <img 
              src={profile.avatarUrl || DEFAULT_AVATAR} 
              alt={profile.name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
            {isOwnProfile && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="absolute bottom-0 right-0 p-1.5 bg-[#619c77] hover:bg-[#528a68] text-white rounded-full border-2 border-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h2 className="text-2xl font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">{profile.name}</h2>
                {profile.badge && (
                  <span className="inline-flex self-center items-center gap-1 px-2.5 py-0.5 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[10px] font-black rounded-md shadow-2xs uppercase shrink-0">
                    <Sparkles className="w-3 h-3 text-[#008B8B] dark:text-[#14B8A6]" />
                    {profile.badge}
                  </span>
                )}
              </div>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="self-center sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] hover:text-[#007575] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 hover:bg-[#008B8B]/20 border border-[#008B8B]/30 dark:border-[#14B8A6]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
              )}
            </div>
            
            <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] font-semibold mb-3">
              {isOwnProfile ? profile.email : 'Contacto gestionado por ¿Qué Sale?'}
            </p>
            
            <div className="relative group">
              <p className="text-xs text-[#1C1E21] dark:text-[#F3F4F6] leading-relaxed font-medium bg-[#EFEFF1]/60 dark:bg-[#121316]/60 p-4 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34]">
                {profile.bio || (
                  <span className="italic text-[#65676B] dark:text-[#9CA3AF]">
                    Aún no has agregado una descripción. ¡Cuéntale al grupo sobre tus planes favoritos!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Grid with SaleCoins */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
          <div className="bg-[#EFEFF1]/60 dark:bg-[#121316]/60 rounded-xl p-3 text-center border border-[#DDE1E5] dark:border-[#2A2D34]">
            <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Planes</p>
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" />
              <p className="text-md font-extrabold text-[#1C1E21] dark:text-[#F3F4F6]">{profile.activities.length}</p>
            </div>
          </div>
          <div className="bg-[#EFEFF1]/60 dark:bg-[#121316]/60 rounded-xl p-3 text-center border border-[#DDE1E5] dark:border-[#2A2D34]">
            <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Completados</p>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" />
              <p className="text-md font-extrabold text-[#1C1E21] dark:text-[#F3F4F6]">{profile.completedActivities?.length || 0}</p>
            </div>
          </div>
          <div 
            onClick={() => isOwnProfile && setActiveTab('wallet')}
            className={`rounded-xl p-3 text-center border transition-all ${
              isOwnProfile 
                ? 'bg-amber-500/10 border-amber-500/30 cursor-pointer hover:bg-amber-500/15' 
                : 'bg-slate-50/50 border-slate-100/80'
            }`}
          >
            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-1">SaleCoins</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm">🪙</span>
              <p className="text-md font-black text-amber-950">{isOwnProfile ? balance : 100}</p>
            </div>
          </div>
        </div>

        {/* Billetera SaleCoins Banner (for own profile) */}
        {isOwnProfile && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-lg pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                  🪙
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-amber-100">
                    Billetera Anti No-Show
                  </span>
                  <p className="text-2xl font-black mt-0.5 flex items-baseline gap-1.5">
                    <span>{balance}</span>
                    <span className="text-xs font-bold text-amber-100">SaleCoins</span>
                  </p>
                  <p className="text-[11px] text-amber-100">
                    ~S/ {(balance * 0.1).toFixed(2)} • Para ~{Math.floor(balance / 20)} salidas confirmadas
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsRechargeOpen(true)}
                  className="px-3.5 py-1.5 bg-white text-amber-900 rounded-xl text-xs font-black shadow-sm hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recargar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExplanationOpen(true)}
                  className="text-[11px] text-white/90 hover:text-white underline font-semibold"
                >
                  ¿Cómo funcionan?
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Dark Mode Preference Toggle (My profile only) */}
        {isOwnProfile && (
          <div className="flex flex-col gap-3.5 mt-5">
            <div className="flex justify-between items-center bg-[#EFEFF1] dark:bg-[#121316] rounded-2xl p-4 border border-[#DDE1E5] dark:border-[#2A2D34] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 rounded-xl text-[#008B8B] dark:text-[#14B8A6]">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 animate-[spin_5s_linear_infinite]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Modo Oscuro</p>
                  <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                    {isDarkMode ? 'Activado - Deep Obsidian & Mint Teal' : 'Desactivado - Soft Gray & Coral Orange'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  isDarkMode ? 'bg-[#14B8A6]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Google Calendar Synchronization Toggle beneath Dark Mode */}
            <div className="flex flex-col justify-center bg-[#EFEFF1] dark:bg-[#121316] rounded-2xl p-4 border border-[#DDE1E5] dark:border-[#2A2D34] transition-colors relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 rounded-xl text-[#008B8B] dark:text-[#14B8A6]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-5-8h-4v4h4v-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Sincronizar con Google Calendar</h4>
                    <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] pr-4">Sincroniza tus planes grupales de ¿Qué Sale? en tu Google Calendar.</p>
                  </div>
                </div>
                
                <button
                  onClick={handleToggleCalendar}
                  type="button"
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none shrink-0 cursor-pointer ${
                    isCalendarSynced ? 'bg-[#008B8B] dark:bg-[#14B8A6]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      isCalendarSynced ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {calNotice && (
                <div className="mt-3 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-fade-in">
                  {calNotice}
                </div>
              )}
            </div>

            {/* Browser Geolocation & Proximity Sorting Toggle */}
            <div className="flex flex-col justify-center bg-[#EFEFF1] dark:bg-[#121316] rounded-2xl p-4 border border-[#DDE1E5] dark:border-[#2A2D34] transition-colors relative">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF5733]/10 dark:bg-[#FF6B4A]/20 rounded-xl text-[#FF5733] dark:text-[#FF6B4A] shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Ubicación y Proximidad GPS</h4>
                    <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                      {isGeolocationEnabled && geoCoordinates
                        ? 'Activo: los planes en el Feed se ordenan automáticamente por cercanía a tu ubicación.'
                        : 'Permite el acceso a tu ubicación para ordenar los eventos comenzando por los más cercanos a ti.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isGeolocationEnabled ? (
                    <button
                      type="button"
                      onClick={disableLocation}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#2A2D34] hover:bg-slate-300 dark:hover:bg-[#343842] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] transition-colors cursor-pointer"
                      title="Desactivar ordenamiento por proximidad"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await requestLocation();
                      }}
                      disabled={geoStatus === 'requesting'}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {geoStatus === 'requesting' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Obteniendo...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5" />
                          Activar GPS
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Active status indicator */}
              {isGeolocationEnabled && geoCoordinates && (
                <div className="mt-3 text-[11px] font-semibold text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/10 px-3 py-2 rounded-xl border border-[#008B8B]/20 dark:border-[#14B8A6]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>
                      GPS Activo: Lat {geoCoordinates.latitude.toFixed(4)}, Lon {geoCoordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await requestLocation();
                    }}
                    className="text-[11px] font-black underline hover:opacity-80 cursor-pointer ml-2"
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Tabs */}
      <div className="px-4 py-6 flex flex-col flex-1">
        <div className="flex bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-2xl p-1 mb-6 shadow-xs">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] shadow-sm'
                : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
            }`}
          >
            {isOwnProfile ? 'Mis Planes' : 'Planes de Actividad'} ({profile.activities.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] shadow-sm'
                : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Planes Creados ({profile.completedActivities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'interests'
                ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] shadow-sm'
                : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Intereses
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300'
              }`}
            >
              <span>🪙 Billetera</span>
            </button>
          )}
        </div>

        {/* Tab Content 1: Plans / Activities */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {profile.activities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <p className="text-slate-500 text-sm mb-4">Aún no hay códigos de planes de esta persona activos.</p>
                <button
                  onClick={() => navigate('/feed')}
                  className="px-5 py-2.5 bg-violet-700 text-white font-extrabold text-xs rounded-xl hover:bg-violet-800 transition-colors shadow"
                >
                  Explorar Feed de Actividades
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    {...activity}
                    imageUrl={activity.imageUrl || `https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=800&q=80`}
                    isJoined={activity.isJoined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Completed Plans & Inner Comments (Ex Opiniones) */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {(!profile.completedActivities || profile.completedActivities.length === 0) ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <p className="text-slate-500 text-sm">Este usuario aún no cuenta con planes completados ni opiniones.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.completedActivities.map((pastAct) => (
                  <div key={pastAct.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {/* Image Header with Title */}
                    <div className="relative h-36 w-full">
                      <img 
                        src={pastAct.imageUrl} 
                        alt={pastAct.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full w-fit uppercase mb-1">
                          Plan Completado • {pastAct.date}
                        </span>
                        <h3 className="font-extrabold text-white text-md tracking-tight leading-tight">{pastAct.title}</h3>
                      </div>
                    </div>

                    {/* Description and rating badge */}
                    <div className="p-4 border-b border-slate-100">
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-3">
                        {pastAct.description}
                      </p>
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-xs font-extrabold text-slate-500 shrink-0">Calificación del plan:</span>
                        <div className="flex gap-0.5">
                          {renderStars(pastAct.rating)}
                        </div>
                        <span className="text-xs font-bold text-slate-900">({pastAct.rating.toFixed(1)})</span>
                      </div>
                    </div>

                    {/* Participant opinions nested */}
                    <div className="p-4 bg-slate-50/25 space-y-3.5">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Comentarios recibidos:</p>
                      {pastAct.reviews.map((rev) => (
                        <div key={rev.id} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                          <img 
                            src={rev.avatarUrl || DEFAULT_AVATAR} 
                            alt={rev.reviewerName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-slate-100 shrink-0 object-cover" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-xs font-extrabold text-slate-900 truncate">{rev.reviewerName}</h4>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">{rev.date}</span>
                            </div>
                            <div className="flex gap-0.5 mb-1.5">
                              {renderStars(rev.rating)}
                            </div>
                            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Interests */}
        {activeTab === 'interests' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Etiquetas e Intereses</h3>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/onboarding')}
                  className="text-xs font-bold text-violet-700 hover:text-violet-800 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Modificar
                </button>
              )}
            </div>

            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {profile.interests.map((interestId) => {
                  const badge = getInterestBadge(interestId);
                  return (
                    <div
                      key={interestId}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-850 border border-emerald-100 rounded-xl text-xs font-bold shadow-sm"
                    >
                      <span className="text-sm">{badge.icon}</span>
                      <span>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs mb-4">No se han seleccionado intereses.</p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="px-4 py-2 bg-violet-700 text-white text-xs font-bold rounded-lg hover:bg-violet-800 transition-colors"
                  >
                    Seleccionar intereses
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
               <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Importancia en ¿Qué Sale?</h4>
               <div className="flex gap-3 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <Heart className="w-5 h-5 text-[#619c77] shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                     La coincidencia de intereses entre el Anfitrión y el grupo promueve actividades fluidas y seguras en la plataforma.
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Billetera & Historial SaleCoins */}
        {activeTab === 'wallet' && isOwnProfile && (
          <div className="space-y-5">
            {/* Wallet Overview Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-100">
                    🪙 Saldo Disponible
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-black">{balance}</span>
                    <span className="text-sm font-bold text-amber-100">SaleCoins</span>
                  </div>
                  <p className="text-xs text-amber-100/90 mt-1">
                    Equivalente a aprox. <strong>S/ {(balance * 0.1).toFixed(2)}</strong> • Alcanza para <strong>{Math.floor(balance / 20)} salidas confirmadas</strong>
                  </p>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsRechargeOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-amber-900 rounded-xl text-xs font-black shadow hover:bg-amber-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Recargar monedas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExplanationOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all text-center"
                  >
                    ¿Cómo funciona?
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Rules Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold block mb-0.5">
                  🎁 100 de Bienvenida
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Gratis al crear tu cuenta para probar tus primeras salidas.
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-amber-700 dark:text-amber-400 font-extrabold block mb-0.5">
                  🛡️ 20 / 30 Monedas
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Costo por unirse (20) o crear (30) para evitar no-shows.
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-blue-700 dark:text-blue-400 font-extrabold block mb-0.5">
                  🔄 Reembolso 100%
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Si el plan se cancela, tus monedas se devuelven al instante.
                </span>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  <span>Historial de Movimientos</span>
                </h4>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTxFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      txFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('credit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      txFilter === 'credit'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}
                  >
                    Ingresos (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('debit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      txFilter === 'debit'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}
                  >
                    Gastos (-)
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              {(() => {
                const filteredTx = transactions.filter((tx) => {
                  if (txFilter === 'credit') return tx.type === 'credit';
                  if (txFilter === 'debit') return tx.type === 'debit';
                  return true;
                });

                if (filteredTx.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No hay transacciones registradas en este filtro.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredTx.map((tx) => {
                      const isCredit = tx.type === 'credit';
                      const formattedDate = new Date(tx.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                            }`}>
                              {isCredit ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {tx.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                {tx.description}
                              </p>
                              <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                                {formattedDate}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <span className={`text-sm font-black ${
                              isCredit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {isCredit ? '+' : '-'}{tx.amount}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              SaleCoins
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Community & Legal info button in profile */}
        <div className="mt-8 pt-6 pb-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center gap-2">
          <p className="text-xs text-slate-400">¿Qué Sale? • Comunidad de salidas y planes</p>
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="text-xs font-bold text-[#619c77] hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ver Términos y Condiciones del Servicio</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E2025] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#DDE1E5] dark:border-[#2A2D34] overflow-hidden relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE1E5] dark:border-[#2A2D34] mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#1C1E21] dark:text-[#F3F4F6] text-base">Editar Perfil</h3>
                  <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">Actualiza tu foto, nombre y biografía</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-full text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#121316] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Avatar Preview & Upload */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#EFEFF1]/60 dark:bg-[#121316]/60 border border-[#DDE1E5] dark:border-[#2A2D34] text-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full ring-4 ring-[#008B8B]/30 dark:ring-[#14B8A6]/40 overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-md">
                    <img 
                      src={editAvatarUrl || DEFAULT_AVATAR} 
                      alt="Vista previa" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                    title="Subir foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden" 
                />

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] hover:border-[#008B8B] hover:text-[#008B8B] dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde dispositivo</span>
                  </button>
                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarUrl('')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>

              {/* Name field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Nombre visible
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tu nombre o apodo"
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-2 focus:ring-[#008B8B]/20"
                />
              </div>

              {/* Bio field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
                    Descripción / Biografía
                  </label>
                  <span className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] font-medium">
                    {editBio.length}/250
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Cuéntale al grupo qué te gusta hacer, tus salidas favoritas o tu estilo de vida..."
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] p-3.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-2 focus:ring-[#008B8B]/20 resize-none"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#65676B] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2.5 rounded-xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white text-xs font-bold shadow-md shadow-[#FF5733]/25 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Wallet Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
      <SaleCoinsExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
      />
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <BottomNav activeTab={isOwnProfile ? "profile" : "feed"} />
    </div>
  );
}
