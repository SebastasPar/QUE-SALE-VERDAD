import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { useAuthStore, UserRole, getStoredAccountByEmail } from '../store/authStore';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';
import { BrandLogo } from '../components/shared/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña de al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole: UserRole = searchParams.get('role') === 'venue' ? 'venue' : 'user';

  const login = useAuthStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const existingStored = getStoredAccountByEmail(data.email);
    const effectiveRole: UserRole =
      selectedRole === 'venue' || existingStored?.role === 'venue' ? 'venue' : 'user';

    if (effectiveRole === 'venue') {
      const now = new Date();
      const renews = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const emailPrefix = data.email.split('@')[0] || 'Empresa Aliada';
      const fallbackVenueName =
        emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._-]/g, ' ');

      login(
        'venue-auth-token-active',
        {
          id: existingStored?.id || `venue-${Date.now()}`,
          name: existingStored?.name || existingStored?.venueDetails?.businessName || fallbackVenueName,
          email: data.email.trim(),
          role: 'venue',
          avatarUrl: existingStored?.avatarUrl || '',
          bio:
            existingStored?.bio ||
            'Empresa aliada en ¿Qué Sale? Creando experiencias grupales presenciales para la comunidad.',
          venueDetails: existingStored?.venueDetails || {
            businessName: fallbackVenueName,
            ruc: '20608945123',
            venueCategory: 'Bar / Restobar',
            branchesCount: 1,
            address: 'Av. Larco 450, Miraflores',
            phone: '987654321',
          },
          subscription: existingStored?.subscription || {
            status: 'active',
            planId: 'single',
            planName: 'Plan Mensual Empresas',
            monthlyPricePen: 99,
            activatedAt: now.toISOString(),
            renewsAt: renews.toISOString(),
            receiptNumber: 'B001-004821',
            paymentMethod: 'yape',
            maxPlansPerMonth: 8,
            boostDurationHours: 3,
            priorityRadiusKm: 5,
          },
        },
        true
      );
      navigate('/venue/dashboard', { replace: true });
      return;
    }

    const existingUser = useAuthStore.getState().user;
    login(
      'fake-token-123',
      {
        id: existingStored?.id || existingUser?.id || 'demo-user-1',
        name: existingStored?.name || existingUser?.name || 'Usuario Demo',
        email: data.email.trim(),
        role: 'user',
        avatarUrl:
          existingStored?.avatarUrl ||
          existingUser?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio:
          existingStored?.bio ||
          existingUser?.bio ||
          '¡Hola! Me encanta sumarme a planes de café, salidas grupales y conocer nuevas personas en la ciudad.',
      },
      true
    );
    navigate('/feed', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <BrandLogo size="md" />
        </Link>
        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-[#1C1E21] dark:text-[#F3F4F6]">
          Inicia sesión
        </h2>
        <p className="mt-1 text-sm text-[#65676B] dark:text-[#9CA3AF]">
          {selectedRole === 'venue'
            ? 'Accede al panel comercial de tu empresa para crear y publicar planes'
            : 'Bienvenido de vuelta a tu comunidad de planes'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1E2025] py-7 px-5 shadow-xs border border-[#DDE1E5] dark:border-[#2A2D34] rounded-3xl sm:px-10">
          {/* Role Segmented Control (Persona vs Empresa) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] mb-6">
            <button
              type="button"
              id="login-tab-user"
              onClick={() => setSelectedRole('user')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'user'
                  ? 'bg-white dark:bg-[#1E2025] text-[#008B8B] dark:text-[#14B8A6] shadow-xs'
                  : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Soy Persona</span>
            </button>
            <button
              type="button"
              id="login-tab-venue"
              onClick={() => setSelectedRole('venue')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'venue'
                  ? 'bg-white dark:bg-[#1E2025] text-[#FF5733] dark:text-[#FF6B4A] shadow-xs'
                  : 'text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Soy Empresa</span>
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                {selectedRole === 'venue' ? 'Correo Corporativo de la Empresa' : 'Email'}
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={selectedRole === 'venue' ? 'contacto@tuempresa.pe' : 'tu@correo.com'}
                  className="block w-full appearance-none rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] px-3.5 py-2.5 placeholder-[#65676B]/60 dark:placeholder-[#9CA3AF]/60 shadow-2xs focus:border-[#008B8B] dark:focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] transition-all"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                Contraseña
              </label>
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
                className={`flex w-full justify-center rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] py-3.5 px-4 text-sm font-black text-white shadow-lg shadow-[#FF5733]/25 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/40 transition-all cursor-pointer ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting
                  ? 'Ingresando...'
                  : selectedRole === 'venue'
                  ? 'Ingresar al Panel de Empresa'
                  : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

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

      <TermsAndConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
