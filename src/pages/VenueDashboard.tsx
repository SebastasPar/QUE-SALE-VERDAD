import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Users,
  Calendar,
  MapPin,
  MessageSquare,
  Eye,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
  Store,
  RefreshCw,
  X,
  Download,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useActivities, Activity } from '../hooks/useActivities';
import { BottomNav } from '../components/shared/bottom-nav';
import { NotificationBell } from '../components/notifications/NotificationBell';

export default function VenueDashboard() {
  const navigate = useNavigate();
  const { user, updateSubscription } = useAuthStore();
  const { data: activities, isLoading } = useActivities();

  const [filterMode, setFilterMode] = useState<'active' | 'all'>('active');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  const venueDetails = user?.venueDetails;
  const subscription = user?.subscription;
  const isSubActive = subscription?.status === 'active';
  const branchesCount = venueDetails?.branchesCount || 1;
  const businessName = venueDetails?.businessName || user?.name || 'Mi Local Aliado';

  // Plans belonging to this venue
  const venuePlans: Activity[] = (activities || []).filter((act) => {
    if (act.creatorId && user?.id && act.creatorId === user.id) return true;
    if (
      user?.id === 'venue-demo-barbarian' &&
      act.organizerType === 'venue' &&
      act.organizerName?.toLowerCase().includes('barbarian')
    ) {
      return true;
    }
    return false;
  });

  const filteredPlans = venuePlans.filter((act) =>
    filterMode === 'active' ? !act.isCancelled : true
  );

  const activePlansCount = venuePlans.filter((a) => !a.isCancelled).length;
  const totalAttendees = venuePlans
    .filter((a) => !a.isCancelled)
    .reduce((sum, a) => sum + (a.currentAttendees || 0), 0);

  const formatRenewDate = (iso?: string) => {
    if (!iso) return 'Próximo mes';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const handleCreatePlanClick = () => {
    if (!isSubActive) {
      setIsSubModalOpen(true);
      return;
    }
    navigate('/activity/create');
  };

  const handleRenewSubscription = async (planId?: 'single' | 'multi') => {
    setIsRenewing(true);
    await new Promise((resolve) => setTimeout(resolve, 750));
    const targetPlanId = planId || subscription?.planId || (branchesCount > 1 ? 'multi' : 'single');
    const isMulti = targetPlanId === 'multi';
    const now = new Date();
    const nextRenewal = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nextReceipt = `B001-${String(Math.floor(100000 + Math.random() * 899999))}`;

    updateSubscription({
      status: 'active',
      planId: targetPlanId,
      planName: isMulti ? 'Plan Multisede' : 'Plan Sede Única',
      monthlyPricePen: isMulti ? 179 : 99,
      activatedAt: now.toISOString(),
      renewsAt: nextRenewal.toISOString(),
      receiptNumber: nextReceipt,
    });
    setIsRenewing(false);
  };

  const handleDownloadReceipt = () => {
    setReceiptDownloaded(true);
    setTimeout(() => setReceiptDownloaded(false), 3000);
  };

  return (
    <div className="bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen pb-24 max-w-3xl mx-auto transition-colors">
      {/* Top Commercial Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 sm:px-6 py-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/30 dark:border-[#14B8A6]/30 overflow-hidden flex items-center justify-center shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={businessName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-[#008B8B] dark:text-[#14B8A6]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] truncate">
                  {businessName}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase shrink-0">
                  🏢 Local Aliado
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF] font-semibold flex-wrap">
                <span>{venueDetails?.venueCategory || 'Establecimiento'}</span>
                <span>•</span>
                <span className="text-[#008B8B] dark:text-[#14B8A6] font-extrabold">
                  {branchesCount} {branchesCount === 1 ? 'sede registrada' : 'sedes registradas'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-3 py-1.5 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] hover:border-[#008B8B] transition-colors cursor-pointer"
            >
              Mi Local
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-5">
        {/* Subscription Status Banner */}
        <section
          id="venue-subscription-banner"
          className={`rounded-3xl p-5 border shadow-xs transition-all ${
            isSubActive
              ? 'bg-gradient-to-br from-[#008B8B] to-[#006666] dark:from-[#0f766e] dark:to-[#115e59] text-white border-[#008B8B]/30'
              : 'bg-gradient-to-br from-rose-600 to-rose-700 text-white border-rose-500'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
                  {isSubActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Suscripción Activa
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {subscription?.status === 'past_due' ? 'Renovación Pendiente' : 'Suscripción Inactiva'}
                    </>
                  )}
                </span>
                <span className="text-xs font-bold text-white/90">
                  {subscription?.planName || 'Plan Sede Única'} • S/ {subscription?.monthlyPricePen || 99}/mes
                </span>
              </div>

              <p className="text-sm font-bold text-white/95">
                {isSubActive
                  ? `Próxima renovación: ${formatRenewDate(subscription?.renewsAt)}`
                  : 'Renueva tu suscripción mensual para volver a publicar nuevos planes grupales.'}
              </p>

              <p className="text-[11px] text-white/85 leading-relaxed">
                Sin SaleCoins: Como local aliado publicas planes directamente con tu suscripción mensual y{' '}
                <strong>no ocupas cupo</strong> en las salidas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSubModalOpen(true)}
              id="manage-subscription-btn"
              className="px-4 py-2.5 rounded-xl bg-white text-[#1C1E21] hover:bg-slate-100 text-xs font-black shadow-sm transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#008B8B]" />
              <span>{isSubActive ? 'Gestionar Suscripción' : 'Renovar Ahora'}</span>
            </button>
          </div>
        </section>

        {/* Commercial KPIs */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#1E2025] rounded-2xl p-3.5 border border-[#DDE1E5] dark:border-[#2A2D34] text-center shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
              Planes Activos
            </p>
            <p className="text-2xl font-black text-[#008B8B] dark:text-[#14B8A6] mt-1">
              {activePlansCount}
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E2025] rounded-2xl p-3.5 border border-[#DDE1E5] dark:border-[#2A2D34] text-center shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
              Inscritos Totales
            </p>
            <p className="text-2xl font-black text-[#FF5733] dark:text-[#FF6B4A] mt-1">
              {totalAttendees}
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E2025] rounded-2xl p-3.5 border border-[#DDE1E5] dark:border-[#2A2D34] text-center shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
              Locales / Sedes
            </p>
            <p className="text-2xl font-black text-[#1C1E21] dark:text-[#F3F4F6] mt-1">
              {branchesCount}
            </p>
          </div>
        </section>

        {/* Primary Action CTA: Create and Publish Plan */}
        <button
          type="button"
          id="venue-create-plan-cta"
          onClick={handleCreatePlanClick}
          className="w-full py-4 px-5 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-lg shadow-[#FF5733]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Crear y Publicar Nuevo Plan</span>
        </button>

        {/* Published Plans List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                Planes Publicados por mi Local
              </h2>
              <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                Gestiona tus convocatorias, aforos y chats de coordinación.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-[#1E2025] p-1 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34]">
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterMode === 'active'
                    ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316]'
                    : 'text-[#65676B] dark:text-[#9CA3AF]'
                }`}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316]'
                    : 'text-[#65676B] dark:text-[#9CA3AF]'
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#1E2025] rounded-2xl p-5 border border-[#DDE1E5] dark:border-[#2A2D34] animate-pulse space-y-3"
                >
                  <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="bg-white dark:bg-[#1E2025] rounded-3xl border border-[#DDE1E5] dark:border-[#2A2D34] p-8 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                Aún no has publicado planes en tu local
              </h3>
              <p className="text-xs sm:text-sm text-[#65676B] dark:text-[#9CA3AF] max-w-sm mx-auto mt-1.5 leading-relaxed">
                Crea tu primera experiencia grupal (cata, noche temática, tarde de café o torneo). Los jóvenes verán tu plan en el Feed y reservarán su cupo sin que tu local ocupe espacio.
              </p>
              <button
                type="button"
                onClick={handleCreatePlanClick}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#FF5733] hover:bg-[#E04826] text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                + Publicar mi primer plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => {
                const occupancyPct = plan.maxAttendees
                  ? Math.min(100, Math.round((plan.currentAttendees / plan.maxAttendees) * 100))
                  : 0;

                return (
                  <div
                    key={plan.id}
                    className="bg-white dark:bg-[#1E2025] rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] p-4 sm:p-5 shadow-xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[10px] font-black uppercase">
                            {plan.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              plan.isCancelled
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {plan.isCancelled ? 'Cancelado' : 'Publicado'}
                          </span>
                          {plan.discountOffer && (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                              🎁 {plan.discountOffer}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-snug">
                          {plan.title}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#65676B] dark:text-[#9CA3AF] font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                            {plan.date} • {plan.time}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                            <span className="truncate">{plan.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy progress bar */}
                    <div className="p-3 rounded-xl bg-[#EFEFF1]/70 dark:bg-[#121316]/70 border border-[#DDE1E5] dark:border-[#2A2D34]">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#1C1E21] dark:text-[#F3F4F6]">
                          <Users className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                          Cupos reservados: {plan.currentAttendees} / {plan.maxAttendees}
                        </span>
                        <span className="text-[11px] font-semibold text-[#65676B] dark:text-[#9CA3AF]">
                          El local no ocupa cupo
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-[#008B8B] dark:bg-[#14B8A6] transition-all duration-300"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/activity/${plan.id}`)}
                        className="py-2.5 px-3 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-[#EFEFF1]/60 dark:bg-[#121316] hover:border-[#008B8B] text-xs font-black text-[#1C1E21] dark:text-[#F3F4F6] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" />
                        <span>Ver Detalle / Inscritos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/chat/${plan.id}`)}
                        className="py-2.5 px-3 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 hover:bg-[#008B8B] hover:text-white dark:hover:bg-[#14B8A6] dark:hover:text-[#121316] text-xs font-black text-[#008B8B] dark:text-[#14B8A6] border border-[#008B8B]/25 dark:border-[#14B8A6]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat del Grupo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Subscription Management Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1E2025] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DDE1E5] dark:border-[#2A2D34] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDE1E5] dark:border-[#2A2D34] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1C1E21] dark:text-[#F3F4F6]">
                    Suscripción Mensual B2B
                  </h3>
                  <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                    {businessName} • {branchesCount} {branchesCount === 1 ? 'local' : 'locales'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#65676B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current status box */}
            <div className="p-4 rounded-2xl bg-[#EFEFF1]/70 dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#65676B] dark:text-[#9CA3AF] font-semibold">Estado actual:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                    isSubActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {isSubActive ? 'Activa' : subscription?.status === 'past_due' ? 'Por Vencer' : 'Inactiva'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#65676B] dark:text-[#9CA3AF] font-semibold">Plan contratado:</span>
                <span className="font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                  {subscription?.planName || 'Plan Sede Única'} (S/ {subscription?.monthlyPricePen || 99}/mes)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#65676B] dark:text-[#9CA3AF] font-semibold">Próxima renovación:</span>
                <span className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                  {formatRenewDate(subscription?.renewsAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#65676B] dark:text-[#9CA3AF] font-semibold">Último comprobante:</span>
                <span className="font-bold text-[#008B8B] dark:text-[#14B8A6]">
                  {subscription?.receiptNumber || 'B001-004821'}
                </span>
              </div>
            </div>

            {/* Switch / Upgrade plan */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF]">
                Cambiar o Renovar Plan Mensual
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isRenewing}
                  onClick={() => handleRenewSubscription('single')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    subscription?.planId === 'single'
                      ? 'border-[#008B8B] bg-[#008B8B]/10'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34]'
                  }`}
                >
                  <p className="text-xs font-black">Plan Sede Única</p>
                  <p className="text-sm font-black text-[#008B8B] dark:text-[#14B8A6]">S/ 99 / mes</p>
                </button>
                <button
                  type="button"
                  disabled={isRenewing}
                  onClick={() => handleRenewSubscription('multi')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    subscription?.planId === 'multi'
                      ? 'border-[#FF5733] bg-[#FF5733]/10'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34]'
                  }`}
                >
                  <p className="text-xs font-black">Plan Multisede</p>
                  <p className="text-sm font-black text-[#FF5733] dark:text-[#FF6B4A]">S/ 179 / mes</p>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={isRenewing}
                onClick={() => handleRenewSubscription()}
                className="w-full py-3 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isRenewing ? 'animate-spin' : ''}`} />
                <span>
                  {isRenewing
                    ? 'Procesando renovación Culqi...'
                    : isSubActive
                    ? 'Renovar / Extender Suscripción (+30 días)'
                    : 'Activar Suscripción Mensual Ahora'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full py-2.5 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] hover:bg-slate-50 dark:hover:bg-[#121316] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {receiptDownloaded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Boleta {subscription?.receiptNumber || 'B001-004821'} descargada</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#008B8B]" />
                    <span>Descargar Boleta Electrónica (RUC 20608945123)</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulator for testing status transitions */}
            <div className="pt-3 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-2">
                Simulador de Estado de Cuenta (Demo)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateSubscription({ status: 'active' })}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                >
                  Activa
                </button>
                <button
                  type="button"
                  onClick={() => updateSubscription({ status: 'past_due' })}
                  className="flex-1 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800 cursor-pointer"
                >
                  Por Vencer
                </button>
                <button
                  type="button"
                  onClick={() => updateSubscription({ status: 'canceled' })}
                  className="flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-800 cursor-pointer"
                >
                  Inactiva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="home" />
    </div>
  );
}
