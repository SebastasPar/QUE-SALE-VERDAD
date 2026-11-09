import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tourLimaCentroImg from '../assets/images/tour_lima_centro_1780378338545.png';
import picnicOlivarImg from '../assets/images/picnic_olivar_1780378353627.png';
import museoLarcoImg from '../assets/images/museo_larco_1780378369052.png';
import circuitoAguaNocheImg from '../assets/images/circuito_agua_noche_1780378382121.png';
import cuevaLechuzasImg from '../assets/images/cueva_lechuzas_1780378395325.png';
import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';

export interface Activity {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  maxAttendees: number;
  currentAttendees: number;
  location: string;
  isJoined?: boolean;
  imageUrl?: string;
  organizerType?: 'user' | 'venue';
  organizerName?: string;
  creatorId?: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  price?: number;
  priceType?: 'free' | 'paid';
  isCancelled?: boolean;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Bici & Atardecer en la Costa Verde',
    category: 'Deportes',
    description: 'Salida en bicicleta de nivel tranquilo. Paramos en el malecón para fotos, tomamos algo ligero y bajamos la energía del finde. ¡Trae tu bici o alquilamos ahí!',
    date: '2026-05-30',
    time: '16:30',
    maxAttendees: 8,
    currentAttendees: 5,
    location: 'Parque del Amor, Miraflores → Circuito de playas',
    imageUrl: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Mateo R. (Comunidad)',
    distanceKm: 1.5,
    latitude: -12.1264,
    longitude: -77.0366,
    price: 0,
    priceType: 'free',
  },
  {
    id: '2',
    title: 'Ruta de Grafitis y Café en Barranco',
    category: 'Cultura',
    description: 'Caminata fotográfica por los murales más icónicos de Barranco. Paramos en 2 cafeterías de especialidad y terminamos con vista al mar. Ideal para amantes del arte y buena conversación.',
    date: '2026-05-31',
    time: '10:00',
    maxAttendees: 10,
    currentAttendees: 6,
    location: 'Puente de los Suspiros → Bajada de Baños',
    imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Sofía & Diego',
    distanceKm: 3.2,
    latitude: -12.1499,
    longitude: -77.0210,
    price: 15,
    priceType: 'paid',
  },
  {
    id: '3',
    title: 'Pichanga + Cerveza Artesanal en San Isidro',
    category: 'Deportes',
    description: 'Partido amistoso 6vs6, sin presión. Después, picnic con cervezas artesanales locales y snacks. Ven solo o con amigos, aquí todos juegan.',
    date: '2026-05-30',
    time: '15:00',
    maxAttendees: 12,
    currentAttendees: 9,
    location: 'Campo de Marte, San Isidro',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Carlos V. (Club Peloteros)',
    distanceKm: 2.8,
    latitude: -12.0722,
    longitude: -77.0408,
    price: 10,
    priceType: 'paid',
  },
  {
    id: '4',
    title: 'Ruta de Comida Callejera en Surquillo',
    category: 'Gastronomía',
    description: 'Recorrido nocturno por los puestos más famosos: anticuchos, chicharrón, ceviche express y emoliente. Comida real, precios populares y cero pretensiones. ¡Trae hambre y buena vibra!',
    date: '2026-05-29',
    time: '19:00',
    maxAttendees: 8,
    currentAttendees: 7,
    location: 'Mercado de Surquillo → Calle Las Lomas',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Lucía P. (Foodie Lima)',
    distanceKm: 2.1,
    latitude: -12.1128,
    longitude: -77.0142,
    price: 20,
    priceType: 'paid',
  },
  {
    id: '5',
    title: 'Yoga & Picnic en el Parque de la Amistad',
    category: 'Bienestar',
    description: 'Sesión suave de yoga para principiantes + picnic con frutas, panes y jugos naturales. Sin experiencia necesaria, solo ganas de conectar y respirar aire fresco.',
    date: '2026-05-31',
    time: '08:00',
    maxAttendees: 10,
    currentAttendees: 4,
    location: 'Parque de la Amistad, límite San Miguel/Miraflores',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Valeria (Yoga & Aire Libre)',
    distanceKm: 4.8,
    latitude: -12.1332,
    longitude: -76.9922,
    price: 0,
    priceType: 'free',
  },
  {
    id: '11',
    title: 'Tour Histórico por el Centro de Lima',
    category: 'Cultura',
    description: 'Recorrido por el corazón colonial de Lima. Visitamos la Catedral, el Palacio de Gobierno y terminamos con un chifa en el Barrio Chino. Historia, fotos y buena comida en una sola ruta. 🏛️',
    date: '2026-06-06',
    time: '10:00',
    maxAttendees: 12,
    currentAttendees: 4,
    location: 'Plaza de Armas → Catedral → Calle Capón (Barrio Chino)',
    imageUrl: tourLimaCentroImg,
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Guías Libres Lima',
    distanceKm: 8.5,
    latitude: -12.0464,
    longitude: -77.0428,
    price: 0,
    priceType: 'free',
  },
  {
    id: '12',
    title: 'Caminata y Picnic en el Olivar',
    category: 'Bienestar',
    description: 'Mañana tranquila entre árboles centenarios. Caminata ligera, picnic con sandwiches caseros y juegos de mesa bajo la sombra. Ideal para desconectar del ruido de la ciudad. 🌳',
    date: '2026-06-07',
    time: '09:00',
    maxAttendees: 10,
    currentAttendees: 3,
    location: 'Bosque El Olivar, San Isidro',
    imageUrl: picnicOlivarImg,
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Andrea M.',
    distanceKm: 2.5,
    latitude: -12.0975,
    longitude: -77.0353,
    price: 0,
    priceType: 'free',
  },
  {
    id: '13',
    title: 'Arte y Vistas en el Museo Larco',
    category: 'Cultura',
    description: 'Visita guiada al museo con la mejor colección de arte precolombino. Después, café en el jardín con vista a la huaca. Cultura, historia y buena conversación en un solo plan. 🏺✨',
    date: '2026-06-13',
    time: '14:00',
    maxAttendees: 8,
    currentAttendees: 2,
    location: 'Museo Larco, Pueblo Libre',
    imageUrl: museoLarcoImg,
    isJoined: false,
    organizerType: 'venue',
    organizerName: 'Café & Museo Larco (Local Oficial)',
    distanceKm: 6.2,
    latitude: -12.0725,
    longitude: -77.0658,
    price: 35,
    priceType: 'paid',
  },
  {
    id: '14',
    title: 'Circuito Mágico del Agua + Fotos Nocturnas',
    category: 'Bienestar',
    description: 'Noche de luces, agua y colores en el circuito de fuentes más grande del mundo. Tomamos fotos épicas, disfrutamos el espectáculo y terminamos con un picarón. 🌊✨',
    date: '2026-06-05',
    time: '19:00',
    maxAttendees: 10,
    currentAttendees: 5,
    location: 'Parque de la Reserva, Cercado',
    imageUrl: circuitoAguaNocheImg,
    isJoined: false,
    organizerType: 'venue',
    organizerName: 'Parque de la Reserva (Circuito Mágico)',
    distanceKm: 7.9,
    latitude: -12.0694,
    longitude: -77.0336,
    price: 5,
    priceType: 'paid',
  },
  {
    id: '15',
    title: 'Aventura en la Cueva de las Lechuzas',
    category: 'Deportes',
    description: 'Caminata moderada hasta la cueva, exploración guiada y picnic con vista al valle. Trae linterna, agua y ganas de aventura. ¡Descubramos juntos este tesoro escondido de Lima! 🦇',
    date: '2026-06-13',
    time: '15:00',
    maxAttendees: 8,
    currentAttendees: 1,
    location: 'Cueva de las Lechuzas, La Molina',
    imageUrl: cuevaLechuzasImg,
    isJoined: false,
    organizerType: 'user',
    organizerName: 'Trekking Perú Club',
    distanceKm: 14.0,
    latitude: -12.0833,
    longitude: -76.9167,
    price: 0,
    priceType: 'free',
  },
  {
    id: '16',
    title: 'Cata de Cervezas Artesanales & Pizza al Horno',
    category: 'Gastronomía',
    description: 'Cata guiada de 4 estilos de cerveza artesanal local con maridaje de pizzas al horno de leña. Ambiente acogedor, música indie y espacio reservado para la comunidad.',
    date: '2026-05-30',
    time: '20:00',
    maxAttendees: 14,
    currentAttendees: 6,
    location: 'Barbarian Cervecería, Barranco',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'venue',
    organizerName: 'Barbarian Bar (Local Oficial)',
    distanceKm: 3.5,
    latitude: -12.1465,
    longitude: -77.0225,
    price: 45,
    priceType: 'paid',
  },
  {
    id: '17',
    title: 'Noche de Juegos de Mesa & Cócteles Temáticos',
    category: 'Cultura',
    description: 'Mesas abiertas de Catán, Dixit y Carcassonne con demos guiadas por expertos. Disfruta de cócteles temáticos con 2x1 y conoce otros apasionados de los juegos de mesa.',
    date: '2026-05-29',
    time: '19:30',
    maxAttendees: 16,
    currentAttendees: 8,
    location: 'The Geek Bunker Bar, Miraflores',
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    isJoined: false,
    organizerType: 'venue',
    organizerName: 'The Geek Bunker (Local)',
    distanceKm: 0.9,
    latitude: -12.1190,
    longitude: -77.0312,
    price: 15,
    priceType: 'paid',
  }
];

