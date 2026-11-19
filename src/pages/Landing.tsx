import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound } from 'lucide-react';
import { TermsAndConditionsModal } from '../components/shared/TermsAndConditionsModal';

export default function Landing() {
  const navigate = useNavigate();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] flex flex-col justify-between items-center px-6 py-8 transition-colors">
      <div aria-hidden="true" className="h-2" />

      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center my-auto">
        {/* Logo Badge */}
        <div className="w-16 h-16 rounded-3xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 border border-[#008B8B]/30 dark:border-[#14B8A6]/30 flex items-center justify-center text-3xl mb-4 shadow-sm">
          ✨
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-[#1C1E21] dark:text-[#F3F4F6] tracking-tight mb-3">
          ¿Qué Sale?
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg leading-relaxed text-[#65676B] dark:text-[#9CA3AF] font-medium px-2 mb-8">
          Descubre actividades, crea planes y conecta con gente nueva cerca de ti.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3.5">
          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-black text-sm sm:text-base shadow-md shadow-[#FF5733]/25 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            <User className="w-5 h-5 shrink-0" />
            <span>Crear cuenta gratis ✨</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="w-full py-4 px-6 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] font-bold text-sm sm:text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-5 h-5 text-[#65676B] dark:text-[#9CA3AF] shrink-0" />
            <span>Iniciar sesión</span>
          </button>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-xs text-[#65676B] dark:text-[#9CA3AF] font-medium">
          Al continuar, aceptas nuestros{' '}
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="underline underline-offset-2 text-[#008B8B] dark:text-[#14B8A6] font-bold hover:opacity-80 cursor-pointer transition-opacity"
          >
            Términos y Condiciones
          </button>
          .
        </p>
      </div>

      <div className="w-full max-w-sm text-center text-[11px] text-[#65676B] dark:text-[#9CA3AF]">
        ¿Qué Sale? • Sistema Comunitario Anti No-Show
      </div>

      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
