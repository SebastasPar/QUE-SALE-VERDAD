import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Coins, 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Gift
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount?: number; // Optional: when opened because user lacked coins
}

export interface PackageOption {
  soles: number;
  coins: number;
  outings: number;
  badge?: string;
  bonus?: string;
  popular?: boolean;
}

export const PACKAGES: PackageOption[] = [
  {
    soles: 10,
    coins: 100,
    outings: 5,
    badge: 'Recomendado',
    popular: true,
  },
  {
    soles: 20,
    coins: 220,
    outings: 11,
    bonus: '+20 SaleCoins de regalo',
  },
  {
    soles: 40,
    coins: 480,
    outings: 24,
    bonus: '+80 SaleCoins de regalo',
  },
];

export type PaymentMethod = 'yape' | 'plin' | 'card';

export function RechargeModal({
  isOpen,
  onClose,
  requiredAmount,
}: RechargeModalProps) {
  const { balance, rechargeCoins } = useWalletStore();
  const [selectedPkg, setSelectedPkg] = useState<PackageOption>(PACKAGES[0]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('yape');
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [approvalCode, setApprovalCode] = useState('');
  const [cardForm, setCardForm] = useState({
    number: '4557 •••• •••• 8912',
    name: '',
    expiry: '08/28',
    cvv: '•••',
  });

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('987654321');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedRef = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      rechargeCoins(selectedPkg.soles, selectedPkg.coins, selectedMethod, generatedRef);
      setIsProcessing(false);
      setStep('success');
    }, 1000);
  };

  const handleResetAndClose = () => {
    setStep('select');
    setIsProcessing(false);
    onClose();
  };

  const modalElement = (
    <div className="fixed inset-0 z-[9999] w-full h-[100dvh] bg-[#EFEFF1] dark:bg-[#121316] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Navigation Header - Always Visible */}
      <header className="shrink-0 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {step === 'pay' ? (
              <button
                type="button"
                onClick={() => setStep('select')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#008B8B] dark:text-[#14B8A6]" />
                <span>Elegir otro paquete</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#008B8B] dark:text-[#14B8A6]" />
                <span>Volver</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-center">
            <span className="text-xl sm:text-2xl">🪙</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">
                Tienda de SaleCoins
              </h1>
              <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] hidden sm:block">
                Recarga oficial sin comisiones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span className="hidden sm:inline">Tu saldo:</span>
              <strong className="font-extrabold">{balance}</strong>
              <span className="text-[11px] font-semibold">monedas</span>
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="p-2 rounded-full text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-colors cursor-pointer"
              aria-label="Cerrar tienda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable with min-h-0 so flexbox works smoothly */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-6">
        
        {/* Insufficient coins banner if opened with required amount */}
        {requiredAmount && requiredAmount > balance && step === 'select' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs sm:text-sm text-rose-800 dark:text-rose-300 flex items-start gap-3">
            <span className="text-xl leading-none">⚠️</span>
            <div>
              <p className="font-bold">Saldo insuficiente para confirmar tu salida</p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-300/90 text-xs">
                Esta acción requiere <strong>{requiredAmount} SaleCoins</strong> y dispones de {balance}. Elige un paquete abajo para recargar y asegurar tu lugar.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT PACKAGE & METHOD */}
        {step === 'select' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner explaining SaleCoins purpose */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-500/30 shrink-0">
                  🪙
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                    Monedas para tus salidas grupales
                  </h2>
                  <p className="text-xs sm:text-sm text-[#65676B] dark:text-[#9CA3AF] mt-0.5 max-w-xl">
                    Cada salida confirmada requiere <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">20 SaleCoins</strong>. Esto actúa como un compromiso para asegurar que el grupo esté completo y sin cancelaciones a último minuto.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 border border-[#008B8B]/30 dark:border-[#14B8A6]/30 text-[11px] font-bold text-[#008B8B] dark:text-[#14B8A6]">
                <ShieldCheck className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" />
                <span>Reembolso 100% si el plan se cancela</span>
              </div>
            </div>

            {/* Packages Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1C1E21] dark:text-[#F3F4F6]">
                  1. Elige tu paquete de SaleCoins
                </label>
                <span className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                  Validez ilimitada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPkg.soles === pkg.soles;
                  return (
                    <div
                      key={pkg.soles}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/5 dark:bg-[#14B8A6]/10 shadow-md ring-2 ring-[#008B8B]/20 dark:ring-[#14B8A6]/30'
                          : 'border-[#DDE1E5] dark:border-[#2A2D34] hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#1E2025] shadow-2xs hover:shadow-sm'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-[#FF5733] dark:bg-[#FF6B4A] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                          ⭐ {pkg.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B] dark:bg-[#14B8A6] text-white' : 'border-[#DDE1E5] dark:border-[#2A2D34]'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xl sm:text-2xl font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                            S/ {pkg.soles.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-1.5">
                            <span>🪙 {pkg.coins}</span>
                            <span className="text-sm font-bold text-[#65676B] dark:text-[#9CA3AF]">monedas</span>
                          </h3>
                          {pkg.bonus && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                              🎁 {pkg.bonus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#DDE1E5] dark:border-[#2A2D34]">
                        <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                          Alcanza para <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">{pkg.outings} salidas grupales</strong> confirmadas
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1C1E21] dark:text-[#F3F4F6] block mb-3">
                2. Selecciona tu método de pago
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('yape')}
                  className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === 'yape'
                      ? 'border-[#742384] bg-purple-50/70 dark:bg-purple-950/40 text-[#742384] dark:text-purple-300 font-extrabold shadow-sm'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#742384] text-white flex items-center justify-center text-lg font-black shadow-xs">
                    Y
                  </div>
                  <span className="text-sm font-bold">Yape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('plin')}
                  className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === 'plin'
                      ? 'border-[#00bcd4] bg-cyan-50/70 dark:bg-cyan-950/40 text-[#00838f] dark:text-cyan-300 font-extrabold shadow-sm'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#00bcd4] text-white flex items-center justify-center text-lg font-black shadow-xs">
                    P
                  </div>
                  <span className="text-sm font-bold">Plin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === 'card'
                      ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] font-extrabold shadow-sm'
                      : 'border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#008B8B] dark:bg-[#14B8A6] text-white flex items-center justify-center text-base font-black shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold">Tarjeta</span>
                </button>
              </div>
            </div>

            {/* Bottom Action Section */}
            <div className="pt-4 pb-12 border-t border-[#DDE1E5] dark:border-[#2A2D34] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-[#65676B] dark:text-[#9CA3AF]">
                <ShieldCheck className="w-5 h-5 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                <span>
                  Transacción 100% segura con acreditación instantánea a tu cuenta.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep('pay')}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-[#FF5733]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar con S/ {selectedPkg.soles.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT VERIFICATION / CONFIRMATION */}
        {step === 'pay' && (
          <div className="max-w-xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
            {/* Summary Ticket */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#65676B] dark:text-[#9CA3AF]">Total a pagar:</p>
                <p className="text-2xl font-black text-[#1C1E21] dark:text-[#F3F4F6] mt-0.5">
                  S/ {selectedPkg.soles.toFixed(2)}
                </p>
                <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] mt-0.5">
                  Método: <strong className="capitalize text-[#1C1E21] dark:text-[#F3F4F6]">{selectedMethod === 'card' ? 'Tarjeta Débito / Crédito' : selectedMethod}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider font-bold text-[#65676B] dark:text-[#9CA3AF]">Recibes:</p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5 justify-end mt-0.5">
                  <span>🪙 {selectedPkg.coins}</span>
                  <span className="text-xs font-semibold">SaleCoins</span>
                </p>
                <p className="text-xs text-[#008B8B] dark:text-[#14B8A6] font-bold">
                  {selectedPkg.outings} salidas confirmadas
                </p>
              </div>
            </div>

            {/* Yape / Plin Instructions */}
            {(selectedMethod === 'yape' || selectedMethod === 'plin') && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs"
                    style={{ backgroundColor: selectedMethod === 'yape' ? '#742384' : '#00bcd4' }}
                  >
                    {selectedMethod === 'yape' ? 'Y' : 'P'}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1E21] dark:text-[#F3F4F6]">
                      Transfiere desde tu app de {selectedMethod === 'yape' ? 'Yape' : 'Plin'}
                    </h3>
                    <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                      Envía exactamente <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">S/ {selectedPkg.soles.toFixed(2)}</strong> al número oficial:
                    </p>
                  </div>
                </div>

                {/* Official Number with Copy Button */}
                <div className="p-4 rounded-2xl bg-[#EFEFF1]/80 dark:bg-[#121316]/80 border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#65676B] dark:text-[#9CA3AF] block">Número Celular</span>
                    <span className="text-2xl font-black tracking-widest text-[#1C1E21] dark:text-[#F3F4F6] font-mono">
                      987 654 321
                    </span>
                    <p className="text-xs font-semibold text-[#65676B] dark:text-[#9CA3AF] mt-0.5">
                      Titular: ¿Qué Sale? Perú S.A.C.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="px-4 py-2.5 bg-white dark:bg-[#1E2025] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#DDE1E5] dark:border-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPhone ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Optional code input */}
                <div>
                  <label className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] block mb-1.5">
                    Código de aprobación o últimos 4 dígitos (opcional):
                  </label>
                  <input
                    type="text"
                    value={approvalCode}
                    onChange={(e) => setApprovalCode(e.target.value)}
                    placeholder="Ej. 7482"
                    className="w-full px-4 py-3 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm font-mono placeholder-[#65676B]/60 focus:outline-none focus:ring-2 focus:ring-[#008B8B] dark:focus:ring-[#14B8A6]"
                  />
                  <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] mt-1">
                    La acreditación a tu billetera es automática e inmediata al confirmar.
                  </p>
                </div>
              </div>
            )}

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#008B8B] dark:bg-[#14B8A6] text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#1C1E21] dark:text-[#F3F4F6]">
                      Tarjeta de débito o crédito
                    </h3>
                    <p className="text-xs text-[#65676B] dark:text-[#9CA3AF]">
                      Aceptamos Visa, Mastercard, American Express y Diners.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] block mb-1">
                    Número de tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-[#65676B] absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] block mb-1">
                      Fecha Vencimiento
                    </label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm font-mono"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] block mb-1">
                      Código CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#65676B] dark:text-[#9CA3AF] pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
                  <span>Conexión cifrada de 256 bits protegida por pasarela de pagos.</span>
                </div>
              </div>
            )}

            {/* Confirm Payment CTA */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full py-4 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] active:scale-[0.99] disabled:opacity-75 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-[#FF5733]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verificando transacción...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar Recarga de S/ {selectedPkg.soles.toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('select')}
                className="w-full py-2.5 text-center text-xs font-bold text-[#65676B] hover:text-[#1C1E21] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] cursor-pointer"
              >
                ← Cambiar paquete o método de pago
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="max-w-md mx-auto py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-4xl shadow-md animate-bounce">
              🎉
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#1C1E21] dark:text-[#F3F4F6]">
                ¡Recarga Completada!
              </h2>
              <p className="text-sm text-[#65676B] dark:text-[#9CA3AF] mt-1">
                Tus SaleCoins han sido acreditadas inmediatamente a tu cuenta.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] text-left space-y-3 shadow-xs">
              <div className="flex justify-between items-center text-sm text-[#65676B] dark:text-[#9CA3AF]">
                <span>SaleCoins recargadas:</span>
                <strong className="text-[#008B8B] dark:text-[#14B8A6] font-extrabold text-base">
                  +{selectedPkg.coins} monedas
                </strong>
              </div>
              <div className="flex justify-between items-center text-sm text-[#65676B] dark:text-[#9CA3AF]">
                <span>Monto pagado:</span>
                <span className="font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
                  S/ {selectedPkg.soles.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-[#65676B] dark:text-[#9CA3AF]">
                <span>Método utilizado:</span>
                <span className="font-bold uppercase text-[#1C1E21] dark:text-[#F3F4F6]">
                  {selectedMethod}
                </span>
              </div>
              <div className="pt-3 border-t border-[#DDE1E5] dark:border-[#2A2D34] flex justify-between items-center">
                <span className="text-sm font-bold text-[#1C1E21] dark:text-[#F3F4F6]">Nuevo saldo total:</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-black text-xl">
                  🪙 {balance} SaleCoins
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-4 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-[#FF5733]/25 transition-all cursor-pointer"
            >
              ¡Listo! Volver a mis actividades
            </button>
          </div>
        )}

        </div>
      </main>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
}
