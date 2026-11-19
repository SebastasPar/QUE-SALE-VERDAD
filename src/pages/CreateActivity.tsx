import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activitySchema, ActivityFormValues } from '../schemas/activity.schema';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Rocket, Building2, AlertTriangle, CheckCircle2, Tag } from 'lucide-react';
import {
  Activity,
  MAX_VENUE_PLANS,
  useActivities,
  getStorageActivities,
  saveStorageActivities,
  getUserJoinedIds,
  setUserJoinedIds,
} from '../hooks/useActivities';
import { BottomNav } from '../components/shared/bottom-nav';
import PlanMap from '../components/shared/PlanMap';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { useNotificationStore } from '../store/notificationStore';
import { useLocationStore } from '../store/locationStore';
import { SaleCoinsBadge } from '../components/wallet/SaleCoinsBadge';
import { RechargeModal } from '../components/wallet/RechargeModal';

export default function CreateActivity() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { balance, canAfford, spendCoins } = useWalletStore();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [isRechargeOpen, setIsRechargeOpen] = React.useState(false);

  const isVenue = currentUser?.role === 'venue';
  const isVenueSubActive = currentUser?.subscription?.status === 'active';
  const branchesCount = currentUser?.venueDetails?.branchesCount || 1;
  const { data: activitiesData } = useActivities();
  const venueSourceActivities = activitiesData ?? getStorageActivities();
  const activeVenuePlansCount = isVenue
    ? venueSourceActivities.filter(
        (act) =>
          !act.isCancelled &&
          ((act.creatorId && currentUser?.id && act.creatorId === currentUser.id) ||
            (currentUser?.id === 'venue-demo-barbarian' &&
              act.organizerType === 'venue' &&
              act.organizerName?.toLowerCase().includes('barbarian')))
      ).length
    : 0;
  const hasReachedVenuePlanLimit = isVenue && activeVenuePlansCount >= MAX_VENUE_PLANS;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      category: '',
      location: isVenue ? currentUser?.venueDetails?.address || '' : '',
      price: 0,
      discountOffer: '',
    },
  });

  useEffect(() => {
    if (isVenue && currentUser?.venueDetails?.address) {
      setValue('location', currentUser.venueDetails.address);
    }
  }, [isVenue, currentUser?.venueDetails?.address, setValue]);

  const watchAllFields = watch();

  const formatSpanishDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
      }
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return dateStr;
    }
  };

  const onSubmit = async (data: ActivityFormValues) => {
    if (isVenue) {
      if (!isVenueSubActive || hasReachedVenuePlanLimit) {
        navigate('/venue/dashboard');
        return;
      }
    } else {
      if (!canAfford(30)) {
        setIsRechargeOpen(true);
        return;
      }
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newActivityId = `new-${Date.now()}`;
      const numericPrice = Number(data.price) || 0;
      const venueBusinessName =
        currentUser?.venueDetails?.businessName || currentUser?.name || 'Local Oficial';

      const newActivity: Activity = {
        id: newActivityId,
        title: data.title,
        category: data.category,
        description: data.description,
        date: data.date,
        time: data.time,
        maxAttendees: data.maxAttendees,
        // Critical rule: Venue does NOT count as an attendee or occupy any spot
        currentAttendees: isVenue ? 0 : 1,
        location: data.location,
        isJoined: isVenue ? false : true,
        imageUrl:
          imageUrl ||
          (isVenue
            ? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=800&q=80'),
        organizerType: isVenue ? 'venue' : 'user',
        organizerName: isVenue
          ? `${venueBusinessName} (Local Oficial)`
          : currentUser?.name
          ? `${currentUser.name} (Tú)`
          : 'Tú (Organizador)',
        creatorId: currentUser?.id,
        distanceKm: 0.8,
        latitude: useLocationStore.getState().coordinates?.latitude ?? -12.1219,
        longitude: useLocationStore.getState().coordinates?.longitude ?? -77.0305,
        price: numericPrice,
        priceType: numericPrice > 0 ? 'paid' : 'free',
        discountOffer: isVenue ? data.discountOffer?.trim() || undefined : undefined,
        branchesCount: isVenue ? branchesCount : undefined,
      };

      // Only personal creators occupy a spot in joined list and spend 30 SaleCoins
      if (!isVenue) {
        if (currentUser?.id) {
          const currentJoined = getUserJoinedIds(currentUser.id);
          setUserJoinedIds(currentUser.id, [...currentJoined, newActivityId]);
        }

        spendCoins(
          30,
          'Creación de salida organizada',
          `Compromiso de organizador para "${data.title}" (30 SaleCoins)`,
          'create',
          newActivityId
        );
      }

      const currentStored = getStorageActivities();
      saveStorageActivities([newActivity, ...currentStored]);

      queryClient.setQueryData<Activity[]>(['activities'], (old) => {
        return old ? [newActivity, ...old] : [newActivity];
      });

      queryClient.invalidateQueries({ queryKey: ['activities'] });

      useNotificationStore.getState().scheduleNewMemberForActivity(newActivityId, data.title, 10);

      navigate(`/activity/${newActivityId}`, { replace: true });
    } catch (e) {
      console.error(e);
      alert('Error al publicar el plan.');
    }
  };

  return (
    <div className="bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen pb-24 max-w-3xl mx-auto transition-colors">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-4 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(isVenue ? '/venue/dashboard' : '/feed')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#008B8B] dark:text-[#14B8A6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-[#1C1E21] dark:text-[#F3F4F6]">
            {isVenue ? 'Publicar Plan del Local' : 'Crear Nuevo Plan'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {!isVenue && <SaleCoinsBadge />}
          {isVenue && (
            <span className="px-2.5 py-1 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[11px] font-black">
              🏢 Local Oficial
            </span>
          )}
          <div
            className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer ring-2 ring-[#008B8B] dark:ring-[#14B8A6]"
            onClick={() => navigate('/profile')}
          >
            <img
              src={
                currentUser?.avatarUrl ||
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238596a0' style='background-color:%23dfe5e7'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"
              }
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {isVenue ? (
          <>
            {!isVenueSubActive && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-black text-rose-900 dark:text-rose-200">
                      Tu suscripción mensual no está activa
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                      Renueva tu suscripción desde el Panel del Local para poder publicar nuevos planes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/venue/dashboard')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black shrink-0 cursor-pointer"
                >
                  Renovar
                </button>
              </div>
            )}

            <div className="mb-5 p-4 rounded-2xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 border border-[#008B8B]/25 dark:border-[#14B8A6]/30 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                  <span>Incluido en tu Plan Mensual Empresas (S/ 99/mes)</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#121316] text-[#008B8B] dark:text-[#14B8A6] text-[10px] font-black">
                    {activeVenuePlansCount} / {MAX_VENUE_PLANS} planes activos
                  </span>
                </div>
                <p className="text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
                  Tu suscripción mensual cubre hasta <strong>{MAX_VENUE_PLANS} planes activos</strong>, 1 boost de 3 horas por plan, prioridad cercana (5 km) y chat directo. Tu empresa <strong>no ocupa cupo</strong> en la salida.
                </p>
              </div>
            </div>

            {hasReachedVenuePlanLimit && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-black text-amber-900 dark:text-amber-200">
                      Límite mensual alcanzado ({activeVenuePlansCount}/{MAX_VENUE_PLANS} planes activos)
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                      Tu Plan Mensual Empresas permite un máximo de {MAX_VENUE_PLANS} planes activos. Gestiona tus publicaciones desde el Panel de Empresa.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/venue/dashboard')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-black shrink-0 cursor-pointer"
                >
                  Ver Panel
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mb-5 p-3.5 rounded-2xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
              🪙
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2 font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                <span>Compromiso de Organización: 30 SaleCoins</span>
                <span className="text-[10px] font-black text-[#008B8B] dark:text-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 px-2 py-0.5 rounded-full uppercase">
                  Garantía Anti No-Show
                </span>
              </div>
              <p className="text-[#65676B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                Crear tu propia salida te cuesta <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">30 SaleCoins</strong>. Este cobro actúa como un filtro para asegurar que solo se sumen personas realmente comprometidas a asistir. Si un evento o salida se cancela por culpa del organizador o del local, tus SaleCoins se devuelven automáticamente a tu billetera.
              </p>
            </div>
          </div>
        )}

        <p className="text-[#65676B] dark:text-[#9CA3AF] text-sm mb-6">
          {isVenue
            ? 'Crea una experiencia grupal en tu establecimiento y atrae grupos verificados.'
            : 'Arma tu plan y conoce gente con tus mismos gustos.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
              {isVenue ? 'Nombre del Plan o Experiencia' : 'Nombre de la Actividad'}
            </label>
            <input
              {...register('title')}
              placeholder={isVenue ? 'Ej. Noche de Cata Artesanal & Pizza' : 'Ej. Tarde de Networking'}
              className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
            />
            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Categoría</label>
            <select
              {...register('category')}
              className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all appearance-none"
            >
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Cultura">Cultura</option>
              <option value="Entretenimiento / Noche">Entretenimiento / Noche</option>
              <option value="Bienestar">Bienestar</option>
              <option value="Deportes">Deportes</option>
              <option value="Networking">Networking</option>
              <option value="Creatividad">Creatividad</option>
              <option value="Tecnología">Tecnología</option>
            </select>
            {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Descripción</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder={
                isVenue
                  ? 'Describe la experiencia, qué incluye y el ambiente de tu local...'
                  : 'Describe de qué trata el plan...'
              }
              className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
          </div>

          {isVenue && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                  Precio por Persona (S/)
                </label>
                <input
                  {...register('price')}
                  type="number"
                  min={0}
                  step="1"
                  placeholder="0 (Entrada libre / consumo)"
                  className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
                />
                <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                  Coloca 0 si es ingreso libre con consumo en carta.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" />
                  <span>Beneficio / Descuento Grupal</span>
                </label>
                <input
                  {...register('discountOffer')}
                  type="text"
                  placeholder="Ej. 15% dcto. grupal o trago de bienvenida"
                  className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
              Imagen del Plan (Opcional)
            </label>
            <label className="border-2 border-dashed border-[#DDE1E5] dark:border-[#2A2D34] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E2025] hover:bg-slate-50 dark:hover:bg-[#252830] transition-colors cursor-pointer group relative overflow-hidden h-40">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageChange}
              />
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-[#65676B] dark:text-[#9CA3AF] mb-3 group-hover:text-[#008B8B] transition-colors" />
                  <p className="text-sm font-medium text-[#1C1E21] dark:text-[#F3F4F6] mb-1">
                    Haz clic para subir una imagen o arrastra y suelta
                  </p>
                  <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">JPG, PNG o WebP (Máx. 5MB)</p>
                </>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Fecha</label>
              <input
                {...register('date')}
                type="date"
                className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
              />
              {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Hora</label>
              <input
                {...register('time')}
                type="time"
                className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
              />
              {errors.time && <p className="text-xs text-red-500 font-medium">{errors.time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                {isVenue ? 'Cupos Disponibles para Clientes' : 'Capacidad Máx.'}
              </label>
              <input
                {...register('maxAttendees')}
                type="number"
                placeholder="Ej. 12"
                className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
              />
              {errors.maxAttendees && <p className="text-xs text-red-500 font-medium">{errors.maxAttendees.message}</p>}
              {isVenue && (
                <p className="text-[11px] text-[#008B8B] dark:text-[#14B8A6] font-semibold">
                  Todos estos cupos serán para asistentes (tu local no ocupa ninguno).
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                {isVenue ? 'Sede / Ubicación del Local' : 'Ubicación de la Actividad'}
              </label>
              {isVenue && (
                <span className="text-[11px] font-bold text-[#008B8B] dark:text-[#14B8A6]">
                  {branchesCount} {branchesCount === 1 ? 'sede registrada' : 'sedes registradas'}
                </span>
              )}
            </div>
            <input
              {...register('location')}
              type="text"
              placeholder="Ej. Calle Manuel Bonilla 108, Miraflores"
              className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
            />
            {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location.message}</p>}

            <div className="mt-2">
              <PlanMap
                address={watchAllFields.location || ''}
                mode="select"
                onChangeLocation={(newAddress) => {
                  setValue('location', newAddress, { shouldValidate: true });
                }}
                heightClass="h-56"
              />
            </div>
          </div>

          {/* Preview Block */}
          <div className="bg-white dark:bg-[#1E2025] rounded-2xl p-5 border border-[#DDE1E5] dark:border-[#2A2D34] mt-6 shadow-xs">
            <span className="inline-block px-2.5 py-0.5 bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[10px] font-black tracking-widest rounded-full uppercase mb-3">
              Vista previa
            </span>

            <div className="bg-[#EFEFF1] dark:bg-[#121316] rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] p-4 shadow-xs">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="inline-block px-2 py-0.5 bg-[#008B8B] text-white text-[10px] font-black rounded uppercase">
                      {watchAllFields.category || 'Categoría'}
                    </span>
                    {isVenue && (
                      <span className="inline-block px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded uppercase">
                        🏢 Local
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-sm text-[#1C1E21] dark:text-[#F3F4F6] leading-snug line-clamp-1">
                    {watchAllFields.title || 'Título de tu plan'}
                  </h4>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] capitalize">
                    <span>{watchAllFields.date ? formatSpanishDate(watchAllFields.date) : 'ej. miércoles, 25 de junio'}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                    <span className="truncate font-semibold">
                      {watchAllFields.location || 'Dirección del encuentro'} • {watchAllFields.time || '19:00'}
                    </span>
                  </div>

                  {isVenue && (
                    <p className="mt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      0 / {watchAllFields.maxAttendees || 10} cupos ocupados (tu local no ocupa cupo)
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs">
                  {isVenue ? '🏢' : '📅'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || (isVenue && (!isVenueSubActive || hasReachedVenuePlanLimit))}
              id="publish-activity-btn"
              className="w-full py-4 rounded-2xl font-black transition-all shadow-lg shadow-[#FF5733]/25 flex justify-center items-center gap-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white disabled:opacity-70 disabled:cursor-not-allowed text-base active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                'Publicando...'
              ) : isVenue ? (
                hasReachedVenuePlanLimit ? (
                  <span>Límite alcanzado ({activeVenuePlansCount}/{MAX_VENUE_PLANS} planes)</span>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Publicar Plan ({activeVenuePlansCount}/{MAX_VENUE_PLANS})</span>
                  </>
                )
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Publicar Actividad • 30 SaleCoins</span>
                </>
              )}
            </button>

            {isVenue ? (
              <div className="flex items-center justify-between px-1 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                <span>
                  Plan: <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">Plan Mensual Empresas (S/ 99/mes)</strong>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Incluido en suscripción
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between px-1 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                <span>
                  Tu saldo: <strong className="text-amber-700 dark:text-amber-400 font-black">{balance} SaleCoins</strong>
                </span>
                {balance < 30 ? (
                  <button
                    type="button"
                    onClick={() => setIsRechargeOpen(true)}
                    className="text-[#FF5733] dark:text-[#FF6B4A] hover:underline font-black cursor-pointer"
                  >
                    Recargar monedas
                  </button>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Saldo suficiente
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {!isVenue && (
        <RechargeModal
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
          requiredAmount={30}
        />
      )}

      <BottomNav activeTab="create" />
    </div>
  );
}
