import React, { useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { SubscriptionPaymentDetails } from '../../store/authStore';

export type VenuePaymentMethod = 'yape' | 'plin' | 'card';

export interface VenuePaymentFormState {
  payerPhone: string;
  approvalCode: string;
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

export const createInitialVenuePaymentForm = (
  details?: SubscriptionPaymentDetails
): VenuePaymentFormState => ({
  payerPhone: details?.payerPhone || '',
  approvalCode: details?.approvalCode || '',
  cardHolder: details?.cardHolder || '',
  cardNumber: details?.cardLast4 ? `•••• •••• •••• ${details.cardLast4}` : '',
  cardExpiry: details?.cardExpiry || '',
  cardCvv: '',
});

export const VENUE_PLAN_BENEFITS = [
  'Máximo crear 8 planes',
  '1 boost por plan (mayor visibilidad – duración 3 horas)',
  'Prioridad cercana (5km a la redonda)',
  'Chat directo con los asistentes',
] as const;

export function validateVenuePaymentForm(
  method: VenuePaymentMethod,
  form: VenuePaymentFormState
): string | null {
  if (method === 'yape' || method === 'plin') {
    const phoneDigits = form.payerPhone.replace(/\D/g, '');
    if (!/^\d{9}$/.test(phoneDigits)) {
      return `Ingresa tu número de celular ${method === 'yape' ? 'Yape' : 'Plin'} válido de 9 dígitos.`;
    }
    if (form.approvalCode.trim().length < 4) {
      return 'Ingresa el código de aprobación u operación de tu transferencia (mínimo 4 caracteres).';
    }
    return null;
  }

  if (form.cardHolder.trim().length < 3) {
    return 'Ingresa el nombre completo del titular de la tarjeta.';
  }
  const cardDigits = form.cardNumber.replace(/\D/g, '');
  if (cardDigits.length !== 16) {
    return 'Ingresa los 16 dígitos de tu tarjeta de débito o crédito.';
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.cardExpiry.trim())) {
    return 'Ingresa la fecha de vencimiento válida en formato MM/AA (ej. 08/28).';
  }
  const cvvDigits = form.cardCvv.replace(/\D/g, '');
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    return 'Ingresa un código CVV válido de 3 o 4 dígitos.';
  }
  return null;
}

export function toSubscriptionPaymentDetails(
  method: VenuePaymentMethod,
  form: VenuePaymentFormState
): SubscriptionPaymentDetails {
  if (method === 'yape' || method === 'plin') {
    return {
      payerPhone: form.payerPhone.replace(/\D/g, ''),
      approvalCode: form.approvalCode.trim(),
    };
  }
  const cardDigits = form.cardNumber.replace(/\D/g, '');
  return {
    cardHolder: form.cardHolder.trim(),
    cardLast4: cardDigits.slice(-4),
    cardExpiry: form.cardExpiry.trim(),
  };
}

export function formatPaymentDetailsSummary(
  method: VenuePaymentMethod,
  form: VenuePaymentFormState
): string {
  if (method === 'yape' || method === 'plin') {
    const phone = form.payerPhone.replace(/\D/g, '');
    const code = form.approvalCode.trim();
    return `${method.toUpperCase()} Cel: ${phone} | Op: ${code}`;
  }
  const digits = form.cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4) || '****';
  return `Tarjeta **** ${last4} (${form.cardHolder.trim()})`;
}

