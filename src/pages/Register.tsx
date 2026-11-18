import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Compass,
  HeartHandshake,
  ChevronLeft,
  MessageCircle,
  Building2,
  User,
  Store,
  CreditCard,
  Smartphone,
  Receipt,
  Check,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';
import { setUserJoinedIds } from '../hooks/useActivities';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const venueRegisterSchema = z.object({
  businessName: z.string().min(2, 'Ingresa el nombre comercial de tu local'),
  ruc: z.string().regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos numéricos'),
  venueCategory: z.string().min(1, 'Selecciona la categoría de tu local'),
  branchesCount: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debes registrar al menos 1 local')
    .max(100, 'Máximo 100 locales'),
  address: z.string().min(5, 'Ingresa la dirección y distrito del local principal'),
  phone: z.string().regex(/^\d{9}$/, 'Ingresa un celular o WhatsApp de 9 dígitos'),
  email: z.string().email('Por favor ingresa un correo corporativo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type VenueRegisterFormValues = z.infer<typeof venueRegisterSchema>;

type RegisterStep = 'role-select' | 'welcome' | 'form' | 'venue-form' | 'venue-subscription';

const VENUE_CATEGORIES = [
  'Bar / Restobar',
  'Cafetería',
  'Restaurante',
  'Entretenimiento / Juegos',
  'Cultura / Arte',
  'Deporte / Aventura',
];

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<RegisterStep>('role-select');
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Venue flow state
  const [venueDraft, setVenueDraft] = useState<VenueRegisterFormValues | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<'single' | 'multi'>('single');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card'>('yape');
  const [isActivatingSub, setIsActivatingSub] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const {
    register: registerVenue,
    handleSubmit: handleVenueSubmit,
    watch: watchVenue,
    setValue: setVenueValue,
    formState: { errors: venueErrors },
  } = useForm<VenueRegisterFormValues>({
    resolver: zodResolver(venueRegisterSchema) as any,
    defaultValues: {
      businessName: '',
      ruc: '',
      venueCategory: '',
      branchesCount: 1,
      address: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const nameValue = watch('name');
  const passwordValue = watch('password');
  const branchesCountValue = Number(watchVenue('branchesCount') || 1);

  const onSubmitUser = async (data: RegisterFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUserId = `user-${Date.now()}`;
    setUserJoinedIds(newUserId, []);

    login(
      'user-auth-token-active',
      {
        id: newUserId,
        name: data.name.trim(),
        email: data.email.trim(),
        role: 'user',
        avatarUrl: '',
      },
      false
    );
    navigate('/onboarding', { replace: true });
  };

  const onSubmitVenueDetails = (data: VenueRegisterFormValues) => {
    setVenueDraft(data);
    setSelectedPlanId(data.branchesCount > 1 ? 'multi' : 'single');
    setStep('venue-subscription');
  };

  const handleActivateVenueSubscription = async () => {
    if (!venueDraft) return;
    setIsActivatingSub(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const now = new Date();
    const renews = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const receiptNumber = `B001-${String(Math.floor(100000 + Math.random() * 899999))}`;
    const isMulti = selectedPlanId === 'multi';
    const newVenueId = `venue-${Date.now()}`;

    login(
      'venue-auth-token-active',
      {
        id: newVenueId,
        name: venueDraft.businessName.trim(),
        email: venueDraft.email.trim(),
        role: 'venue',
        avatarUrl: '',
        bio: `${venueDraft.venueCategory} aliado en ¿Qué Sale? • ${venueDraft.branchesCount} ${
          venueDraft.branchesCount === 1 ? 'local' : 'locales'
        } en operación.`,
        venueDetails: {
          businessName: venueDraft.businessName.trim(),
          ruc: venueDraft.ruc.trim(),
          venueCategory: venueDraft.venueCategory,
          branchesCount: Number(venueDraft.branchesCount),
          address: venueDraft.address.trim(),
          phone: venueDraft.phone.trim(),
        },
        subscription: {
          status: 'active',
          planId: selectedPlanId,
          planName: isMulti ? 'Plan Multisede' : 'Plan Sede Única',
          monthlyPricePen: isMulti ? 179 : 99,
          activatedAt: now.toISOString(),
          renewsAt: renews.toISOString(),
          receiptNumber,
          paymentMethod: paymentMethod === 'yape' ? 'yape' : 'card',
        },
      },
      true
    );

    setIsActivatingSub(false);
    navigate('/venue/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Brand & Badge Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex flex-col items-center text-center mb-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#008B8B] dark:text-[#14B8A6] hover:opacity-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center shadow-sm text-base font-black group-hover:scale-105 transition-transform">
            ¿?
          </div>
          <span className="text-[#008B8B] dark:text-[#14B8A6]">¿Qué Sale?</span>
        </Link>

        <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/20 dark:border-[#14B8A6]/30 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
          <span>La comunidad donde siempre hay algo que hacer</span>
        </div>
      </div>

      {/* SCREEN 0: SELECCIÓN LOCAL VS PERSONA */}
      {step === 'role-select' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
                ¿Cómo quieres usar ¿Qué Sale??
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] dark:text-[#9CA3AF] max-w-md mx-auto">
                Elige tu tipo de cuenta. Cada perfil tiene una experiencia diseñada a su medida.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Persona */}
              <button
                type="button"
                onClick={() => setStep('welcome')}
                id="select-role-user"
                className="w-full text-left p-5 rounded-2xl border-2 border-[#DDE1E5] dark:border-[#2A2D34] hover:border-[#008B8B] dark:hover:border-[#14B8A6] bg-slate-50/70 dark:bg-[#121316]/70 hover:bg-[#008B8B]/5 dark:hover:bg-[#14B8A6]/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#008B8B]/15 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] text-[11px] font-black">
                        👤 Para Personas (18-35 años)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                        🎁 100 SaleCoins gratis
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] group-hover:text-[#008B8B] dark:group-hover:text-[#14B8A6] transition-colors">
                      Quiero descubrir y unirme a planes
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
                      Explora salidas grupales cerca de ti, conoce gente nueva, chatea con el grupo y arma tus propios planes.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#008B8B] dark:text-[#14B8A6]">
                      <span>Continuar como Persona</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Local / Negocio */}
              <button
                type="button"
                onClick={() => setStep('venue-form')}
                id="select-role-venue"
                className="w-full text-left p-5 rounded-2xl border-2 border-[#DDE1E5] dark:border-[#2A2D34] hover:border-[#FF5733] dark:hover:border-[#FF6B4A] bg-amber-50/40 dark:bg-amber-950/15 hover:bg-[#FF5733]/5 dark:hover:bg-[#FF6B4A]/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5733]/15 dark:bg-[#FF6B4A]/20 text-[#FF5733] dark:text-[#FF6B4A] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF5733]/15 dark:bg-[#FF6B4A]/20 text-[#FF5733] dark:text-[#FF6B4A] text-[11px] font-black">
                        🏢 Cuenta Comercial B2B
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-black">
                        ✨ Suscripción Mensual
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] group-hover:text-[#FF5733] dark:group-hover:text-[#FF6B4A] transition-colors">
                      Tengo un Local o Negocio
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
                      Publica experiencias y planes grupales en tus sedes para atraer grupos verificados sin usar monedas ni ocupar cupos.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#FF5733] dark:text-[#FF6B4A]">
                      <span>Registrar mi Local</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <Link
                to="/"
                className="text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al inicio</span>
              </Link>
              <div>
                <span className="text-[#65676B] dark:text-[#9CA3AF]">¿Ya tienes cuenta? </span>
                <Link to="/auth/login" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
                  Inicia sesión aquí
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1 (PERSONA): BIENVENIDA E INFORMACIÓN PREVIA */}
      {step === 'welcome' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('role-select')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Cambiar tipo de cuenta</span>
              </button>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6]">
                👤 Cuenta Persona
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
                Crea tu cuenta y empieza a salir
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] dark:text-[#9CA3AF] max-w-md mx-auto">
                Solo son <span className="font-bold text-[#008B8B] dark:text-[#14B8A6]">3 sencillos pasos</span> para conectar con gente nueva y descubrir planes cerca de ti.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] text-xs font-black flex items-center justify-center shadow-xs">1</span>
                  <span className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Tu cuenta</span>
                </div>
                <div className="w-8 h-0.5 bg-[#DDE1E5] dark:bg-[#2A2D34]" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-medium text-slate-500">Intereses</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-medium text-slate-500">Perfil</span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/40 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-amber-950/20 border border-emerald-200/70 dark:border-emerald-800/50">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#619c77] text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                  🪙
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                      ¡100 SaleCoins gratis de bienvenida!
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                      Regalo automático
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Al completar tu registro recibes <strong>100 SaleCoins</strong> en tu billetera. Con ellas podrás probar tus primeras salidas grupales sin gastar dinero real (cada reserva de asistencia solo descuenta 20 monedas).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Planes reales todos los días
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Deportes, cafés, trekking, salidas culturales, cine y gastronomía organizadas por personas auténticas y locales de tu ciudad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Chat grupal para cada plan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Conoce a tus compañeros de salida antes del encuentro, aclara dudas y coordina puntos de encuentro con total confianza.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Compromiso y cero no-shows
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    El sistema de SaleCoins asegura que quienes reserven realmente asistan, manteniendo a los grupos activos y completos.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-lg shadow-[#FF5733]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Comenzar a crear mi cuenta</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3.5 text-center px-2">
              <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                Al continuar, confirmas que eres mayor de 18 años y aceptas los{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-bold text-[#008B8B] dark:text-[#14B8A6] hover:underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Términos y Condiciones
                </button>{' '}
                y la{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-bold text-[#008B8B] dark:text-[#14B8A6] hover:underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Política de Privacidad
                </button>
                .
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <Link
                to="/"
                className="text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al inicio</span>
              </Link>
              <div>
                <span className="text-[#65676B] dark:text-[#9CA3AF]">¿Ya tienes cuenta? </span>
                <Link to="/auth/login" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
                  Inicia sesión aquí
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2 (PERSONA): FORMULARIO DE DATOS DE USUARIO */}
      {step === 'form' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a la bienvenida</span>
              </button>
              <span className="text-xs font-black text-[#008B8B] dark:text-[#14B8A6]">Paso 1 de 3</span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Tus datos básicos
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Configura tu cuenta para empezar a conectar con la comunidad.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#619c77] text-white text-xs font-bold flex items-center justify-center shadow-xs">1</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tu cuenta</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-medium text-slate-500">Intereses</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-medium text-slate-500">Perfil</span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#619c77]/15 text-[#619c77] dark:text-[#7fbaa2] shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>¡Estás a un paso!</strong> Tus 100 SaleCoins gratis se activarán automáticamente al completar tu registro.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmitUser)}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  ¿Cómo te llamas?
                </label>
                <div className="relative">
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Ej. Mateo o Sofía"
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs focus:border-[#619c77] focus:outline-none focus:ring-2 focus:ring-[#619c77]/20 sm:text-sm transition-all"
                  />
                </div>
                {errors.name ? (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name.message}</p>
                ) : nameValue && nameValue.trim().length >= 2 ? (
                  <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>¡Hola, {nameValue.trim()}! Qué alegría tenerte aquí 👋</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">Así te verán tus compañeros en los planes y chats grupales.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="tu@correo.com"
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs focus:border-[#619c77] focus:outline-none focus:ring-2 focus:ring-[#619c77]/20 sm:text-sm transition-all"
                  />
                </div>
                {errors.email ? (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">Cero spam. Solo confirmaciones de tus planes y avisos importantes.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type="password"
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    placeholder="Mínimo 8 caracteres"
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs focus:border-[#619c77] focus:outline-none focus:ring-2 focus:ring-[#619c77]/20 sm:text-sm transition-all"
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
                ) : passwordFocus || (passwordValue && passwordValue.length > 0) ? (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          (passwordValue?.length || 0) >= 8
                            ? 'w-full bg-emerald-500'
                            : (passwordValue?.length || 0) >= 5
                            ? 'w-1/2 bg-amber-400'
                            : 'w-1/4 bg-red-400'
                        }`}
                      />
                    </div>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {(passwordValue?.length || 0) >= 8 ? '¡Segura y lista! 🔒' : 'Mínimo 8 caracteres'}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Protegemos tu privacidad y la seguridad de tu cuenta.</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-lg shadow-[#FF5733]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Preparando tu cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar al Paso 2: Mis Intereses</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1 px-1">
                <p className="text-[11px] sm:text-xs text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
                  Al crear tu cuenta aceptas los{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="font-bold text-[#008B8B] dark:text-[#14B8A6] hover:underline cursor-pointer transition-colors"
                  >
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="font-bold text-[#008B8B] dark:text-[#14B8A6] hover:underline cursor-pointer transition-colors"
                  >
                    Política Anti No-Show
                  </button>
                  .
                </p>
              </div>
            </form>

            <div className="mt-6 text-center text-sm pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <span className="text-[#65676B] dark:text-[#9CA3AF]">¿Ya tienes una cuenta? </span>
              <Link to="/auth/login" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1 (LOCAL): FORMULARIO COMERCIAL DEL LOCAL */}
      {step === 'venue-form' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('role-select')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Cambiar tipo de cuenta</span>
              </button>
              <span className="text-xs font-black text-[#FF5733] dark:text-[#FF6B4A]">
                Paso 1 de 2 • Local Aliado
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
                Registra tu Local o Negocio
              </h1>
              <p className="mt-1.5 text-sm text-[#65676B] dark:text-[#9CA3AF]">
                Completa los datos comerciales de tu establecimiento para publicar planes grupales.
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 max-w-xs mx-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#FF5733] dark:bg-[#FF6B4A] text-white text-xs font-black flex items-center justify-center shadow-xs">1</span>
                  <span className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Datos del Local</span>
                </div>
                <div className="w-10 h-0.5 bg-[#DDE1E5] dark:bg-[#2A2D34]" />
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-medium text-slate-500">Suscripción</span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <p className="text-xs text-[#1C1E21] dark:text-[#F3F4F6] leading-relaxed">
                <strong>Sin SaleCoins para Locales:</strong> Tu negocio funciona mediante <strong>Suscripción Mensual</strong>. Al publicar planes, tu local <strong>no ocupa cupos</strong> ni figura como asistente.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleVenueSubmit(onSubmitVenueDetails)}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Nombre Comercial del Local / Marca
                </label>
                <input
                  {...registerVenue('businessName')}
                  type="text"
                  placeholder="Ej. Barbarian Bar & Cervecería"
                  className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                />
                {venueErrors.businessName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.businessName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    RUC del Negocio
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#65676B] absolute left-3 top-3 pointer-events-none" />
                    <input
                      {...registerVenue('ruc')}
                      type="text"
                      maxLength={11}
                      placeholder="20608945123"
                      className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] pl-9 pr-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                    />
                  </div>
                  {venueErrors.ruc && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.ruc.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    Categoría del Local
                  </label>
                  <select
                    {...registerVenue('venueCategory')}
                    className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {VENUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {venueErrors.venueCategory && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.venueCategory.message}</p>
                  )}
                </div>
              </div>

              {/* Cantidad de locales que posee el negocio */}
              <div className="p-4 rounded-2xl bg-[#EFEFF1]/70 dark:bg-[#121316]/80 border border-[#DDE1E5] dark:border-[#2A2D34]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#1C1E21] dark:text-[#F3F4F6]">
                    Cantidad de Locales que posee tu negocio
                  </label>
                  <span className="text-[11px] font-bold text-[#008B8B] dark:text-[#14B8A6]">
                    {branchesCountValue} {branchesCountValue === 1 ? 'sede' : 'sedes'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[1, 2, 3, 5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setVenueValue('branchesCount', preset, { shouldValidate: true })}
                      className={`py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        branchesCountValue === preset
                          ? 'bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] border-[#008B8B] dark:border-[#14B8A6] shadow-xs'
                          : 'bg-white dark:bg-[#1E2025] text-[#65676B] dark:text-[#9CA3AF] border-[#DDE1E5] dark:border-[#2A2D34] hover:border-[#008B8B]'
                      }`}
                    >
                      {preset === 5 ? '5+ locales' : preset === 1 ? '1 local' : `${preset} locales`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    {...registerVenue('branchesCount')}
                    type="number"
                    min={1}
                    max={100}
                    className="w-28 rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] focus:border-[#008B8B] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] leading-snug">
                    Indica el número exacto de sedes activas para configurar el alcance de tu suscripción mensual.
                  </p>
                </div>
                {venueErrors.branchesCount && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{venueErrors.branchesCount.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    Dirección de Sede Principal
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#65676B] absolute left-3 top-3 pointer-events-none" />
                    <input
                      {...registerVenue('address')}
                      type="text"
                      placeholder="Av. Larco 450, Miraflores"
                      className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] pl-9 pr-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                    />
                  </div>
                  {venueErrors.address && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#65676B] absolute left-3 top-3 pointer-events-none" />
                    <input
                      {...registerVenue('phone')}
                      type="tel"
                      maxLength={9}
                      placeholder="987654321"
                      className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] pl-9 pr-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                    />
                  </div>
                  {venueErrors.phone && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Correo Corporativo de Acceso
                </label>
                <input
                  {...registerVenue('email')}
                  type="email"
                  placeholder="contacto@tulocal.pe"
                  className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                />
                {venueErrors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Contraseña de Cuenta Comercial
                </label>
                <input
                  {...registerVenue('password')}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="block w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 text-sm text-[#1C1E21] dark:text-[#F3F4F6] placeholder-slate-400 focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20"
                />
                {venueErrors.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{venueErrors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-lg shadow-[#FF5733]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar al Paso 2: Suscripción Mensual</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <span className="text-[#65676B] dark:text-[#9CA3AF]">¿Tu local ya está registrado? </span>
              <Link to="/auth/login" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2 (LOCAL): ACTIVACIÓN DE SUSCRIPCIÓN MENSUAL */}
      {step === 'venue-subscription' && venueDraft && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('venue-form')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Editar datos del local</span>
              </button>
              <span className="text-xs font-black text-[#FF5733] dark:text-[#FF6B4A]">
                Paso 2 de 2 • Suscripción
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
                Activa tu Suscripción Mensual
              </h1>
              <p className="mt-1.5 text-sm text-[#65676B] dark:text-[#9CA3AF]">
                Para <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">{venueDraft.businessName}</strong> ({venueDraft.branchesCount}{' '}
                {venueDraft.branchesCount === 1 ? 'local registrado' : 'locales registrados'})
              </p>
            </div>

            {/* Monetization explanation */}
            <div className="mb-5 p-4 rounded-2xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 border border-[#008B8B]/25 dark:border-[#14B8A6]/30 text-xs text-[#1C1E21] dark:text-[#F3F4F6] leading-relaxed">
              <strong className="text-[#008B8B] dark:text-[#14B8A6] block mb-1">
                🏢 Modelo B2B sin SaleCoins
              </strong>
              El sistema de monedas no aplica a los locales. Con tu suscripción mensual puedes crear y publicar planes grupales ilimitados, sin pagar por evento y sin ocupar cupos de los asistentes.
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              <button
                type="button"
                onClick={() => setSelectedPlanId('single')}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlanId === 'single'
                    ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/5 dark:bg-[#14B8A6]/10 shadow-sm'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316]'
                }`}
              >
                {venueDraft.branchesCount === 1 && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#008B8B] text-white text-[10px] font-black uppercase mb-2">
                    Recomendado para 1 local
                  </span>
                )}
                <h3 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">Plan Sede Única</h3>
                <p className="text-2xl font-black text-[#008B8B] dark:text-[#14B8A6] mt-1">
                  S/ 99 <span className="text-xs font-semibold text-[#65676B] dark:text-[#9CA3AF]">/ mes</span>
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Planes ilimitados en 1 sede</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Insignia 🏢 Local Oficial</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Chat directo con asistentes</li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanId('multi')}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlanId === 'multi'
                    ? 'border-[#FF5733] dark:border-[#FF6B4A] bg-[#FF5733]/5 dark:bg-[#FF6B4A]/10 shadow-sm'
                    : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316]'
                }`}
              >
                {venueDraft.branchesCount > 1 && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#FF5733] text-white text-[10px] font-black uppercase mb-2">
                    Recomendado ({venueDraft.branchesCount} sedes)
                  </span>
                )}
                <h3 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">Plan Multisede</h3>
                <p className="text-2xl font-black text-[#FF5733] dark:text-[#FF6B4A] mt-1">
                  S/ 179 <span className="text-xs font-semibold text-[#65676B] dark:text-[#9CA3AF]">/ mes</span>
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Gestión de múltiples locales</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Prioridad geográfica en Feed</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Promos grupales destacadas</li>
                </ul>
              </button>
            </div>

            {/* Culqi Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-2">
                Método de Pago Mensual (Culqi)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    paymentMethod === 'yape'
                      ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#1C1E21] dark:text-white'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                  <div>
                    <p className="text-xs font-black">Yape / Plin</p>
                    <p className="text-[10px] opacity-80">Activación al instante</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#008B8B] bg-[#008B8B]/10 text-[#1C1E21] dark:text-white'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                  <div>
                    <p className="text-xs font-black">Tarjeta Emp. / Débito</p>
                    <p className="text-[10px] opacity-80">Renovación mensual</p>
                  </div>
                </button>
              </div>
              <p className="mt-2.5 text-[11px] text-[#65676B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <span>Emisión automática de Boleta/Factura Electrónica (Serie B001 • RUC 20608945123).</span>
              </p>
            </div>

            <button
              type="button"
              disabled={isActivatingSub}
              onClick={handleActivateVenueSubscription}
              id="activate-venue-subscription-btn"
              className="w-full py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-lg shadow-[#FF5733]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isActivatingSub ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activando suscripción comercial...</span>
                </>
              ) : (
                <>
                  <span>
                    Activar Suscripción (S/ {selectedPlanId === 'multi' ? '179.00' : '99.00'}/mes)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <TermsAndConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
