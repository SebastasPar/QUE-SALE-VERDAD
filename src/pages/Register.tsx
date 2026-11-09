import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  HeartHandshake, 
  ChevronLeft,
  Coins,
  MessageCircle,
  CalendarCheck
} from 'lucide-react';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';
import { setUserJoinedIds } from '../hooks/useActivities';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  const nameValue = watch('name');
  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    // Simulamos un breve delay para dar feedback visual
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUserId = `user-${Date.now()}`;
    // Ensure brand new user starts with 0 joined activities
    setUserJoinedIds(newUserId, []);

    login('user-auth-token-active', { 
      id: newUserId, 
      name: data.name.trim(), 
      email: data.email.trim(),
      avatarUrl: ''
    }, false);
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Brand & Badge Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex flex-col items-center text-center mb-6">
        {/* Brand Logo & Name */}
        <Link 
          to="/" 
          className="group inline-flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#008B8B] dark:text-[#14B8A6] hover:opacity-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] flex items-center justify-center shadow-sm text-base font-black group-hover:scale-105 transition-transform">
            ¿?
          </div>
          <span className="text-[#008B8B] dark:text-[#14B8A6]">
            ¿Qué Sale?
          </span>
        </Link>
        
        {/* Onboarding motivational badge */}
        <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/20 dark:border-[#14B8A6]/30 text-[#008B8B] dark:text-[#14B8A6] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
          <span>La comunidad donde siempre hay algo que hacer</span>
        </div>
      </div>

      {/* SCREEN 1: BIENVENIDA E INFORMACIÓN PREVIA */}
      {step === 'welcome' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            
            {/* Title & value proposition */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
                Crea tu cuenta y empieza a salir
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] dark:text-[#9CA3AF] max-w-md mx-auto">
                Solo son <span className="font-bold text-[#008B8B] dark:text-[#14B8A6]">3 sencillos pasos</span> para conectar con gente nueva y descubrir planes cerca de ti.
              </p>

              {/* Visual 3-step preview */}
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

            {/* Welcoming Banner with 100 SaleCoins Gift */}
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

            {/* Information Grid: Why join ¿Qué Sale? */}
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

            {/* Primary Action to advance to Data Form */}
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

            {/* Terms & Conditions link */}
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

            {/* Alternate navigation */}
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

      {/* SCREEN 2: FORMULARIO DE DATOS DE USUARIO */}
      {step === 'form' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-[#1E2025] py-8 px-6 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
            
            {/* Top Navigation Back to Welcome */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a la bienvenida</span>
              </button>
              <span className="text-xs font-black text-[#008B8B] dark:text-[#14B8A6]">
                Paso 1 de 3
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Tus datos básicos
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Configura tu cuenta para empezar a conectar con la comunidad.
              </p>

              {/* Step indicator */}
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

            {/* Reassurance banner */}
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#619c77]/15 text-[#619c77] dark:text-[#7fbaa2] shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>¡Estás a un paso!</strong> Tus 100 SaleCoins gratis se activarán automáticamente al completar tu registro.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Name Input */}
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

              {/* Email Input */}
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

              {/* Password Input */}
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
                ) : (passwordFocus || (passwordValue && passwordValue.length > 0)) ? (
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

              {/* Submit CTA */}
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

              {/* Terms disclaimer */}
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

            {/* Alternate links */}
            <div className="mt-6 text-center text-sm pt-4 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
              <span className="text-[#65676B] dark:text-[#9CA3AF]">¿Ya tienes una cuenta? </span>
              <Link to="/auth/login" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
