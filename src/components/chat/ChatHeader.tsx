import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Users, CheckCircle, ShieldAlert } from 'lucide-react';
import { useActivityDetail } from '../../hooks/useActivities';
import { useReportUserMutation } from '../../hooks/useChat';

export interface ChatHeaderProps {
  planId: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ planId }) => {
  const navigate = useNavigate();
  const { data: activity } = useActivityDetail(planId);
  const reportMutation = useReportUserMutation();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportedName, setReportedName] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportError('');
    if (!reportedName.trim()) {
      setReportError('Por favor ingresa el nombre de la persona.');
      return;
    }
    if (!reportReason.trim() || reportReason.length < 10) {
      setReportError('Por favor ingresa un motivo válido (mínimo 10 caracteres).');
      return;
    }

    reportMutation.mutate({
      reportedUserId: `user_${Date.now()}`,
      reportedUserName: reportedName,
      reason: reportReason,
    }, {
      onSuccess: () => {
        setReportSuccess(true);
        setTimeout(() => {
          setIsReportOpen(false);
          setReportSuccess(false);
          setReportedName('');
          setReportReason('');
        }, 2000);
      },
      onError: () => {
        setReportError('Hubo un problema al enviar el reporte. Inténtalo de nuevo.');
      }
    });
  };

  const handleBack = () => {
    try {
      // Use history to go back to the previous screen (Feed, Chats list, or Activity detail)
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(`/activity/${planId}`);
      }
    } catch {
      navigate(`/activity/${planId}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 flex items-center justify-between shadow-xs max-w-2xl mx-auto" id="chat-header">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={handleBack} 
            className="p-2 -ml-1 rounded-full text-[#1C1E21] dark:text-[#F3F4F6] hover:text-[#008B8B] dark:hover:text-[#14B8A6] hover:bg-slate-100 dark:hover:bg-[#121316] transition-all shrink-0 cursor-pointer"
            aria-label="Volver a la página anterior"
            id="chat-back-btn"
          >
            <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
          
          <div className="min-w-0">
            <h2 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] truncate leading-tight">
              {activity ? activity.title : 'Cargando plan...'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {activity?.category || '---'}
              </span>
              <span className="text-xs text-[#65676B] dark:text-[#9CA3AF] font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-[#65676B] dark:text-[#9CA3AF]" />
                {activity ? `${activity.currentAttendees}/${activity.maxAttendees} asistiendo` : '--'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsReportOpen(true)}
          className="p-2 text-[#65676B] dark:text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors shrink-0 cursor-pointer" 
          title="Reportar usuario o comportamiento indebido"
          id="chat-report-btn"
          aria-haspopup="dialog"
        >
          <Flag className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Report Modal overlay */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <div className="bg-white dark:bg-[#1E2025] rounded-3xl p-5 w-full max-w-md shadow-2xl border border-[#DDE1E5] dark:border-[#2A2D34] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-red-600 mb-3" id="report-modal-title">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6]">Reportar Comportamiento</h3>
            </div>
            
            <p className="text-[#65676B] dark:text-[#9CA3AF] text-xs mb-4 leading-relaxed">
              Mantenemos "¿Qué Sale?" seguro. Si un participante está siendo irrespetuoso, enviando spam o saboteando la coordinación, repórtalo aquí.
            </p>

            {reportSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl flex flex-col items-center justify-center text-center py-6 animate-pulse">
                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="font-bold text-sm">Reporte Enviado</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">El equipo de "¿Qué Sale?" revisará este caso de inmediato.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reported-name" className="block text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] mb-1">
                    ¿A quién deseas reportar?
                  </label>
                  <input
                    type="text"
                    id="reported-name"
                    value={reportedName}
                    onChange={(e) => setReportedName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl bg-[#EFEFF1]/60 dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#008B8B] placeholder-[#65676B]/60"
                    disabled={reportMutation.isPending}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="report-reason" className="block text-xs font-bold text-[#1C1E21] dark:text-[#F3F4F6] mb-1">
                    Describe el motivo del reporte
                  </label>
                  <textarea
                    id="report-reason"
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Mínimo 10 caracteres. Por ejemplo, insultos, contenido inadecuado, intento de estafa..."
                    className="w-full px-3.5 py-2.5 border border-[#DDE1E5] dark:border-[#2A2D34] rounded-xl bg-[#EFEFF1]/60 dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#008B8B] placeholder-[#65676B]/60 resize-none"
                    disabled={reportMutation.isPending}
                    required
                  ></textarea>
                  <p className="text-[10px] text-[#65676B] dark:text-[#9CA3AF] mt-1 flex justify-between">
                    <span>Sé lo más descriptivo posible</span>
                    <span className={reportReason.length >= 10 ? 'text-emerald-600 font-bold' : 'text-[#65676B] dark:text-[#9CA3AF]'}>
                      {reportReason.length}/10 caracteres mín.
                    </span>
                  </p>
                </div>

                {reportError && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold" role="alert">
                    {reportError}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportOpen(false);
                      setReportError('');
                    }}
                    className="px-4 py-2 text-[#65676B] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    disabled={reportMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    disabled={reportMutation.isPending}
                  >
                    {reportMutation.isPending ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