export const VenueMonthlyPlanCard: React.FC<{ badgeLabel?: string }> = ({
  badgeLabel = 'Plan Único para Empresas',
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/5 dark:bg-[#14B8A6]/10 shadow-sm text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#008B8B] dark:bg-[#14B8A6] text-white dark:text-[#121316] text-[10px] font-black uppercase tracking-wider">
          {badgeLabel}
        </span>
        <span className="text-[11px] font-bold text-[#008B8B] dark:text-[#14B8A6]">
          Facturación mensual
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className="text-base sm:text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">
          Plan Mensual Empresas
        </h3>
        <p className="text-2xl font-black text-[#008B8B] dark:text-[#14B8A6]">
          S/ 99 <span className="text-xs font-semibold text-[#65676B] dark:text-[#9CA3AF]">/ mes</span>
        </p>
      </div>

      <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1C1E21] dark:text-[#F3F4F6] font-semibold">
        {VENUE_PLAN_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface VenuePaymentMethodFieldsProps {
  paymentMethod: VenuePaymentMethod;
  onChangeMethod: (method: VenuePaymentMethod) => void;
  form: VenuePaymentFormState;
  onChangeForm: (next: VenuePaymentFormState) => void;
  onClearError?: () => void;
  label?: string;
}

export const VenuePaymentMethodFields: React.FC<VenuePaymentMethodFieldsProps> = ({
  paymentMethod,
  onChangeMethod,
  form,
  onChangeForm,
  onClearError,
  label = 'Método de Pago Mensual',
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText('987654321');
    } catch {}
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const updateField = <K extends keyof VenuePaymentFormState>(
    key: K,
    value: VenuePaymentFormState[K]
  ) => {
    if (onClearError) onClearError();
    onChangeForm({ ...form, [key]: value });
  };

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-2">
          {label}
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onClearError) onClearError();
              onChangeMethod('yape');
            }}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
              paymentMethod === 'yape'
                ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-white'
                : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
            <p className="text-xs font-black">Yape</p>
            <p className="text-[10px] opacity-80">Instantáneo</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClearError) onClearError();
              onChangeMethod('plin');
            }}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
              paymentMethod === 'plin'
                ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-white'
                : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
            <p className="text-xs font-black">Plin</p>
            <p className="text-[10px] opacity-80">QR / Móvil</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClearError) onClearError();
              onChangeMethod('card');
            }}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
              paymentMethod === 'card'
                ? 'border-[#008B8B] dark:border-[#14B8A6] bg-[#008B8B]/10 dark:bg-[#14B8A6]/15 text-[#1C1E21] dark:text-white'
                : 'border-[#DDE1E5] dark:border-[#2A2D34] text-[#65676B] dark:text-[#9CA3AF]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#008B8B] dark:text-[#14B8A6] shrink-0" />
            <p className="text-xs font-black">Tarjeta</p>
            <p className="text-[10px] opacity-80">Débito / Créd.</p>
          </button>
        </div>
      </div>

      {/* Dynamic instructions + inputs per chosen payment method */}
      <div className="p-4 rounded-2xl bg-[#EFEFF1]/70 dark:bg-[#121316] border border-[#DDE1E5] dark:border-[#2A2D34] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black text-[#1C1E21] dark:text-[#F3F4F6]">
            ¿Cómo realizar tu pago?
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008B8B] dark:text-[#14B8A6]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pago Seguro
          </span>
        </div>

        {paymentMethod === 'yape' || paymentMethod === 'plin' ? (
          <>
            <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
              Transfiere exactamente <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">S/ 99.00</strong> desde tu app de{' '}
              <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">{paymentMethod === 'yape' ? 'Yape' : 'Plin'}</strong> al número oficial{' '}
              <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">987 654 321</strong> (Titular: ¿Qué Sale? Perú S.A.C.).
            </p>

            <div className="p-3 rounded-xl bg-white dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] block">
                  Número oficial {paymentMethod === 'yape' ? 'Yape' : 'Plin'}
                </span>
                <span className="text-base font-black font-mono tracking-wider text-[#1C1E21] dark:text-[#F3F4F6]">
                  987 654 321
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-3 py-1.5 rounded-lg border border-[#DDE1E5] dark:border-[#2A2D34] bg-[#EFEFF1]/70 dark:bg-[#121316] text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-1.5 hover:border-[#008B8B] cursor-pointer transition-colors"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Tu celular {paymentMethod === 'yape' ? 'Yape' : 'Plin'} *
                </label>
                <input
                  type="tel"
                  maxLength={9}
                  value={form.payerPhone}
                  onChange={(e) => updateField('payerPhone', e.target.value.replace(/\D/g, ''))}
                  placeholder="987654321"
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm font-mono text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Código de aprobación / operación *
                </label>
                <input
                  type="text"
                  value={form.approvalCode}
                  onChange={(e) => updateField('approvalCode', e.target.value)}
                  placeholder="Ej. 482910"
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm font-mono text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
              Ingresa los datos de tu tarjeta de débito o crédito (Visa, Mastercard, Amex o Diners) para el cobro mensual de{' '}
              <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">S/ 99.00</strong>.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Nombre del titular *
                </label>
                <input
                  type="text"
                  value={form.cardHolder}
                  onChange={(e) => updateField('cardHolder', e.target.value)}
                  placeholder="Ej. Mateo Paredes"
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                  Número de tarjeta (16 dígitos) *
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={form.cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                    updateField('cardNumber', formatted);
                  }}
                  placeholder="4557 8810 2345 8912"
                  className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm font-mono text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    Vencimiento (MM/AA) *
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={form.cardExpiry}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d/]/g, '').slice(0, 5);
                      updateField('cardExpiry', raw);
                    }}
                    placeholder="08/28"
                    className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm font-mono text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65676B] dark:text-[#9CA3AF] mb-1">
                    CVV (3 o 4 dígitos) *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={form.cardCvv}
                    onChange={(e) => updateField('cardCvv', e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full rounded-xl border border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] px-3 py-2 text-xs sm:text-sm font-mono text-[#1C1E21] dark:text-[#F3F4F6] focus:outline-none focus:border-[#008B8B]"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface VenueBusinessTermsBoxProps {
  accepted: boolean;
  onToggleAccepted: (next: boolean) => void;
  onOpenFullTerms: () => void;
  checkboxId?: string;
}

export const VenueBusinessTermsBox: React.FC<VenueBusinessTermsBoxProps> = ({
  accepted,
  onToggleAccepted,
  onOpenFullTerms,
  checkboxId = 'accept-business-terms',
}) => {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5 text-left">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs font-black text-[#1C1E21] dark:text-[#F3F4F6] flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#FF5733] dark:text-[#FF6B4A] shrink-0" />
          <span>Términos y Condiciones para Empresas</span>
        </p>
        <button
          type="button"
          onClick={onOpenFullTerms}
          className="inline-flex items-center gap-1 text-[11px] font-black text-[#008B8B] dark:text-[#14B8A6] hover:underline cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ver documento completo</span>
        </button>
      </div>

      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#65676B] dark:text-[#9CA3AF] leading-relaxed">
        <li>
          <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">Prohibido promocionar otras cosas:</strong> Solo puedes publicar planes grupales presenciales reales; queda prohibido promocionar otros productos, marcas o servicios externos ajenos al plan.
        </li>
        <li>
          <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">Sanción por cancelación de plan:</strong> Si cancelas un plan publicado con inscritos o con menos de 48 horas, pierdes el cupo mensual y el Boost de 3h, recibes <strong>suspensión de la prioridad cercana (5 km) por 7 días</strong> en la primera falta y <strong>anulación definitiva de la suscripción sin reembolso</strong> en caso de reincidencia.
        </li>
      </ul>

      <label
        htmlFor={checkboxId}
        className="flex items-start gap-2.5 pt-1 cursor-pointer select-none"
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={accepted}
          onChange={(e) => onToggleAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-[#DDE1E5] text-[#008B8B] focus:ring-[#008B8B] cursor-pointer shrink-0"
        />
        <span className="text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6]">
          Acepto los Términos y Condiciones para Empresas, la prohibición de promoción ajena y las sanciones por cancelación.
        </span>
      </label>
    </div>
  );
};
