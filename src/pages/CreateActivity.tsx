import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activitySchema, ActivityFormValues } from '../schemas/activity.schema';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Rocket } from 'lucide-react';
import { Activity, getStorageActivities, saveStorageActivities, getUserJoinedIds, setUserJoinedIds } from '../hooks/useActivities';
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

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      category: '',
    }
  });

  const watchAllFields = watch();

  const formatSpanishDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const onSubmit = async (data: ActivityFormValues) => {
    // Check 30 SaleCoins requirement
    if (!canAfford(30)) {
      setIsRechargeOpen(true);
      return;
    }

    try {
      // Simulate API POST
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newActivityId = `new-${Date.now()}`;
      const newActivity: Activity = {
        id: newActivityId,
        title: data.title,
        category: data.category,
        description: data.description,
        date: data.date,
        time: data.time,
        maxAttendees: data.maxAttendees,
        currentAttendees: 1, // The creator
        location: data.location,
        isJoined: true,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=800&q=80',
        organizerType: 'user',
        organizerName: currentUser?.name ? `${currentUser.name} (Tú)` : 'Tú (Organizador)',
        creatorId: currentUser?.id,
        distanceKm: 0.8,
        latitude: useLocationStore.getState().coordinates?.latitude ?? -12.1219,
        longitude: useLocationStore.getState().coordinates?.longitude ?? -77.0305,
        price: 0,
        priceType: 'free',
      };

      // Add to creator's joined activities
      if (currentUser?.id) {
        const currentJoined = getUserJoinedIds(currentUser.id);
        setUserJoinedIds(currentUser.id, [...currentJoined, newActivityId]);
      }

      // Deduct 30 SaleCoins for creating activity
      spendCoins(
        30,
        'Creación de salida organizada',
        `Compromiso de organizador para "${data.title}" (30 SaleCoins)`,
        'create',
        newActivityId
      );

      // Persist newly created activity so that invalidation retains it!
      const currentStored = getStorageActivities();
      saveStorageActivities([newActivity, ...currentStored]);

      // Optimistic update of the list cache to show immediate feedback on feed
      queryClient.setQueryData<Activity[]>(['activities'], (old) => {
        return old ? [newActivity, ...old] : [newActivity];
      });

      // Invalidate to make sure we fetch real from server next time
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Automatically schedule a simulated community member to join this new activity in ~10s
      useNotificationStore.getState().scheduleNewMemberForActivity(newActivityId, data.title, 10);

      // Navigate to the newly created activity detail
      navigate(`/activity/${newActivityId}`, { replace: true });

    } catch (e) {
      console.error(e);
      alert('Error creating activity layout.');
    }
  };

  return (
    <div className="bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] min-h-screen pb-24 max-w-3xl mx-auto transition-colors">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-4 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/feed')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#008B8B] dark:text-[#14B8A6] transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-[#1C1E21] dark:text-[#F3F4F6]">Crear Nuevo Plan</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <SaleCoinsBadge />
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer ring-2 ring-[#008B8B] dark:ring-[#14B8A6]" onClick={() => navigate('/profile')}>
             <img src={currentUser?.avatarUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238596a0' style='background-color:%23dfe5e7'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Anti No-show Commitment Info Box */}
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

        <p className="text-[#65676B] dark:text-[#9CA3AF] text-sm mb-6 max-w-xs">
           Arma tu plan y conoce gente con tus mismos gustos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
           <div className="space-y-1.5">
             <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Nombre de la Actividad</label>
             <input
               {...register('title')}
               placeholder="Ej. Tarde de Networking"
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
               <option value="Sports">Deportes</option>
               <option value="Creative">Creatividad</option>
               <option value="Tech">Tecnología</option>
               <option value="Networking">Networking</option>
             </select>
             {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
           </div>

           <div className="space-y-1.5">
             <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Descripción</label>
             <textarea
               {...register('description')}
               rows={4}
               placeholder="Describe de qué trata el plan..."
               className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all resize-none"
             />
             {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
           </div>

           <div className="space-y-1.5 pt-2">
              <label className="block text-sm font-bold text-slate-700">Imagen de la Actividad (Opcional)</label>
              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden h-40">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-slate-400 mb-3 group-hover:text-violet-500 transition-colors" />
                      <p className="text-sm font-medium text-slate-600 mb-1">Haz clic para subir una imagen o arrastra y suelta</p>
                      <p className="text-xs text-slate-400">JPG, PNG o WebP (Máx. 5MB)</p>
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

           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Capacidad Máx.</label>
                 <input
                   {...register('maxAttendees')}
                   type="number"
                   placeholder="Ej. 10"
                   className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:ring-1 focus:ring-[#008B8B] sm:text-sm outline-none transition-all"
                 />
                 {errors.maxAttendees && <p className="text-xs text-red-500 font-medium">{errors.maxAttendees.message}</p>}
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="block text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Ubicación de la Actividad</label>
               <input
                 {...register('location')}
                 type="text"
                 placeholder="Ej. Campo de Marte, San Isidro, o haz clic en el mapa"
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
                     <span className="inline-block px-2 py-0.5 bg-[#008B8B] text-white text-[10px] font-black rounded uppercase mb-2">
                       {watchAllFields.category || 'Categoría'}
                     </span>
                     <h4 className="font-black text-sm text-[#1C1E21] dark:text-[#F3F4F6] leading-snug line-clamp-1">
                       {watchAllFields.title || 'Título de tu actividad'}
                     </h4>
                     
                     <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#008B8B] dark:text-[#14B8A6] capitalize">
                       <span>{watchAllFields.date ? formatSpanishDate(watchAllFields.date) : 'ej. miércoles, 25 de junio'}</span>
                     </div>

                     <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                       <span className="truncate font-semibold">{watchAllFields.location || 'San Isidro, o haz clic en el mapa'} • {watchAllFields.time || '18:00'}</span>
                     </div>
                   </div>
                   <div className="w-14 h-14 bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs">
                     {watchAllFields.category === 'Sports' ? '⚽' :
                      watchAllFields.category === 'Creative' ? '🎨' :
                      watchAllFields.category === 'Tech' ? '💻' :
                      watchAllFields.category === 'Networking' ? '🤝' : '📅'}
                   </div>
                 </div>
               </div>
            </div>

           <div className="mt-6 space-y-2">
             <button
               type="submit"
               disabled={isSubmitting}
               className="w-full py-4 rounded-2xl font-black transition-all shadow-lg shadow-[#FF5733]/25 flex justify-center items-center gap-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white disabled:opacity-70 disabled:cursor-not-allowed text-base active:scale-[0.99] cursor-pointer"
             >
               {isSubmitting ? 'Publicando...' : <><Rocket className="w-5 h-5"/> Publicar Actividad • 30 SaleCoins</>}
             </button>
             <div className="flex items-center justify-between px-1 text-xs text-[#65676B] dark:text-[#9CA3AF]">
               <span>Tu saldo: <strong className="text-amber-700 dark:text-amber-400 font-black">{balance} SaleCoins</strong></span>
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
           </div>
        </form>
      </div>

       {/* Recharge Modal */}
       <RechargeModal
         isOpen={isRechargeOpen}
         onClose={() => setIsRechargeOpen(false)}
         requiredAmount={30}
       />

       {/* Navigation Bar */}
       <BottomNav activeTab="create" />
    </div>
  );
}
