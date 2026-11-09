import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useActivityDetail, useJoinActivity, useCancelActivity } from "../hooks/useActivities";
import { ErrorBoundary } from "react-error-boundary";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  Star,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import PlanMap from "../components/shared/PlanMap";
import { getHostForActivity } from "../hooks/useUsers";
import { useWalletStore } from "../store/walletStore";
import { useNotificationStore } from "../store/notificationStore";
import { SaleCoinsBadge } from "../components/wallet/SaleCoinsBadge";
import { RechargeModal } from "../components/wallet/RechargeModal";
import { SaleCoinsExplanationModal } from "../components/wallet/SaleCoinsExplanationModal";
import { NotificationBell } from "../components/notifications/NotificationBell";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="bg-red-50 text-red-800 p-4 flex flex-col items-center justify-center min-h-[50vh] text-center border-b border-red-200">
      <p className="font-semibold mb-2">Error al cargar el detalle</p>
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

export default function ActivityDetailWrapper() {
  const { id } = useParams();
  const { refetch } = useActivityDetail(id || "");
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={refetch}>
      <ActivityDetail id={id!} />
    </ErrorBoundary>
  );
}

function ActivityDetail({ id }: { id: string }) {
  const { data: activity, isLoading } = useActivityDetail(id);
  const { mutate: joinActivity } = useJoinActivity();
  const { mutate: cancelActivity, isPending: isCancelling } = useCancelActivity();
  const { user: currentUser } = useAuthStore();
  const { balance, canAfford } = useWalletStore();
  const navigate = useNavigate();

  // Local optimistic state overlay
  const [localError, setLocalError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Cargando detalles...
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-8 text-center text-slate-500">
        Actividad no encontrada.
      </div>
    );
  }

  const handleJoin = () => {
    setLocalError("");
    if (!activity.isJoined && !canAfford(20)) {
      setIsRechargeOpen(true);
      return;
    }
    joinActivity(id, {
      onError: (err) => {
        if (err.message && err.message.includes('SALECOINS_INSUFFICIENT')) {
          setIsRechargeOpen(true);
        } else {
          setLocalError(
            err.message || "Error al unirse a la actividad. Inténtalo de nuevo.",
          );
          setTimeout(() => setLocalError(""), 5000);
        }
      },
    });
  };

  const handleCancelActivity = () => {
    cancelActivity(id, {
      onSuccess: () => {
        setShowCancelConfirm(false);
      },
      onError: (err) => {
        setLocalError(err.message || "Error al cancelar la salida.");
      }
    });
  };

  const isCreatedByUser = id.startsWith("new-");
  const host =
    isCreatedByUser && currentUser
      ? {
          id: currentUser.id || "me",
          name: currentUser.name || "Tú",
          avatarUrl: currentUser.avatarUrl,
          badge: "Anfitrión Principal",
          rating: 5.0,
          reviewsCount: 3,
        }
      : getHostForActivity(id);

  const parsedDate = new Date(activity.date);
  const formattedDay = parsedDate.getDate();
  const formattedMonth = parsedDate.toLocaleString("es-ES", { month: "long" });

  return (
    <div className="pb-24 max-w-3xl mx-auto bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen transition-colors">
      {/* Top Bar overlay */}
      <div className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-4 py-3 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md max-w-3xl mx-auto border-b border-[#DDE1E5] dark:border-[#2A2D34]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#008B8B] dark:text-[#14B8A6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">
          Detalle de Actividad
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <NotificationBell />
          <SaleCoinsBadge />
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF] transition-colors cursor-pointer">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {localError && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-3xl mx-auto bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium">{localError}</span>
          <button
            onClick={() => setLocalError("")}
            className="text-white/80 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative h-72 w-full mt-14 bg-slate-900 border-b border-slate-100 overflow-hidden">
        {activity.imageUrl && !imageError ? (
          <img
            src={activity.imageUrl}
            alt={activity.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${
              activity.category.toLowerCase() === "sports" ||
              activity.category.toLowerCase() === "deportes"
                ? "from-emerald-400 to-teal-600"
                : activity.category.toLowerCase() === "tech" ||
                    activity.category.toLowerCase() === "tecnología"
                  ? "from-slate-800 to-indigo-950"
                  : activity.category.toLowerCase() === "creative" ||
                      activity.category.toLowerCase() === "creatividad"
                    ? "from-amber-400 to-rose-500"
                    : activity.category.toLowerCase() === "cultura" ||
                      activity.category.toLowerCase() === "cultura / historia" ||
                      activity.category.toLowerCase() === "cultura / arte"
                      ? "from-amber-500 to-orange-600"
                      : activity.category.toLowerCase() === "gastronomía"
                        ? "from-orange-500 to-red-600"
                        : activity.category.toLowerCase() === "bienestar"
                          ? "from-blue-400 to-teal-500"
                          : activity.category.toLowerCase() === "naturaleza / relax"
                            ? "from-emerald-500 to-teal-500"
                            : activity.category.toLowerCase() === "aventura / naturaleza"
                              ? "from-green-600 to-emerald-800"
                              : activity.category.toLowerCase() === "entretenimiento / noche"
                                ? "from-indigo-900 to-purple-900"
                                : activity.category.toLowerCase() === "networking"
                                  ? "from-violet-600 to-fuchsia-600"
                                  : "from-slate-500 to-slate-700"
            } text-white font-sans relative`}
          >
            <span className="text-7xl mb-2 animate-pulse">
              {activity.category.toLowerCase() === "sports" ||
              activity.category.toLowerCase() === "deportes"
                ? "⚽"
                : activity.category.toLowerCase() === "tech" ||
                    activity.category.toLowerCase() === "tecnología"
                  ? "💻"
                  : activity.category.toLowerCase() === "creative" ||
                      activity.category.toLowerCase() === "creatividad"
                    ? "🎨"
                    : activity.category.toLowerCase() === "cultura" ||
                      activity.category.toLowerCase() === "cultura / historia" ||
                      activity.category.toLowerCase() === "cultura / arte"
                      ? "🎭"
                      : activity.category.toLowerCase() === "gastronomía"
                        ? "🍕"
                        : activity.category.toLowerCase() === "bienestar"
                          ? "🧘"
                          : activity.category.toLowerCase() === "naturaleza / relax"
                            ? "🌳"
                            : activity.category.toLowerCase() === "aventura / naturaleza"
                              ? "⛰️"
                              : activity.category.toLowerCase() === "entretenimiento / noche"
                                ? "✨"
                                : activity.category.toLowerCase() === "networking"
                                  ? "🤝"
                                  : "📅"}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold tracking-wider rounded-md uppercase mb-3 shadow-sm">
            {activity.category}
          </span>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {activity.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date & Time Widgets */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs bg-white dark:bg-[#1E2025]">
            <div className="w-10 h-10 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#65676B] dark:text-[#9CA3AF] uppercase tracking-wider mb-0.5">
                Fecha
              </p>
              <p className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">
                {formattedDay}
              </p>
              <p className="text-xs font-semibold text-[#65676B] dark:text-[#9CA3AF] capitalize">
                {formattedMonth}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs bg-white dark:bg-[#1E2025]">
            <div className="w-10 h-10 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#65676B] dark:text-[#9CA3AF] uppercase tracking-wider mb-0.5">
                Hora
              </p>
              <p className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">
                {activity.time}
              </p>
            </div>
          </div>
        </div>

        {/* Cancelled Banner if applicable */}
        {activity.isCancelled && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm">Salida Cancelada por el Organizador</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Esta salida fue cancelada. Las SaleCoins de todos los integrantes inscritos han sido reembolsadas automáticamente a sus billeteras en la app (garantía 100% de devolución).
              </p>
            </div>
          </div>
        )}

        {/* SaleCoins Commitment & Guarantee Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/90 dark:border-amber-900/50 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                🪙
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Reserva y Compromiso
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 text-[11px] font-black">
                    20 SaleCoins (~S/ 2.00)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Para evitar el absentismo (<strong className="text-amber-800 dark:text-amber-400">no-show</strong>) y asegurar que el grupo salga completo, unirte reserva 20 SaleCoins.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Garantía de reembolso: Si se cancela por el organizador o local, tus monedas se devuelven intactas.</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsExplanationOpen(true)}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 underline shrink-0 mt-0.5"
            >
              ¿Cómo funciona?
            </button>
          </div>
        </div>

        {/* Creator Management Box if User is Organizer */}
        {isCreatedByUser && !activity.isCancelled && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  <span>Eres el organizador de este plan</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Si te surge un imprevisto, puedes cancelar el plan para devolver las SaleCoins a todos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-xs font-bold transition-colors shrink-0"
              >
                Cancelar salida
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">¿Deseas probar la alerta de nuevo miembro?</span>
              <button
                type="button"
                onClick={() => useNotificationStore.getState().simulateNewMember({ planId: activity.id, planTitle: activity.title })}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simular nuevo miembro</span>
              </button>
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#008B8B] dark:text-[#14B8A6] mb-3">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Ubicación</h3>
          </div>
          <div className="rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] overflow-hidden shadow-xs bg-white dark:bg-[#1E2025]">
            <div className="p-4 bg-white dark:bg-[#1E2025] border-b border-[#DDE1E5] dark:border-[#2A2D34]">
              <p className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">{activity.location}</p>
              <p className="text-sm text-[#65676B] dark:text-[#9CA3AF]">
                Punto de encuentro seguro
              </p>
            </div>
            {showInteractiveMap ? (
              <PlanMap address={activity.location} heightClass="h-64" />
            ) : (
              <div className="h-32 bg-[#EFEFF1] dark:bg-[#121316] relative flex items-center justify-center">
                <button
                  onClick={() => setShowInteractiveMap(true)}
                  className="relative z-10 px-5 py-2.5 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-full text-xs font-black shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  Ver en mapa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#1C1E21] dark:text-[#F3F4F6] mb-3">
            Sobre la actividad
          </h3>
          <p className="text-[#65676B] dark:text-[#9CA3AF] leading-relaxed text-sm">
            {activity.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold">
              #Networking
            </span>
            <span className="px-3 py-1 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold">
              #Comunidad
            </span>
          </div>
        </div>

        {/* Host Info Section */}
        <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-3 block">
            Anfitrión / Organizador
          </h3>
          <div
            onClick={() => {
              const hostRouteId = isCreatedByUser ? "me" : `host-${id}`;
              navigate(`/profile/${hostRouteId}`);
            }}
            className="flex items-center gap-4 bg-[#EFEFF1]/60 dark:bg-[#121316]/60 p-3.5 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs cursor-pointer hover:border-[#008B8B] transition-all group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[#008B8B]/30 overflow-hidden relative shrink-0">
              <img
                src={
                  host.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name}`
                }
                alt={host.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-extrabold text-sm text-[#1C1E21] dark:text-[#F3F4F6] group-hover:text-[#008B8B] dark:group-hover:text-[#14B8A6] transition-colors truncate">
                  {host.name}
                </p>
                <span className="bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[9px] font-black rounded px-1.5 py-0.5 tracking-wide uppercase shrink-0">
                  {host.badge || "Anfitrión"}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/10 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  Anfitrión verificado ✓
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-white dark:bg-[#1E2025] rounded-lg group-hover:text-[#008B8B] text-[#65676B] dark:text-[#9CA3AF] transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Quién asiste</h3>
            <span className="text-xs font-semibold text-[#008B8B] dark:text-[#14B8A6]">
              {activity.currentAttendees} personas
            </span>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
            {[...Array(Math.min(activity.currentAttendees, 5))].map((_, i) => {
              const mockAvatarUrls = [
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80",
                "https://images.unsplash.com/photo-1531123897727-8f129e1eb1e2?auto=format&fit=crop&w=150&h=150&q=80",
              ];
              const mockNames = ["Laura", "Diego", "Ana", "Miguel", "Sofía"];
              const avatar =
                i === 0 && activity.isJoined && currentUser?.avatarUrl
                  ? currentUser.avatarUrl
                  : mockAvatarUrls[i % mockAvatarUrls.length];
              const attendeeName =
                i === 0 && activity.isJoined && currentUser?.name
                  ? currentUser.name.split(" ")[0]
                  : mockNames[i % mockNames.length];

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm relative">
                    <img
                      src={avatar}
                      alt="Attendee"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-medium truncate max-w-[60px] text-center">
                    {attendeeName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-t border-[#DDE1E5] dark:border-[#2A2D34] pb-safe z-40 max-w-3xl mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
        {activity.isCancelled ? (
          <div className="w-full py-3.5 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-[#65676B] dark:text-[#9CA3AF] text-center border border-[#DDE1E5] dark:border-[#2A2D34]">
            Salida cancelada • SaleCoins reembolsadas
          </div>
        ) : activity.isJoined ? (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => navigate(`/chat/${id}`)}
              className="flex-1 py-3.5 bg-[#008B8B] hover:bg-[#007575] dark:bg-[#14B8A6] dark:hover:bg-[#0D9488] text-white rounded-2xl text-sm font-black shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              Coordinar con el grupo
            </button>
            <button
              onClick={handleJoin}
              className="px-4 py-3.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-2xl text-xs font-black transition-all shrink-0 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 flex flex-col items-center justify-center leading-tight cursor-pointer"
              title="Abandonar grupo y recuperar 20 SaleCoins"
              id="abandonar-plan-btn"
            >
              <span>Salir</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">+20 🪙</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            className="w-full py-3.5 rounded-2xl text-base font-black shadow-lg shadow-[#FF5733]/25 transition-all flex justify-center items-center gap-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white active:scale-[0.99] cursor-pointer"
          >
            <Users className="w-5 h-5" />
            <span>Unirse al grupo • 20 SaleCoins</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal to cancel activity */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-white dark:bg-[#1E2025] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DDE1E5] dark:border-[#2A2D34] my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">¿Cancelar esta salida?</h3>
              <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-2 leading-relaxed">
                Si cancelas esta salida, todos los asistentes recibirán automáticamente el <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">100% de reembolso de sus 20 SaleCoins</strong> en su billetera.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#65676B] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                No, mantenerla
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelActivity}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                {isCancelling ? 'Cancelando...' : 'Sí, cancelar y reembolsar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        requiredAmount={20}
      />
      <SaleCoinsExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
      />
    </div>
  );
}
