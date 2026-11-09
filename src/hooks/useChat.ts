import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Message, SendMessagePayload, ReportUserPayload } from '../types/chat';

// Helper to get raw messages key
const getChatStorageKey = (planId: string) => `quesale_chats_${planId}`;

// Seed data definitions
const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1_1',
      planId: '1',
      senderId: 'user_juan',
      senderName: 'Juan Pérez',
      content: '¡Hola a todos! Salgo de Miraflores. ¿Alguno va a alquilar bici cerca del Parque del Amor?',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      type: 'text',
    },
    {
      id: 'm1_system_1',
      planId: '1',
      senderId: 'system',
      senderName: 'Sistema',
      content: 'Mateo se ha unido al plan 🚲',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      type: 'system',
    },
    {
      id: 'm1_2',
      planId: '1',
      senderId: 'user_mateo',
      senderName: 'Mateo Silva',
      content: '¡Qué tal gente! Yo voy con mi bici montañera de siempre. ¿Saben si el camino en la bajada está libre?',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      type: 'text',
    },
    {
      id: 'm1_3',
      planId: '1',
      senderId: 'user_andrea',
      senderName: 'Andrea Torres',
      content: '¡Hola chicos! Sí, la ciclovía de la Costa Verde está perfecta a esa hora. Yo también alquilaré en el Parque del Amor, ¡venden pases rápidos de Mirabici!',
      createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
      type: 'text',
    },
    {
      id: 'm1_4',
      planId: '1',
      senderId: 'user_mateo',
      senderName: 'Mateo Silva',
      content: '¡Excelente Andrea! ¿Les parece si después de las fotos compramos algo de tomar en Larcomar?',
      createdAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
      type: 'text',
    }
  ],
  '2': [
    {
      id: 'm2_system_1',
      planId: '2',
      senderId: 'system',
      senderName: 'Sistema',
      content: 'Chat de coordinación de Ruta de Grafitis y Café en Barranco iniciado 🎨☕',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      type: 'system',
    },
    {
      id: 'm2_1',
      planId: '2',
      senderId: 'user_valeria',
      senderName: 'Valeria Rivas',
      content: '¡Hola! Qué gran plan. Recomiendo que empecemos por el pasaje de Oroya que tiene unos murales increíbles que acaban de terminar la semana pasada.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'text',
    },
    {
      id: 'm2_2',
      planId: '2',
      senderId: 'user_carlos',
      senderName: 'Carlos Mendoza',
      content: '¡Valeria! Eso suena de lujo. Yo llevo mi cámara reflex para hacer unos retratos urbanos gratis al grupo si se animan. ¿Nos vemos en el Puente de los Suspiros?',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      type: 'text',
    }
  ],
  '3': [
    {
      id: 'm3_system_1',
      planId: '3',
      senderId: 'system',
      senderName: 'Sistema',
      content: '¡Pichanga confirmada! Campo de Marte reservado ⚽🍻',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      type: 'system',
    },
    {
      id: 'm3_1',
      planId: '3',
      senderId: 'user_diego',
      senderName: 'Diego Barreda',
      content: '¡Gente! ¿Quién lleva chalecos o nos dividimos en camiseta blanca / camiseta negra?',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      type: 'text',
    },
    {
      id: 'm3_2',
      planId: '3',
      senderId: 'user_gonzalo',
      senderName: 'Gonzalo Quispe',
      content: 'Hablen, sí tengo un juego entero de chalecos verdes y naranjas de mi pichanga del trabajo, yo los llevo sin problemas. Lleven agua helada que hará calor.',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      type: 'text',
    }
  ],
  '4': [
    {
      id: 'm4_1',
      planId: '4',
      senderId: 'user_mariana',
      senderName: 'Mariana Flores',
      content: '¡Hola golosos! Les aconsejo venir con bastante hambre porque los anticuchos de Doña Grimanesa y los dulces de carretilla de la bajada son una locura.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      type: 'text',
    },
    {
      id: 'm4_2',
      planId: '4',
      senderId: 'user_renzo',
      senderName: 'Renzo Pinasco',
      content: '¡Ufff! Súper apuntado. ¿Llevarán efectivo o todos aceptan Yape/Plin por Surquillo?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'text',
    },
    {
      id: 'm4_3',
      planId: '4',
      senderId: 'user_mariana',
      senderName: 'Mariana Flores',
      content: 'Casi todos aceptan Yape ahora en el mercado, pero mejor si traen unas monedas por si acaso para las propinas de los músicos ambulantes.',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      type: 'text',
    }
  ],
  '5': [
    {
      id: 'm5_system_1',
      planId: '5',
      senderId: 'system',
      senderName: 'Sistema',
      content: '¡Hola! Les damos la bienvenida al chat del Parque de la Amistad 🧘‍♀️☀',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      type: 'system',
    },
    {
      id: 'm5_1',
      planId: '5',
      senderId: 'user_gabriela',
      senderName: 'Gabriela Díaz',
      content: '¡Namasté a todos! Por favor recuerden traer su propio mat de yoga u una manta gruesa para colocar en el césped. La sesión de meditación empezará a las 8:10 AM.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'text',
    },
    {
      id: 'm5_2',
      planId: '5',
      senderId: 'user_lucia',
      senderName: 'Lucía Benavides',
      content: '¡Perfecto Gabriela! Yo me encargo de llevar la canasta con piñas picadas, fresas y jugos naturales de naranja exprimida. ¿Alguien tiene restricciones de comida?',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      type: 'text',
    }
  ]
};

