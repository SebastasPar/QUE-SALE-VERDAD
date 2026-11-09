import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña de al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Simulamos un delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const existingUser = useAuthStore.getState().user;
    login('fake-token-123', { 
      id: existingUser?.id || 'demo-user-1', 
      name: existingUser?.name || 'Usuario Demo', 
      email: data.email,
      avatarUrl: existingUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: existingUser?.bio || '¡Hola! Me encanta sumarme a planes de café, salidas grupales y conocer nuevas personas en la ciudad.'
    });
  };

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block text-3xl font-black text-[#008B8B] dark:text-[#14B8A6] tracking-tight hover:opacity-90">
          ¿Qué Sale?
        </Link>
        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
          Inicia sesión
        </h2>
        <p className="mt-1 text-sm text-[#65676B] dark:text-[#9CA3AF]">
          Bienvenido de vuelta a tu comunidad de planes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1E2025] py-8 px-4 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] sm:rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">Email</label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="tu@correo.com"
                  className="block w-full appearance-none rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 shadow-2xs focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] transition-all"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">Contraseña</label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Tu contraseña"
                  className="block w-full appearance-none rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 shadow-2xs focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] transition-all"
                />
                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full justify-center rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] py-3.5 px-4 text-sm font-black text-white shadow-lg shadow-[#FF5733]/25 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/40 transition-all cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#DDE1E5] dark:border-[#2A2D34]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#1E2025] px-2 text-[#65676B] dark:text-[#9CA3AF] font-bold tracking-wider">O accede rápido</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                login('fake-token-123', {
                  id: 'guest-fair',
                  name: 'Visitante',
                  email: 'visitante@feriaplanes.com'
                }, true);
                navigate('/feed');
              }}
              className="flex w-full justify-center items-center gap-2 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/70 py-2.5 px-4 text-sm font-extrabold text-amber-800 dark:text-amber-300 transition-all active:scale-[0.99] cursor-pointer"
            >
              Probar como Invitado (Modo Feria) 🎪✨
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#65676B] dark:text-[#9CA3AF]">¿No tienes cuenta? </span>
            <Link to="/auth/register" className="font-bold text-[#008B8B] hover:text-[#007575] dark:text-[#14B8A6]">
              Regístrate aquí
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDE1E5] dark:border-[#2A2D34] text-center">
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-xs text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:underline cursor-pointer transition-colors"
            >
              Términos y Condiciones de Uso
            </button>
          </div>
        </div>
      </div>

      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
