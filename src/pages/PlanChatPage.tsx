import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useActivityDetail, useJoinActivity } from '../hooks/useActivities';
import { useChatMessages, useSendMessageMutation } from '../hooks/useChat';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ErrorBoundary } from 'react-error-boundary';
import { ArrowLeft, Users, ShieldAlert, RefreshCw } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

function ChatErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] rounded-2xl min-h-[300px] border border-[#DDE1E5] dark:border-[#2A2D34] shadow-sm max-w-xl mx-auto mt-12">
      <ShieldAlert className="w-12 h-12 text-rose-500 mb-2" />
      <h3 className="text-md font-black text-[#1C1E21] dark:text-[#F3F4F6] mb-1">Error al sincronizar chat</h3>
      <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] opacity-90 mb-4 max-w-sm leading-relaxed">{error.message || 'Error de conexión'}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reintentar sincronización
      </button>
    </div>
  );
}

export default function PlanChatPageWrapper() {
  const { planId } = useParams<{ planId: string }>();
  const { refetch } = useChatMessages(planId || '');
  
  return (
    <ErrorBoundary FallbackComponent={ChatErrorFallback} onReset={refetch}>
      <PlanChatPage planId={planId || ''} />
    </ErrorBoundary>
  );
}

interface PlanChatPageProps {
  planId: string;
}

const PlanChatPage: React.FC<PlanChatPageProps> = ({ planId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: activity, isLoading: isActivityLoading } = useActivityDetail(planId);
  const { data: messages, isLoading: isMessagesLoading, error: messagesError, refetch } = useChatMessages(planId);
  const sendMessageMutation = useSendMessageMutation(planId);
  const { mutate: joinActivity, isPending: isJoining } = useJoinActivity();

  // Route guarding for unjoined users, or let them unblock and join gracefully
  const isJoined = activity?.isJoined;

  // Mark notifications for this plan as read when opening chat
  useEffect(() => {
    if (planId) {
      const notifs = useNotificationStore.getState().notifications;
      notifs.forEach((n) => {
        if (!n.read && n.planId === planId) {
          useNotificationStore.getState().markAsRead(n.id);
        }
      });
    }
  }, [planId]);

  const handleJoinDirectly = () => {
    joinActivity(planId, {
      onSuccess: () => {
        // Refetch activity and refresh messages
        refetch();
      }
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!isJoined) return;
    await sendMessageMutation.mutateAsync({
      planId,
      content,
    });
  };

  if (isActivityLoading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] max-w-2xl mx-auto">
        <div className="h-14 border-b border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] flex items-center px-4 gap-3 animate-pulse">
          <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex-1 space-y-1.5">
            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-20 p-4">
          <RefreshCw className="w-8 h-8 text-[#008B8B] dark:text-[#14B8A6] animate-spin" />
          <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] font-bold mt-2.5 animate-pulse">Cargando coordinación...</p>
        </div>
      </div>
    );
  }

  // If user is validated but not member of that activity, show gorgeous join invitation card!
  if (activity && !isJoined) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] max-w-2xl mx-auto border-x border-[#DDE1E5] dark:border-[#2A2D34]" id="chat-unjoined-access">
        {/* Simple Header */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#1E2025]/95 backdrop-blur-md border-b border-[#DDE1E5] dark:border-[#2A2D34] px-4 py-3 flex items-center gap-3 shadow-xs">
          <button 
            onClick={() => {
              try {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`/activity/${planId}`);
                }
              } catch {
                navigate(`/activity/${planId}`);
              }
            }} 
            className="p-2 -ml-1 rounded-full text-[#1C1E21] hover:text-[#008B8B] dark:text-[#F3F4F6] dark:hover:text-[#14B8A6] hover:bg-slate-100 dark:hover:bg-[#2A2D34] transition-all cursor-pointer shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
          <span className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6] truncate">{activity.title}</span>
        </div>

        {/* Content Body Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-5 bg-white dark:bg-[#1E2025] m-4 rounded-3xl border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#008B8B]/10 dark:bg-[#14B8A6]/20 text-[#008B8B] dark:text-[#14B8A6] flex items-center justify-center animate-bounce">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-[#1C1E21] dark:text-[#F3F4F6] leading-tight">Únete al grupo de coordinación</h3>
            <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] max-w-sm leading-relaxed mx-auto">
              Este chat grupal es de acceso exclusivo para las personas participantes que se han inscrito en <strong className="text-[#1C1E21] dark:text-[#F3F4F6]">{activity.title}</strong> para coordinar detalles y encontrarse.
            </p>
          </div>

          <div className="w-full pt-2">
            <button
              onClick={handleJoinDirectly}
              disabled={isJoining}
              className="w-full max-w-md mx-auto py-3 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] disabled:opacity-55 disabled:cursor-not-allowed text-white text-base font-black rounded-2xl shadow-lg shadow-[#FF5733]/25 transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              {isJoining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uniéndote al grupo...
                </>
              ) : (
                'Inscribirme y entrar al chat'
              )}
            </button>
            <p className="text-[11px] text-[#65676B] dark:text-[#9CA3AF] mt-2 flex justify-center items-center gap-1 font-semibold">
              <span>Cupos Libres: {activity.maxAttendees - activity.currentAttendees} de {activity.maxAttendees}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#EFEFF1] dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] max-w-2xl mx-auto border-x border-[#DDE1E5] dark:border-[#2A2D34]" id="chat-active-session">
      {/* Header Molecule */}
      <ChatHeader planId={planId} />

      {/* Message List Area */}
      <MessageList 
        messages={messages || []} 
        isLoading={isMessagesLoading} 
      />

      {/* Input Molecule */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isSending={sendMessageMutation.isPending} 
      />
    </div>
  );
};
