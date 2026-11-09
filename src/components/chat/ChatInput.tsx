import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';

// Validation Schema
const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje tiene un límite de 500 caracteres'),
});

type ChatFormValues = z.infer<typeof chatMessageSchema>;

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChatFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: '',
    },
  });

  const contentValue = watch('content') || '';
  const charCount = contentValue.length;

  const onSubmit = async (data: ChatFormValues) => {
    if (isSending || !data.content.trim()) return;
    try {
      await onSendMessage(data.content);
      reset({ content: '' }); // Clear input on success
    } catch {
      // Errors handled elegantly by parent hooks
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents newline
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="border-t border-[#DDE1E5] dark:border-[#2A2D34] bg-white dark:bg-[#1E2025] p-3 bottom-0 sticky max-w-2xl mx-auto w-full z-35 shadow-xs" id="chat-input-container">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1.5">
        <div className="flex items-end gap-2.5">
          <div className="relative flex-1">
            <textarea
              {...register('content')}
              rows={1}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              maxLength={500}
              placeholder="Escribe un mensaje aquí... (Enter para enviar)"
              className="w-full pl-3.5 pr-14 py-2.5 border border-[#DDE1E5] dark:border-[#2A2D34] rounded-2xl bg-[#EFEFF1]/60 dark:bg-[#121316] text-[#1C1E21] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#008B8B] dark:focus:ring-[#14B8A6] focus:border-[#008B8B] dark:focus:border-[#14B8A6] placeholder-[#65676B]/60 max-h-32 resize-none leading-relaxed"
              id="chat-message-textarea"
              aria-label="Contenido del mensaje"
              aria-invalid={!!errors.content}
            />
            {/* Embedded Character count indicator */}
            <span 
              className={`absolute right-3 bottom-2.5 text-[10px] font-bold ${
                charCount >= 450 ? 'text-red-500' : charCount >= 400 ? 'text-amber-500' : 'text-[#65676B] dark:text-[#9CA3AF]'
              }`}
            >
              {charCount}/500
            </span>
          </div>

          <button
            type="submit"
            disabled={isSending || charCount === 0 || charCount > 500}
            className="p-2.5 bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] text-white rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
            id="chat-send-btn"
            aria-label="Enviar mensaje"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Validation Error Feedback */}
        {errors.content && (
          <p className="text-xs text-red-500 font-bold px-1" role="alert" id="chat-error-message">
            ⚠️ {errors.content.message}
          </p>
        )}
      </form>
    </div>
  );
};