export const getUserJoinedIds = (userId?: string): string[] => {
  const effectiveUserId = userId || useAuthStore.getState().user?.id;
  if (!effectiveUserId) return [];
  try {
    const raw = localStorage.getItem(`quesale_user_joined_${effectiveUserId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setUserJoinedIds = (userId: string, ids: string[]) => {
  try {
    localStorage.setItem(`quesale_user_joined_${userId}`, JSON.stringify(ids));
  } catch {}
};

export const resetUserJoinedActivities = (userId?: string) => {
  const effectiveUserId = userId || useAuthStore.getState().user?.id;
  if (effectiveUserId) {
    try {
      localStorage.removeItem(`quesale_user_joined_${effectiveUserId}`);
    } catch {}
  }
};

export const getStorageActivities = (targetUserId?: string): Activity[] => {
  const effectiveUserId = targetUserId || useAuthStore.getState().user?.id;
  const userJoinedIds = getUserJoinedIds(effectiveUserId);

  let rawList: Activity[] = DEFAULT_ACTIVITIES;
  const stored = localStorage.getItem('quesale_activities');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Activity[];
      let changed = false;

      // Merge any default activities that are missing from the stored list
      const existingIds = new Set(parsed.map(act => act.id));
      const missingDefaults = DEFAULT_ACTIVITIES.filter(act => !existingIds.has(act.id));
      if (missingDefaults.length > 0) {
        parsed.push(...missingDefaults);
        changed = true;
      }

      const migrated = parsed.map((act) => {
        const defaultAct = DEFAULT_ACTIVITIES.find(d => d.id === act.id);
        if (defaultAct) {
          // Sync missing imageUrl or sync specifically for imported static images
          if (!act.imageUrl || (act.id === '3' && act.imageUrl !== defaultAct.imageUrl) || act.id === '11' || act.id === '12' || act.id === '13' || act.id === '14' || act.id === '15') {
            if (act.imageUrl !== defaultAct.imageUrl) {
              act.imageUrl = defaultAct.imageUrl;
              changed = true;
            }
          }
          if (!act.organizerType) {
            act.organizerType = defaultAct.organizerType;
            changed = true;
          }
          if (!act.organizerName) {
            act.organizerName = defaultAct.organizerName;
            changed = true;
          }
          if (act.distanceKm === undefined) {
            act.distanceKm = defaultAct.distanceKm;
            changed = true;
          }
          if (act.latitude === undefined || act.longitude === undefined) {
            act.latitude = defaultAct.latitude;
            act.longitude = defaultAct.longitude;
            changed = true;
          }
          if (act.price === undefined) {
            act.price = defaultAct.price;
            changed = true;
          }
          if (!act.priceType) {
            act.priceType = defaultAct.priceType;
            changed = true;
          }
        } else {
          // User created plans fallback values
          if (!act.organizerType) {
            act.organizerType = 'user';
            changed = true;
          }
          if (act.latitude === undefined) {
            act.latitude = -12.1219;
            changed = true;
          }
          if (act.longitude === undefined) {
            act.longitude = -77.0305;
            changed = true;
          }
          if (act.distanceKm === undefined) {
            act.distanceKm = 1.8;
            changed = true;
          }
          if (act.price === undefined) {
            act.price = 0;
            changed = true;
          }
          if (!act.priceType) {
            act.priceType = 'free';
            changed = true;
          }
        }
        return act;
      });
      if (changed) {
        localStorage.setItem('quesale_activities', JSON.stringify(migrated));
      }
      rawList = migrated;
    } catch {
      rawList = DEFAULT_ACTIVITIES;
    }
  } else {
    localStorage.setItem('quesale_activities', JSON.stringify(DEFAULT_ACTIVITIES));
    rawList = DEFAULT_ACTIVITIES;
  }

  // Strictly compute isJoined dynamically based on the current user's joined list
  return rawList.map((act) => ({
    ...act,
    isJoined: userJoinedIds.includes(act.id),
  }));
};

export const saveStorageActivities = (activities: Activity[]) => {
  localStorage.setItem('quesale_activities', JSON.stringify(activities));
};

// Simulated API calls
const fetchActivities = async (): Promise<Activity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStorageActivities());
    }, 450); // fast dynamic load
  });
};

const fetchActivityById = async (id: string): Promise<Activity> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const activities = getStorageActivities();
      const activity = activities.find((act) => act.id === id);
      if (activity) {
        resolve(activity);
      } else {
        reject(new Error('Activity not found'));
      }
    }, 300);
  });
};

const joinActivityApi = async (id: string): Promise<{ success: boolean; isJoined: boolean }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = useAuthStore.getState().user;
      const userId = user?.id || 'demo-user-1';
      const joinedIds = getUserJoinedIds(userId);
      const currentlyJoined = joinedIds.includes(id);
      const nextJoined = !currentlyJoined;

      const activities = getStorageActivities(userId);
      const index = activities.findIndex((act) => act.id === id);

      if (index === -1) {
        reject(new Error('Activity not found'));
        return;
      }

      const activity = activities[index];

      // SaleCoins verification & transaction
      const wallet = useWalletStore.getState();
      if (nextJoined) {
        // Joining costs 20 SaleCoins (~S/ 2.00)
        if (!wallet.canAfford(20)) {
          reject(new Error('SALECOINS_INSUFFICIENT: Necesitas 20 SaleCoins para reservar tu cupo y confirmar tu asistencia.'));
          return;
        }
        wallet.spendCoins(
          20,
          'Reserva de salida confirmada',
          `Compromiso de asistencia para "${activity.title}" (20 SaleCoins)`,
          'join',
          activity.id
        );
        setUserJoinedIds(userId, [...joinedIds, id]);
      } else {
        // Leaving/cancelling RSVP triggers automatic refund
        wallet.refundCoins(
          20,
          'Reembolso por cancelación de reserva',
          `Devolución automática de 20 SaleCoins por retirarte de "${activity.title}"`,
          activity.id
        );
        setUserJoinedIds(userId, joinedIds.filter((actId) => actId !== id));
      }

      const nextAttendees = nextJoined 
        ? Math.min(activity.maxAttendees, activity.currentAttendees + 1)
        : Math.max(0, activity.currentAttendees - 1);

      try {
        const stored = localStorage.getItem('quesale_activities');
        let catalog: Activity[] = stored ? JSON.parse(stored) : DEFAULT_ACTIVITIES;
        catalog = catalog.map((a) => (a.id === id ? { ...a, currentAttendees: nextAttendees } : a));
        saveStorageActivities(catalog);
      } catch {}

      // Log to coordination chat as a system message
      const sysLog = nextJoined 
        ? '¡Un nuevo integrante se unió al grupo de coordinación y reservó su cupo con SaleCoins! 🎉' 
        : 'Un integrante canceló su asistencia. Sus SaleCoins han sido reembolsadas. 🚪';
      
      import('./useChat').then(({ postStorageSystemMessage }) => {
        postStorageSystemMessage(id, sysLog);
      }).catch((e) => console.warn('Could not post system notification', e));

      // If joined, schedule a realistic welcome chat notification from the group in 12s
      if (nextJoined) {
        setTimeout(() => {
          import('../store/notificationStore').then(({ useNotificationStore }) => {
            const currentJoined = getUserJoinedIds(userId);
            if (currentJoined.includes(id)) {
              useNotificationStore.getState().simulateChatMessage({
                planId: id,
                planTitle: activity.title,
                sender: activity.organizerName ? activity.organizerName.replace(' (Comunidad)', '').replace(' (Local)', '').replace(' (Tú)', '') : 'Anfitrión del plan',
                message: '¡Bienvenido al grupo! Cualquier duda con el punto de encuentro nos avisas por aquí.',
              });
            }
          }).catch(() => {});
        }, 12000);
      }

      resolve({ success: true, isJoined: nextJoined });
    }, 400);
  });
};

export const cancelActivityApi = async (id: string): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const activities = getStorageActivities();
      const index = activities.findIndex((act) => act.id === id);
      if (index === -1) {
        reject(new Error('Activity not found'));
        return;
      }

      const activity = activities[index];
      activity.isCancelled = true;

      try {
        const stored = localStorage.getItem('quesale_activities');
        let catalog: Activity[] = stored ? JSON.parse(stored) : DEFAULT_ACTIVITIES;
        catalog = catalog.map((a) => (a.id === id ? { ...a, isCancelled: true } : a));
        saveStorageActivities(catalog);
      } catch {}

      const wallet = useWalletStore.getState();
      
      // Calculate if cancellation is less than 48h before the event
      let isLateCancellation = false;
      if (activity.date) {
        const timeStr = activity.time || '12:00';
        const actDate = new Date(`${activity.date}T${timeStr}`);
        const validDate = isNaN(actDate.getTime()) ? new Date(activity.date) : actDate;
        if (!isNaN(validDate.getTime())) {
          const diffMs = validDate.getTime() - Date.now();
          isLateCancellation = diffMs < 48 * 60 * 60 * 1000;
        }
      }

      // Automatic guarantee refund for attendees (always protected)
      if (activity.isJoined) {
        wallet.refundCoins(
          20,
          'Reembolso por cancelación de salida (Garantía)',
          `Garantía de reembolso: La salida "${activity.title}" fue cancelada. Tus 20 SaleCoins están de vuelta.`,
          activity.id
        );
        const user = useAuthStore.getState().user;
        if (user?.id) {
          const joined = getUserJoinedIds(user.id);
          setUserJoinedIds(user.id, joined.filter((actId) => actId !== id));
        }
      }

      // If user was creator (new- activity), refund only if cancelled with > 48h notice
      if (id.startsWith('new-')) {
        if (!isLateCancellation) {
          wallet.refundCoins(
            30,
            'Reembolso de garantía (>48h de anticipación)',
            `Devolución de garantía de creación para "${activity.title}" (30 SaleCoins)`,
            activity.id
          );
        } else {
          // Deducted / penalized for cancelling <48h before event
          console.log(`Penalidad aplicada por cancelación tardía (<48h) de ${activity.title}: no se devuelven las 30 SaleCoins.`);
        }
      }

      import('./useChat').then(({ postStorageSystemMessage }) => {
        postStorageSystemMessage(id, '🚨 Esta salida ha sido cancelada por el organizador. Todas las SaleCoins han sido reembolsadas automáticamente a las billeteras de los participantes.');
      }).catch((e) => console.warn('Could not post system notification', e));

      resolve({ success: true });
    }, 400);
  });
};

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  });
};

export const useActivityDetail = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivityById(id),
    enabled: !!id,
  });
};

export const useJoinActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => joinActivityApi(id),
    onMutate: async (id: string) => {
      // Cancel previous queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['activity', id] });
      await queryClient.cancelQueries({ queryKey: ['activities'] });

      // Save previous state snapshots
      const previousActivity = queryClient.getQueryData<Activity>(['activity', id]);
      const previousActivities = queryClient.getQueryData<Activity[]>(['activities']);

      const currentlyJoined = previousActivity?.isJoined ?? false;
      const willJoin = !currentlyJoined;

      // Optimistically update single activity detail cache
      if (previousActivity) {
        queryClient.setQueryData<Activity>(['activity', id], {
          ...previousActivity,
          currentAttendees: willJoin 
            ? Math.min(previousActivity.maxAttendees, previousActivity.currentAttendees + 1)
            : Math.max(0, previousActivity.currentAttendees - 1),
          isJoined: willJoin,
        });
      }

      // Optimistically update main activities feed cache
      if (previousActivities) {
        queryClient.setQueryData<Activity[]>(
          ['activities'],
          previousActivities.map((act) => {
            if (act.id === id) {
              const currentJoinedFeed = act.isJoined ?? false;
              const willJoinFeed = !currentJoinedFeed;
              return {
                ...act,
                currentAttendees: willJoinFeed
                  ? Math.min(act.maxAttendees, act.currentAttendees + 1)
                  : Math.max(0, act.currentAttendees - 1),
                isJoined: willJoinFeed,
              };
            }
            return act;
          })
        );
      }

      return { previousActivity, previousActivities };
    },
    onError: (err, id, context) => {
      // Rollback on any errors
      if (context?.previousActivity) {
        queryClient.setQueryData(['activity', id], context.previousActivity);
      }
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
    },
    onSettled: (data, error, id) => {
      // Invalidate queries to trigger background synchronization and exact checks
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
    },
  });
};

export const useCancelActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelActivityApi(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
    },
  });
};