// Initial state builder
const getOrInitializeStorage = (planId: string): Message[] => {
  const key = getChatStorageKey(planId);
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Seed fallback
  const fallback = MOCK_MESSAGES[planId] || [
    {
      id: `sys_${planId}_init`,
      planId,
      senderId: 'system',
      senderName: 'Sistema',
      content: '¡Bienvenido al chat de coordinación grupal de la actividad! Organicen la salida aquí.',
      createdAt: new Date().toISOString(),
      type: 'system'
    }
  ];
  
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
};

// Query Hook: Fetch Messages (supports 5s short polling)
export function useChatMessages(planId: string) {
  return useQuery<Message[]>({
    queryKey: ['chat', planId],
    queryFn: async () => {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      return getOrInitializeStorage(planId);
    },
    refetchInterval: 5000, // Short-polling every 5s for real-time feel
    refetchIntervalInBackground: false,
    staleTime: 3000,
  });
}

function triggerInteractiveReplies(planId: string, userMessage: string, queryClient: any) {
  // Retrieve plan/activity details from localStorage
  const activitiesJson = localStorage.getItem('quesale_activities');
  let actDetail = { title: "Actividad", description: "" };
  if (activitiesJson) {
    try {
      const parsed = JSON.parse(activitiesJson);
      const matched = parsed.find((a: any) => String(a.id) === String(planId));
      if (matched) {
        actDetail = matched;
      }
    } catch (e) {
      console.warn("Error parsing activities context", e);
    }
  }

  const currentMsgs = getOrInitializeStorage(planId);

  // Call the server-side Gemini API proxy to analyze context and respond dynamically
  fetch("/api/chat-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      planId,
      planTitle: actDetail.title,
      planDescription: actDetail.description,
      messages: currentMsgs.map(m => ({
        senderId: m.senderId,
        senderName: m.senderName,
        content: m.content
      })),
      userMessage
    })
  })
  .then(res => res.json())
  .then(data => {
    const replies: any[] = data.replies || [];
    replies.forEach((rep) => {
      setTimeout(() => {
        const storageKey = getChatStorageKey(planId);
        const latestMsgs = getOrInitializeStorage(planId);
        
        // Safety: prevent identical message double-posting
        if (latestMsgs.some(m => m.content === rep.content)) {
          return;
        }

        const responseMsg: Message = {
          id: `m_sim_${Date.now()}_${rep.senderId}`,
          planId,
          senderId: rep.senderId,
          senderName: rep.senderName,
          content: rep.content,
          createdAt: new Date().toISOString(),
          type: 'text',
          senderAvatarUrl: rep.senderAvatarUrl
        };
        
        localStorage.setItem(storageKey, JSON.stringify([...latestMsgs, responseMsg]));
        queryClient.invalidateQueries({ queryKey: ['chat', planId] });

        // Add to notification center and show toast alert
        useNotificationStore.getState().addNotification({
          type: 'chat_message',
          title: `Nuevo mensaje en ${actDetail.title}`,
          message: `${rep.senderName}: "${rep.content}"`,
          linkUrl: `/chat/${planId}`,
          planId,
          activityTitle: actDetail.title,
          senderName: rep.senderName,
          senderAvatarUrl: rep.senderAvatarUrl,
        }, true);
      }, rep.delay);
    });
  })
  .catch(err => {
    console.error("Error triggering dynamic AI replies:", err);
  });
}

// Mutation Hook: Send Message
export function useSendMessageMutation(planId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      if (!user) {
        throw new Error('Debe iniciar sesión para enviar un mensaje.');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const storageKey = getChatStorageKey(payload.planId);
      const messages = getOrInitializeStorage(payload.planId);

      const newMessage: Message = {
        id: `m_${Date.now()}`,
        planId: payload.planId,
        senderId: user.id,
        senderName: user.name,
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
        type: 'text',
        senderAvatarUrl: user.avatarUrl
      };

      const updated = [...messages, newMessage];
      localStorage.setItem(storageKey, JSON.stringify(updated));

      // Trigger interactive automated replies!
      triggerInteractiveReplies(payload.planId, payload.content, queryClient);

      return newMessage;
    },
    // Optimistic updates for real-time UI feel
    onMutate: async (newMessagePayload) => {
      // Cancel refetch queries
      await queryClient.cancelQueries({ queryKey: ['chat', planId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['chat', planId]) || [];

      // Optimistic message
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: Message & { isOptimistic?: boolean } = {
        id: tempId,
        planId: newMessagePayload.planId,
        senderId: user?.id || 'temp_user',
        senderName: user?.name || 'Yo',
        content: newMessagePayload.content,
        createdAt: new Date().toISOString(),
        type: 'text',
        isOptimistic: true // Special flag for UI indicators
      };

      // Set optimistic values
      queryClient.setQueryData<Message[]>(
        ['chat', planId],
        [...previousMessages, optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', planId], context.previousMessages);
      }
    },
    onSettled: () => {
      // Sync on complete
      queryClient.invalidateQueries({ queryKey: ['chat', planId] });
    },
  });
}

// Mutation Hook: Report User Misconduct
export function useReportUserMutation() {
  return useMutation({
    mutationFn: async (payload: ReportUserPayload) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store reports locally for simulation
      const reports = JSON.parse(localStorage.getItem('quesale_reports') || '[]');
      const newReport = {
        id: `rep_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      reports.push(newReport);
      localStorage.setItem('quesale_reports', JSON.stringify(reports));
      
      return newReport;
    }
  });
}

// Function to join system message helper
export function postStorageSystemMessage(planId: string, content: string) {
  const storageKey = getChatStorageKey(planId);
  const messages = getOrInitializeStorage(planId);
  const systemMsg: Message = {
    id: `m_system_${Date.now()}`,
    planId,
    senderId: 'system',
    senderName: 'Sistema',
    content,
    createdAt: new Date().toISOString(),
    type: 'system',
  };
  localStorage.setItem(storageKey, JSON.stringify([...messages, systemMsg]));
}
