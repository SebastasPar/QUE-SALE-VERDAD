import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Calendar, 
  Compass, 
  Flame, 
  MapPin, 
  Award,
  PartyPopper,
  ChevronLeft,
  Camera,
  Upload,
  User,
  ShieldCheck,
  Heart,
  Smile,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

interface InterestItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  description: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'sports', label: 'Deporte & Salud' },
  { id: 'social', label: 'Social & Noche' },
  { id: 'food', label: 'Gastronomía & Café' },
  { id: 'culture', label: 'Arte & Cultura' },
  { id: 'nature', label: 'Aire Libre' },
  { id: 'gaming', label: 'Gaming & Tech' },
];

const AVAILABLE_INTERESTS: InterestItem[] = [
  { id: 'football', label: 'Fútbol & Pichangas', icon: '⚽', category: 'sports', description: 'Partidos amistosos y torneos' },
  { id: 'running', label: 'Running & Trote', icon: '🏃', category: 'sports', description: 'Salidas matutinas y 5k/10k' },
  { id: 'fitness', label: 'Gym & Calistenia', icon: '🏋️', category: 'sports', description: 'Entrenar juntos y motivación' },
  { id: 'yoga', label: 'Yoga & Pilates', icon: '🧘', category: 'sports', description: 'Desconexión y estiramientos' },
  
  { id: 'bars', label: 'Bares & Cócteles', icon: '🍹', category: 'social', description: 'After office y fines de semana' },
  { id: 'boardgames', label: 'Juegos de Mesa', icon: '🎲', category: 'social', description: 'Tardes de Catan, Dixit y risas' },
  { id: 'karaoke', label: 'Fiesta & Karaoke', icon: '🎤', category: 'social', description: 'Planes nocturnos y música' },

  { id: 'coffee', label: 'Cafés de Especialidad', icon: '☕', category: 'food', description: 'Probar nuevos huariques y charlar' },
  { id: 'cooking', label: 'Gastronomía & Cenas', icon: '🍳', category: 'food', description: 'Compartir comida y postres' },
  { id: 'streetfood', label: 'Foodies & Street Food', icon: '🍔', category: 'food', description: 'Rutas de hamburguesas y pizzas' },

  { id: 'cinema', label: 'Cine & Series', icon: '🎬', category: 'culture', description: 'Estrenos, debates y cineclub' },
  { id: 'art', label: 'Museos & Galerías', icon: '🎨', category: 'culture', description: 'Exposiciones y ferias culturales' },
  { id: 'music', label: 'Conciertos & Festivales', icon: '🎵', category: 'culture', description: 'Música en vivo y toquines' },
  { id: 'reading', label: 'Club de Lectura', icon: '📖', category: 'culture', description: 'Libros, charlas y café' },

  { id: 'trekking', label: 'Trekking & Montaña', icon: '🥾', category: 'nature', description: 'Rutas de senderismo y acampada' },
  { id: 'cycling', label: 'Ciclismo Urbano', icon: '🚴', category: 'nature', description: 'Paseos en bici por la ciudad' },
  { id: 'photography', label: 'Fotografía Urbana', icon: '📷', category: 'nature', description: 'Safaris fotográficos y paseos' },

  { id: 'gaming', label: 'Gaming & eSports', icon: '🎮', category: 'gaming', description: 'PC, consola y practical online/presencial' },
  { id: 'tech', label: 'Tecnología & Startups', icon: '💻', category: 'gaming', description: 'Charlas tech, IA y networking' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setInterests, setProfileDetails, completeOnboarding } = useAuthStore();
  
  // Steps: 2 (Interests), 3 (Profile photo & Bio), 4 (Celebration & Ready)
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Profile details state (Step 3)
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = user?.name?.trim() || 'Aventurero';

  // Handling interests selection
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const filteredInterests = AVAILABLE_INTERESTS.filter((interest) => {
    const matchesSearch = interest.label.toLowerCase().includes(search.toLowerCase()) ||
                          interest.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || interest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isInterestsValid = selectedInterests.length >= 3 && selectedInterests.length <= 5;

  const handleGoToProfileStep = () => {
    if (isInterestsValid) {
      setInterests(selectedInterests);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Image upload handler via FileReader
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
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileAndFinish = () => {
    setProfileDetails({ avatarUrl, bio });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipProfile = () => {
    // Save empty or unchanged profile details and advance
    setProfileDetails({ avatarUrl, bio });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOnboarding = () => {
    completeOnboarding();
    navigate('/feed', { replace: true });
  };

  // Get dynamic encouragement text based on selection count
  const getEncouragementText = () => {
    switch (selectedInterests.length) {
      case 0:
        return 'Elige al menos 3 intereses para recomendarte los planes ideales.';
      case 1:
        return '¡Excelente comienzo! Elige 2 más para afinar tus recomendaciones.';
      case 2:
        return '¡Casi lo tienes! Solo 1 más para desbloquear tu feed personalizado.';
      case 3:
      case 4:
        return '¡Gran combinación! Ya sabemos exactamente qué planes te van a encantar.';
      case 5:
        return '¡Selección completa! Tienes un perfil súper variado y atractivo.';
      default:
        return '';
    }
  };

  const selectedItemsDetails = AVAILABLE_INTERESTS.filter((item) =>
    selectedInterests.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="w-full bg-white dark:bg-[#1E2025] border-b border-[#DDE1E5] dark:border-[#2A2D34] py-4 px-4 sm:px-8 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center font-black text-xs shadow-xs">
              ¿?
            </div>
            <span className="text-xl font-black text-[#008B8B] dark:text-[#14B8A6] tracking-tight">
              ¿Qué Sale?
            </span>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
              <span className="w-6 h-6 rounded-full bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center font-black text-xs shadow-2xs">
                {currentStep === 4 ? 3 : currentStep}
              </span>
              <span>
                {currentStep === 2 && 'Paso 2: Intereses'}
                {currentStep === 3 && 'Paso 3: Tu Perfil'}
                {currentStep === 4 && '¡Todo Listo!'}
              </span>
            </div>
            <div className="w-16 sm:w-28 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#008B8B] dark:bg-[#14B8A6] transition-all duration-500 rounded-full"
                style={{ 
                  width: currentStep === 2 ? '50%' : currentStep === 3 ? '85%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        
        {/* ============================================================== */}
        {/* STEP 2: INTERESTS SELECTION                                    */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="flex flex-col flex-1">
            
            {/* Encouraging Hero Banner */}
            <div className="mb-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/20 dark:border-[#14B8A6]/30 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <span>La comunidad donde siempre hay algo que hacer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight">
                ¿Qué te gustaría hacer este fin de semana, {userName}?
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] dark:text-[#9CA3AF] max-w-2xl">
                Selecciona entre <strong className="text-[#008B8B] dark:text-[#14B8A6] font-bold">3 y 5 intereses</strong>. Con esto filtraremos los planes de tu zona para que nunca te falte compañía ni diversión.
              </p>
            </div>

            {/* Dynamic Motivation & Counter Card */}
            <div className={clsx(
              "mb-6 p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs",
              isInterestsValid 
                ? "bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 border-[#008B8B]/30 dark:border-[#14B8A6]/40" 
                : "bg-white dark:bg-[#1E2025] border-[#DDE1E5] dark:border-[#2A2D34]"
            )}>
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 transition-colors",
                  isInterestsValid 
                    ? "bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] shadow-xs" 
                    : "bg-slate-100 dark:bg-slate-800 text-[#65676B] dark:text-[#9CA3AF]"
                )}>
                  {isInterestsValid ? <CheckCircle2 className="w-5 h-5 text-white dark:text-[#121316]" /> : `${selectedInterests.length}/5`}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
                    {selectedInterests.length} de 5 seleccionados
                  </p>
                  <p className={clsx(
                    "text-xs sm:text-sm font-bold transition-colors",
                    isInterestsValid ? "text-[#008B8B] dark:text-[#14B8A6]" : "text-[#1C1E21] dark:text-[#F3F4F6]"
                  )}>
                    {getEncouragementText()}
                  </p>
                </div>
              </div>

              {/* Counter Dots */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      idx <= selectedInterests.length
                        ? "bg-[#008B8B] dark:bg-[#14B8A6] scale-110"
                        : "bg-slate-200 dark:bg-slate-800"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar intereses (fútbol, café, juegos, trekking...)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:outline-none focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-2 focus:ring-[#008B8B]/20 text-sm transition-all"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer",
                      selectedCategory === cat.id
                        ? "bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] shadow-xs"
                        : "bg-white dark:bg-[#1E2025] text-[#65676B] dark:text-[#9CA3AF] border border-[#DDE1E5] dark:border-[#2A2D34] hover:border-[#008B8B]"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Grid - Compact Cool Square Tiles */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mb-8">
              {filteredInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer group active:scale-95 select-none min-h-[102px] sm:min-h-[114px]",
                      isSelected
                        ? "border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 shadow-xs ring-2 ring-[#008B8B]/30 dark:ring-[#14B8A6]/30"
                        : "border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] hover:border-[#008B8B] dark:hover:border-[#14B8A6] hover:bg-slate-50 dark:hover:bg-[#252830] hover:shadow-2xs"
                    )}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-150">
                        <CheckCircle2 className="w-3 h-3 text-white dark:text-[#121316]" />
                      </div>
                    )}

                    {/* Emoji / Icon */}
                    <div className={clsx(
                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-2xl mb-1.5 transition-transform duration-200 group-hover:scale-110",
                      isSelected 
                        ? "bg-white dark:bg-[#1E2025] shadow-2xs" 
                        : "bg-slate-100 dark:bg-slate-800"
                    )}>
                      <span className="filter drop-shadow-2xs">{interest.icon}</span>
                    </div>

                    {/* Label */}
                    <span className={clsx(
                      "text-[11px] sm:text-xs font-bold text-center line-clamp-2 leading-tight px-0.5",
                      isSelected 
                        ? "text-[#008B8B] dark:text-[#14B8A6] font-black" 
                        : "text-[#1C1E21] dark:text-[#F3F4F6]"
                    )}>
                      {interest.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Floating Bar */}
            <div className="sticky bottom-4 z-10 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md p-4 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
              <div className="text-xs text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <span>
                  {isInterestsValid 
                    ? '¡Excelente! Ahora personalicemos tu perfil para que tus compañeros te conozcan.' 
                    : `Faltan ${Math.max(0, 3 - selectedInterests.length)} interés(es) para continuar.`}
                </span>
              </div>

              <button
                onClick={handleGoToProfileStep}
                disabled={!isInterestsValid}
                className={clsx(
                  "w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",
                  isInterestsValid
                    ? "bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white shadow-[#FF5733]/25 active:scale-[0.98]"
                    : "bg-slate-200 dark:bg-slate-800 text-[#65676B] dark:text-[#9CA3AF] cursor-not-allowed opacity-60"
                )}
              >
                <span>Continuar al Paso 3: Tu Perfil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: PROFILE PHOTO & BIO (OPTIONAL WITH VALUE ONBOARDING)  */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full">
            
            {/* Header Badge & Title */}
            <div className="mb-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/30 dark:border-[#14B8A6]/40 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <span>La comunidad donde siempre hay algo que hacer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight">
                Personaliza cómo te verán en los planes
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] dark:text-[#9CA3AF]">
                Añadir tu foto y una breve descripción es <strong className="text-[#008B8B] dark:text-[#14B8A6] font-bold">completamente opcional</strong>, pero marca una gran diferencia al unirte a salidas grupales.
              </p>
            </div>

            {/* Educational Onboarding Callout Card */}
            <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-[#1E2025] border border-[#008B8B]/30 dark:border-[#14B8A6]/30 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#008B8B] dark:bg-[#14B8A6] text-white shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] space-y-2">
                  <p className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                    ¿Por qué subir foto y contar algo sobre ti?
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#008B8B] dark:text-[#14B8A6] font-bold">✓</span>
                      <span><strong className="text-[#1C1E21] dark:text-[#F3F4F6]">Reconocimiento fácil:</strong> Al llegar al punto de encuentro (café, cancha o parque), tus compañeros te ubicarán sin confusiones.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#008B8B] dark:text-[#14B8A6] font-bold">✓</span>
                      <span><strong className="text-[#1C1E21] dark:text-[#F3F4F6]">+80% de confianza:</strong> Los organizadores aceptan mucho más rápido solicitudes de perfiles con foto e intereses claros.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#008B8B] dark:text-[#14B8A6] font-bold">✓</span>
                      <span><strong className="text-[#1C1E21] dark:text-[#F3F4F6]">Rompe el hielo:</strong> Tu biografía da pistas para iniciar conversaciones agradables desde el primer minuto.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Profile Form Card */}
            <div className="bg-white dark:bg-[#1E2025] p-6 sm:p-8 rounded-3xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-sm space-y-7">
              
              {/* Photo Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] dark:text-[#F3F4F6]">
                    1. Tu Foto de Perfil <span className="text-[#65676B] dark:text-[#9CA3AF] normal-case font-normal">(Opcional)</span>
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Quitar foto</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#EFEFF1]/60 dark:bg-[#121316]/60 border border-[#DDE1E5] dark:border-[#2A2D34]">
                  {/* Photo Preview Circle */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#008B8B]/30 dark:ring-[#14B8A6]/40 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-md">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Tu foto de perfil" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                          <User className="w-12 h-12 stroke-[1.5]" />
                          <span className="text-[10px] font-bold mt-0.5">Sin foto</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Cambiar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Upload Controls & Presets */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                        {avatarUrl ? '¡Genial! Así te verán en tus salidas' : 'Sube una foto desde tu galería o cámara'}
                      </p>
                      <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-0.5">
                        Formatos JPG, PNG o WebP. Se guarda de inmediato en tu perfil.
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden" 
                    />

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] hover:border-[#008B8B] hover:text-[#008B8B] dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir desde mi dispositivo</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] dark:text-[#F3F4F6]">
                    2. Breve Descripción o Bio <span className="text-[#65676B] dark:text-[#9CA3AF] normal-case font-normal">(Opcional)</span>
                  </label>
                  <span className={clsx(
                    "text-xs font-medium",
                    bio.length > 200 ? "text-amber-500 font-bold" : "text-[#65676B] dark:text-[#9CA3AF]"
                  )}>
                    {bio.length}/250
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ej. Me mudé hace poco a Lima, amo el buen café, las caminatas los domingos y los juegos de mesa. ¡Listo para nuevos planes!"
                    className="block w-full rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-4 py-3 text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 shadow-2xs focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 text-sm transition-all resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer order-3 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a intereses</span>
              </button>

              <button
                type="button"
                onClick={handleSkipProfile}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] font-semibold text-sm transition-colors cursor-pointer order-2"
              >
                Saltar por ahora (opcional)
              </button>

              <button
                type="button"
                onClick={handleSaveProfileAndFinish}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-extrabold text-sm shadow-md shadow-[#FF5733]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-3"
              >
                <span>Guardar y ver mi cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: CELEBRATION & READY TO CONNECT                         */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-4">
            
            {/* Celebration Icon */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF5733] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-[#FF5733]/25">
                <PartyPopper className="w-10 h-10 animate-bounce" />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#008B8B] text-white rounded-full shadow-xs">
                <Award className="w-4 h-4" />
              </span>
            </div>

            {/* Motivational Heading - clearly separated */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/30 dark:border-[#14B8A6]/40 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
              <span>La comunidad donde siempre hay algo que hacer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight">
              ¡Tu cuenta está lista, {userName}!
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#65676B] dark:text-[#9CA3AF] max-w-lg leading-relaxed">
              Solo fueron <span className="font-bold text-[#008B8B] dark:text-[#14B8A6]">3 sencillos pasos</span> para conectar con gente nueva y descubrir planes cerca de ti.
            </p>

            {/* Member Card Preview with Real Uploaded Photo & Bio */}
            <div className="w-full mt-8 p-6 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-md text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#008B8B]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDE1E5] dark:border-[#2A2D34]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full ring-2 ring-[#008B8B]/40 overflow-hidden bg-gradient-to-tr from-[#008B8B] to-[#14B8A6] text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={userName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-[#1C1E21] dark:text-[#F3F4F6] text-base truncate">
                        {userName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#008B8B]/15 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[10px] font-extrabold uppercase">
                        Nuevo
                      </span>
                    </div>
                    <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] truncate">
                      {user?.email || 'Miembro de ¿Qué Sale?'}
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-center px-3 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold flex items-center gap-1.5 border border-[#008B8B]/30 dark:border-[#14B8A6]/30">
                  <span className="w-2 h-2 rounded-full bg-[#008B8B] dark:bg-[#14B8A6] animate-pulse" />
                  <span>Credencial de Miembro</span>
                </div>
              </div>

              {/* Bio display if present */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#EFEFF1]/60 dark:bg-[#121316]/60 border border-[#DDE1E5] dark:border-[#2A2D34]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Tu descripción:
                </p>
                <p className="text-xs text-[#1C1E21] dark:text-[#F3F4F6] italic leading-relaxed">
                  "{bio.trim() || 'Miembro activo de la comunidad ¿Qué Sale?. Me encanta sumarme a planes grupales y conectar con personas con intereses afines.'}"
                </p>
              </div>

              {/* Selected Interests Chips */}
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-2">
                  Tus afinidades principales ({selectedItemsDetails.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedItemsDetails.map((item) => (
                    <span 
                      key={item.id} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1C1E21] dark:text-[#F3F4F6] text-xs font-semibold"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Community Perks snippet */}
              <div className="mt-5 pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-base leading-none">🪙</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">100 SaleCoins listas</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/10 border border-[#008B8B]/20 dark:border-[#14B8A6]/20">
                  <Calendar className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                  <span className="text-[#1C1E21] dark:text-[#F3F4F6]">Acceso ilimitado a planes</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/10 border border-[#008B8B]/20 dark:border-[#14B8A6]/20">
                  <Users className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                  <span className="text-[#1C1E21] dark:text-[#F3F4F6]">Chats grupales activos</span>
                </div>
              </div>
            </div>

            {/* Teaser of plans waiting for you */}
            <div className="w-full mt-6 text-left">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF5733]" />
                  <span>Planes recomendados esperándote hoy:</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] shadow-2xs">☕</span>
                  <div className="text-xs">
                    <p className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Ruta de Cafés & Conversa</p>
                    <p className="text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#65676B]" />
                      <span>Miraflores · Este Sábado 4:00 PM</span>
                    </p>
                    <p className="text-[#008B8B] dark:text-[#14B8A6] font-semibold mt-1">4 personas ya confirmadas</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] shadow-2xs">⚽</span>
                  <div className="text-xs">
                    <p className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Pichanga Amistosa de Jueves</p>
                    <p className="text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#65676B]" />
                      <span>San Isidro · Jueves 7:30 PM</span>
                    </p>
                    <p className="text-[#008B8B] dark:text-[#14B8A6] font-semibold mt-1">Faltan 2 para completar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Editar mi foto / bio</span>
              </button>

              <button
                onClick={handleFinishOnboarding}
                className="w-full flex-1 py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-extrabold text-base shadow-lg shadow-[#FF5733]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
              >
                <span>¡Entrar y descubrir planes ahora!</span>
                <Compass className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
