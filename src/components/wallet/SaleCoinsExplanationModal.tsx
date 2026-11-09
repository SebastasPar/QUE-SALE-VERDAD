import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Coins, 
  Gift, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';

interface SaleCoinsExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge?: () => void;
}

export function SaleCoinsExplanationModal({
  isOpen,
  onClose,
  onOpenRecharge,
}: SaleCoinsExplanationModalProps) {
  const balance = useWalletStore((state) => state.balance);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#1E2025] rounded-3xl shadow-2xl border border-[#DDE1E5] dark:border-[#2A2D34] flex flex-col max-h-[90dvh] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at Top of Modal */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-br from-[#008B8B] to-[#006666] dark:from-[#132E2B] dark:to-[#0C1E1B] text-white shrink-0 border-b border-[#007575] dark:border-[#2A2D34]">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 dark:bg-[#14B8A6]/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white/30 dark:border-[#14B8A6]/40">
                🪙
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 dark:bg-[#14B8A6]/30 text-white dark:text-[#14B8A6]">
                  <Sparkles className="w-3 h-3" /> Sistema Anti No-Show
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                  ¿Cómo funcionan las SaleCoins?
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Balance Bar */}
          <div className="mt-3.5 p-3 rounded-2xl bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-[#2A2D34] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100 dark:text-teal-200">
                Tu saldo disponible:
              </p>
              <p className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>🪙 {balance}</span>
                <span className="text-xs font-semibold opacity-90">SaleCoins</span>
                <span className="text-[11px] font-medium text-teal-100 dark:text-teal-300 ml-1">
                  (~{Math.floor(balance / 20)} salidas confirmadas)
                </span>
              </p>
            </div>
            {onOpenRecharge && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecharge();
                }}
                className="px-3.5 py-1.5 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                + Recargar
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body with Guaranteed High Contrast and min-h-0 for proper flex shrinking */}
        <div className="p-4 sm:p-5 overflow-y-auto min-h-0 flex-1 space-y-3.5 text-[#1C1E21] dark:text-[#F3F4F6] overscroll-contain">
          {/* Why SaleCoins Banner */}
          <div className="p-3.5 rounded-2xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#008B8B] dark:text-[#14B8A6] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] font-medium leading-relaxed">
              Para evitar que las personas reserven cupos por impulso y luego no asistan dejando al grupo incompleto (<strong className="font-black text-[#FF5733] dark:text-[#FF6B4A]">no-show</strong>), la app utiliza una moneda interna llamada <strong className="font-black text-[#008B8B] dark:text-[#14B8A6]">SaleCoins</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {/* 1. Monedas de bienvenida */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1C22] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                    Monedas de bienvenida
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                    100 GRATIS
                  </span>
                </div>
                <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                  Al registrarte, recibes un saldo inicial gratuito de <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">100 SaleCoins</strong> para probar tus primeras salidas comunitarias sin gastar dinero real.
                </p>
              </div>
            </div>

            {/* 2. Reserva y compromiso */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1C22] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                  Reserva y compromiso
                </h4>
                <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                  Unirte a una salida te cuesta <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">20 SaleCoins</strong> y crear tu propia salida te cuesta <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">30 SaleCoins</strong>. Este cobro actúa como un filtro para asegurar que solo se sumen personas realmente comprometidas a asistir.
                </p>
              </div>
            </div>

            {/* 3. Garantía y reembolso */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1C22] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                  Garantía y reembolso automático
                </h4>
                <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                  Si un evento o salida se cancela por culpa del organizador o del local, tus SaleCoins se devuelven automáticamente al <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">100%</strong> a tu billetera en la app.
                </p>
              </div>
            </div>

            {/* 4. Recarga fácil */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1C22] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-[#FF5733] dark:text-[#FF6B4A] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                  Recarga fácil con Yape, Plin o Tarjeta
                </h4>
                <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                  Cuando te quedes sin monedas, puedes recargar desde <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">S/ 10.00</strong> (que incluye <strong className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">100 SaleCoins</strong>, alcanzando para 5 salidas confirmadas) mediante Yape, Plin o tarjeta.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Pill Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
              <span className="text-[11px] font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                100 monedas de bienvenida
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
              <span className="text-[11px] font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                20 monedas por unirte
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
              <span className="text-[11px] font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                30 monedas por crear plan
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EFEFF1] dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
              <span className="text-[11px] font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                100% reembolso garantía
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions - Sticky Bottom inside Dialog with high contrast buttons */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1E2025] border-t border-[#DDE1E5] dark:border-[#2A2D34] flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-[#65676B] dark:text-[#9CA3AF] hover:text-[#1C1E21] dark:hover:text-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
          {onOpenRecharge && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecharge();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-xl text-xs sm:text-sm font-black shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Recargar SaleCoins</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
