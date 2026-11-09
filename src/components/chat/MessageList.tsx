import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Message } from '../../types/chat';
import { Info, Check } from 'lucide-react';

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic on message list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (isLoading) {
    // Elegant vertical loading skeletons
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl w-full mx-auto" role="log" aria-live="polite">
        <div className="flex gap-2 items-end max-w-[70%]">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-bl-sm p-3 space-y-2 flex-1 shadow-sm">
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex gap-2 items-end max-w-[70%] ml-auto text-right">
          <div className="bg-violet-50 dark:bg-violet-950/20 rounded-2xl rounded-br-sm p-3 space-y-2 flex-1 text-left shadow-sm">
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-slate-200 rounded animate-pulse ml-auto"></div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-6 w-40 bg-slate-100 rounded-full animate-pulse"></div>
        </div>

        <div className="flex gap-2 items-end max-w-[70%]">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-bl-sm p-3 space-y-2 flex-1 shadow-sm">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-3">
        <span className="text-4xl animate-bounce">💬</span>
        <h4 className="text-sm font-black text-[#1C1E21] dark:text-[#F3F4F6]">Aún no hay mensajes</h4>
        <p className="text-xs text-[#65676B] dark:text-[#9CA3AF] max-w-xs leading-relaxed">
          ¡Nadie ha escrito todavía! Sé el primero en saludar y comiencen a organizarse para la salida.
        </p>
        <div ref={bottomRef} />
      </div>
    );
  }

  // Format timestamp helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-w-2xl w-full mx-auto" role="log" id="message-list" aria-live="polite">
      {messages.map((msg) => {
        const isMe = msg.senderId === user?.id;
        const isSystem = msg.type === 'system' || msg.senderId === 'system';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-2 text-center" id={`msg-${msg.id}`}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFEFF1] dark:bg-[#1E2025] border border-[#DDE1E5] dark:border-[#2A2D34] rounded-full shadow-2xs">
                <Info className="w-3.5 h-3.5 text-[#008B8B] dark:text-[#14B8A6]" />
                <span className="text-[11px] font-semibold text-[#65676B] dark:text-[#9CA3AF]">
                  {msg.content}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div 
            key={msg.id} 
            className={`flex gap-2.5 items-end max-w-[82%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
            id={`msg-${msg.id}`}
          >
            {/* Participant avatar (cached deterministic characters) */}
            {!isMe && (
              <div className="w-8 h-8 rounded-full border border-[#DDE1E5] dark:border-[#2A2D34] shadow-xs shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800" title={msg.senderName}>
                <img 
                  src={
                    msg.senderAvatarUrl || (
                      msg.senderId === 'host-1' ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' :
                      msg.senderId === 'host-2' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' :
                      msg.senderId === 'host-3' ? 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' :
                      msg.senderId === 'host-4' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' :
                      msg.senderId === 'host-5' ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' :
                      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80'
                    )
                  } 
                  alt={msg.senderName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {/* Sender label */}
              {!isMe && (
                <span className="text-[11px] font-bold text-[#65676B] dark:text-[#9CA3AF] ml-1">
                  {msg.senderName}
                </span>
              )}
              
              <div className={`px-3.5 py-2.5 rounded-2xl shadow-xs ${
                isMe 
                  ? 'bg-[#008B8B] text-white dark:bg-[#14B8A6] dark:text-[#121316] rounded-br-sm' 
                  : 'bg-white dark:bg-[#1E2025] text-[#1C1E21] dark:text-[#F3F4F6] rounded-bl-sm border border-[#DDE1E5] dark:border-[#2A2D34]'
              }`}>
                {/* Message Body Content */}
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text font-medium">
                  {msg.content}
                </p>
                
                {/* Footer specs inside bubble */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                  isMe ? 'text-white/80 dark:text-[#121316]/75' : 'text-[#65676B] dark:text-[#9CA3AF]'
                }`}>
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMe && <Check className="w-3 h-3 text-white dark:text-[#121316] shrink-0" />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
