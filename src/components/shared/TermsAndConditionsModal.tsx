import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Coins, 
  Clock, 
  HeartHandshake, 
  AlertTriangle, 
  Lock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<string>('all');

  if (!isOpen) return null;

  const sections = [
    { id: 'all', label: 'Todo el documento' },
    { id: 'nature', label: '1. Naturaleza del Servicio' },
    { id: 'requirements', label: '2. Requisitos & Cuentas' },
    { id: 'salecoins', label: '3. SaleCoins & Anti No-Show' },
    { id: 'cancellation', label: '4. Cancelaciones (48h)' },
    { id: 'conduct', label: '5. Código de Conducta' },
    { id: 'liability', label: '6. Responsabilidad' },
    { id: 'privacy', label: '7. Privacidad de Datos' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[85vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#619c77]/15 dark:bg-[#619c77]/30 text-[#619c77] dark:text-[#7fbaa2] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Términos y Condiciones de Uso
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ¿Qué Sale? • Actualizado en Noviembre 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar términos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Navigation */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max text-xs">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap",
                  activeSection === sec.id
                    ? "bg-[#619c77] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                )}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* Welcome Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
            <p className="font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Bienvenido a la comunidad de ¿Qué Sale?</span>
            </p>
            <p className="text-emerald-900/90 dark:text-emerald-300/90">
              Al registrarte, navegar o interactuar en nuestra aplicación, aceptas expresamente regirte bajo los presentes Términos y Condiciones. Diseñamos estas pautas para fomentar encuentros seguros, entretenidos y con personas comprometidas.
            </p>
          </div>

          {/* Section 1 */}
          {(activeSection === 'all' || activeSection === 'nature') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">1</span>
                <span>Naturaleza y Objeto del Servicio</span>
              </h3>
              <p>
                <strong>¿Qué Sale?</strong> es una plataforma social e informativa que facilita el descubrimiento de actividades grupales de ocio, deportes, gastronomía, vida nocturna y cultura. Actuamos exclusivamente como intermediario de enlace entre miembros de la comunidad y locales colaboradores.
              </p>
              <p>
                La plataforma no organiza de manera presencial ni asume la tutela directa de las salidas creadas por usuarios particulares, salvo aquellas expresamente señaladas como eventos oficiales o patrocinados.
              </p>
            </section>
          )}

          {/* Section 2 */}
          {(activeSection === 'all' || activeSection === 'requirements') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">2</span>
                <span>Requisitos de Registro y Veracidad de Perfil</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-[#619c77]">
                <li>
                  <strong>Edad mínima:</strong> El registro y uso de la aplicación está reservado a personas mayores de 18 años de edad con capacidad legal para contratar.
                </li>
                <li>
                  <strong>Perfiles reales:</strong> Queda estrictamente prohibido suplantar la identidad de terceros, usar fotografías de otras personas sin su consentimiento expreso o publicar avatares con fines de engaño.
                </li>
                <li>
                  <strong>Seguridad de credenciales:</strong> Cada usuario es el único custodio de su contraseña y datos de acceso. En caso de detectar un uso no autorizado, debe notificarlo a nuestro equipo de soporte.
                </li>
              </ul>
            </section>
          )}

          {/* Section 3 */}
          {(activeSection === 'all' || activeSection === 'salecoins') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">3</span>
                <span>Sistema de SaleCoins y Política Anti No-Show</span>
              </h3>
              <p>
                Para evitar que las personas reserven cupos por impulso y luego dejen al grupo incompleto, la plataforma opera mediante un sistema de compromiso basado en <strong>SaleCoins</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Monedas de Bienvenida</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Cada nuevo usuario recibe un bono de <strong>100 SaleCoins gratis</strong> para disfrutar de sus primeras salidas sin costo monetario.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Filtro de Asistencia</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Unirse a un plan descuenta <strong>20 SaleCoins</strong> y crear un nuevo plan descuenta <strong>30 SaleCoins</strong> como cuota de publicación y compromiso.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                * Las SaleCoins constituyen una unidad de intercambio digital y moderación interna de la aplicación. No constituyen depósitos bancarios ni títulos valores.
              </p>
            </section>
          )}

          {/* Section 4 */}
          {(activeSection === 'all' || activeSection === 'cancellation') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">4</span>
                <span>Política de Cancelaciones y Regla de las 48 Horas</span>
              </h3>
              <p>
                Nuestra política protege el tiempo y las expectativas de todos los miembros del grupo:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-emerald-500 text-xs sm:text-sm">
                <li>
                  <strong>Cancelación por el Local o Evento:</strong> Si un plan no puede realizarse por fuerza mayor o cierre del local, se reembolsa el 100% de las SaleCoins inmediatamente a todos los participantes.
                </li>
                <li>
                  <strong>Cancelación por el Organizador con más de 48h:</strong> Si el creador cancela el plan con más de 48 horas de antelación al horario programado, se reembolsan sus 30 SaleCoins y las 20 SaleCoins a cada uno de los asistentes.
                </li>
                <li>
                  <strong>Penalidad por cancelación tardía (&lt; 48h):</strong> Si el creador cancela a menos de 48 horas del evento, se retienen las 30 monedas como penalidad por no-show; a todos los asistentes inscritos se les reembolsa el 100% de sus monedas.
                </li>
                <li>
                  <strong>Inasistencia injustificada de participantes:</strong> Quienes no asistan al punto de encuentro sin haber cancelado oportunamente no tendrán derecho a reembolso de sus 20 SaleCoins.
                </li>
              </ul>
            </section>
          )}

          {/* Section 5 */}
          {(activeSection === 'all' || activeSection === 'conduct') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">5</span>
                <span>Normas de Convivencia y Código de Conducta</span>
              </h3>
              <p>
                ¿Qué Sale? es un espacio inclusivo, amigable y respetuoso. Queda estrictamente sancionado con suspensión inmediata o expulsión permanente:
              </p>
              <ul className="list-disc pl-5 space-y-1 marker:text-rose-500 text-xs sm:text-sm">
                <li>Cualquier manifestación de discriminación por motivos de género, raza, orientación sexual, religión o condición socioeconómica.</li>
                <li>Acoso verbal, físico, psicológico o insinuaciones no consentidas tanto en los chats de la app como en las salidas presenciales.</li>
                <li>Consumo o distribución de sustancias ilícitas en actividades grupales.</li>
                <li>Comportamientos peligrosos que pongan en riesgo la integridad física de terceros.</li>
              </ul>
            </section>
          )}

          {/* Section 6 */}
          {(activeSection === 'all' || activeSection === 'liability') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">6</span>
                <span>Deslinde de Responsabilidad y Seguridad Personal</span>
              </h3>
              <p>
                La participación en actividades al aire libre, deportes o reuniones sociales es enteramente voluntaria. Cada miembro es responsable de su propia salud, estado físico y cuidado de sus pertenencias (celulares, billeteras, equipos).
              </p>
              <p className="text-xs bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong>Consejo de seguridad:</strong> Recomendamos siempre realizar los primeros encuentros en lugares públicos iluminados y concurridos, mantener informados a amigos o familiares sobre tus planes y coordinar siempre a través del chat de la app.
              </p>
            </section>
          )}

          {/* Section 7 */}
          {(activeSection === 'all' || activeSection === 'privacy') && (
            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">7</span>
                <span>Privacidad y Protección de Datos Personales</span>
              </h3>
              <p>
                Tus datos personales (nombre, correo electrónico, foto de perfil, descripción e intereses) son recopilados con el exclusivo fin de proveer las funcionalidades de la aplicación, emparejarte con salidas acordes a tus gustos y habilitar la comunicación en grupos.
              </p>
              <p>
                No vendemos tus datos a terceras partes. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento desde los ajustes de tu perfil o contactando a nuestro centro de atención.
              </p>
            </section>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Al usar ¿Qué Sale? declaras conocer y aceptar estos términos.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#619c77] hover:bg-[#528a68] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
