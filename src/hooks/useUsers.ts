import { useAuthStore } from '../store/authStore';
import { Activity, getStorageActivities } from './useActivities';

export interface Review {
  id: string;
  activityId?: string;
  activityName?: string;
  reviewerName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CompletedActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  rating: number;
  reviews: {
    id: string;
    reviewerName: string;
    avatarUrl: string;
    comment: string;
    rating: number;
    date: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  email: string;
  interests: string[];
  rating: number;
  reviewsCount: number;
  badge: string;
  xpPoints: number;
  reviews: Review[];
  activities: Activity[];
  avatarUrl?: string;
  completedActivities?: CompletedActivity[];
}

const DEFAULT_COMPLETED_ACTIVITIES: CompletedActivity[] = [
  {
    id: 'past-1',
    title: 'Tarde de Juegos de Mesa en Miraflores',
    date: '14 de Mayo, 2026',
    description: 'Reunión grupal para disfrutar de juegos de mesa modernos (Catan, Dixit, Carcassonne, etc.) con delicioso café limeño de especialidad.',
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    reviews: [
      {
        id: 'pres-1-1',
        reviewerName: 'Matias S.',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
        comment: '¡Súper divertido! La selección de juegos estuvo genial y conocí gente increíble. Repito de todas.',
        rating: 5,
        date: 'Hace 3 días'
      },
      {
        id: 'pres-1-2',
        reviewerName: 'Flavia R.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'Muy buena organización, el anfitrión explicó genial las reglas para los nuevos. Buenazo todo.',
        rating: 5,
        date: 'Hace 5 días'
      }
    ]
  },
  {
    id: 'past-2',
    title: 'Caminata por el Centro Histórico',
    date: '28 de Abril, 2026',
    description: 'Recorrido peatonal fotográfico explorando los majestuosos balcones coloniales de Jirón de la Unión y degustación de tradicionales churros de San Francisco.',
    imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=400&q=80',
    rating: 4.5,
    reviews: [
      {
        id: 'pres-2-1',
        reviewerName: 'Renzo P.',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'El recorrido histórico estuvo muy bien planificado. Los churros del final fueron un golazo de todas maneras.',
        rating: 5,
        date: 'Hace 2 semanas'
      },
      {
        id: 'pres-2-2',
        reviewerName: 'Luciana M.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'Linda caminata para reconectar con el centro de nuestra ciudad. Gran conversación grupal.',
        rating: 4,
        date: 'Hace 3 semanas'
      }
    ]
  },
  {
    id: 'past-3',
    title: 'Taller de Cerámica y Café en Barranco',
    date: '12 de Abril, 2026',
    description: 'Introducción básica guiada al modelado en arcilla hecho a mano mientras disfrutamos de aromáticos cafés peruanos de especialidad.',
    imageUrl: 'https://images.unsplash.com/photo-1565192647048-f997ded87958?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    reviews: [
      {
        id: 'pres-3-1',
        reviewerName: 'Gabriela D.',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'Una tarde súper relajante y creativa. Me encantó moldear mi primera taza.',
        rating: 5,
        date: 'Hace 1 mes'
      },
      {
        id: 'pres-3-2',
        reviewerName: 'Carlos M.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'Excelente taller, materiales de primera calidad y el café de especialidad buenazo.',
        rating: 5,
        date: 'Hace 1 mes'
      }
    ]
  }
];

const STATIC_PROFILES: Record<string, Omit<UserProfile, 'activities'>> = {
  'host-1': {
    id: 'host-1',
    name: 'Alejandro Vargas',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Apasionado del deporte al aire libre y el ciclismo urbano. Llevo 5 años recorriendo la Costa Verde y siempre encuentro la mejor ruta para disfrutar del atardecer con el grupo.',
    email: 'alejandro.vargas@stitch.pe',
    interests: ['fitness', 'travel', 'sports'],
    rating: 4.8,
    reviewsCount: 18,
    badge: 'Anfitrión PRO',
    xpPoints: 340,
    reviews: [
      {
        id: 'rev-1',
        reviewerName: 'Fernanda L.',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: '¡Súper divertido el recorrido! Alejandro conoce muy bien las ciclovías y nos dio tips excelentes sobre seguridad. Los snacks del final estuvieron geniales.',
        date: 'Hace 4 días',
        activityName: 'Ciclismo Costa Verde'
      },
      {
        id: 'rev-2',
        reviewerName: 'Renzo M.',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 4,
        comment: 'Amigable y con muy buena vibra. Un plan súper relajante para bajar las revoluciones de la semana. Recomiendo totalmente ir con él.',
        date: 'Hace 1 semana',
        activityName: 'Ciclismo Costa Verde'
      },
      {
        id: 'rev-3',
        reviewerName: 'Jimena P.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: '¡El mejor sunset de Lima! Coordinó todo de manera impecable y nos hizo sentir integrados desde el primer minuto.',
        date: 'Hace 2 semanas',
        activityName: 'Ciclismo Costa Verde'
      }
    ]
  },
  'host-2': {
    id: 'host-2',
    name: 'Luciana Méndez',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Artista visual and amante del buen café. Me encanta recorrer Barranco, capturar el arte urbano de Lima en fotos y compartir historias detrás de cada graffiti con nuevos amigos.',
    email: 'luciana.mendez@stitch.pe',
    interests: ['art', 'photography', 'cinema', 'cooking'],
    rating: 4.9,
    reviewsCount: 32,
    badge: 'Creadora Estrella',
    xpPoints: 650,
    reviews: [
      {
        id: 'rev-4',
        reviewerName: 'Diego S.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: 'Luciana siempre tiene anécdotas increíbles de cada grafiti. Los dos cafés de especialidad que nos recomendó estuvieron de nivel mundial.',
        date: 'Hace 2 días',
        activityName: 'Ruta Fotográfica Barranco'
      },
      {
        id: 'rev-5',
        reviewerName: 'Camila G.',
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb1e2?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: 'Súper atenta y paciente para explicarnos todo sobre la composición fotográfica. El grupo fue re Contra amigable.',
        date: 'Hace 3 semanas',
        activityName: 'Ruta Fotográfica Barranco'
      }
    ]
  },
  'host-3': {
    id: 'host-3',
    name: 'Renato Castillo',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Ingeniero de día, jugador de fútbol los fines de semana. Organizo pichangas para divertirnos, hacer deporte y cerrar con broche de oro conversando con unas buenas cervezas locales.',
    email: 'renato.castillo@stitch.pe',
    interests: ['sports', 'tech', 'investing'],
    rating: 4.7,
    reviewsCount: 25,
    badge: 'Líder de Comunidad',
    xpPoints: 290,
    reviews: [
      {
        id: 'rev-6',
        reviewerName: 'Sebastián V.',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: 'La organización fue de 10. Renato separó la cancha con tiempo, trajo chalecos limpios y armó equipos súper parejos. La cerveza del final cayó espectacular.',
        date: 'Hace 1 día',
        activityName: 'Pichanga en Miraflores'
      },
      {
        id: 'rev-7',
        reviewerName: 'Lucía B.',
        avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 4,
        comment: 'Muy buena energía el grupo. Todos jugamos de forma súper sana e integradora. Se nota el buen ambiente que genera Renato.',
        date: 'Hace 1 mes',
        activityName: 'Pichanga en Miraflores'
      }
    ]
  },
  'host-4': {
    id: 'host-4',
    name: 'Valeria Rojas',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Foodie empedernida dedicada a recorrer cada esquina culinaria de Lima. Creo que la comida en la calle cuenta la mejor historia de nuestra cultura, sin poses ni formalismos.',
    email: 'valeria.rojas@stitch.pe',
    interests: ['cooking', 'travel', 'music'],
    rating: 4.9,
    reviewsCount: 41,
    badge: 'Crítica Gourmet',
    xpPoints: 780,
    reviews: [
      {
        id: 'rev-8',
        reviewerName: 'Mauricio K.',
        avatarUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: '¡Ufff, los mejores anticuchos que he probado en mi vida! Valeria nos llevó a huariques caletas que nunca hubiese descubierto solo. ¡Repito seguro!',
        date: 'Hace 3 días',
        activityName: 'Ruta Gastronómica Callejera'
      },
      {
        id: 'rev-9',
        reviewerName: 'Natalia T.',
        avatarUrl: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: 'Un recorrido gastronómico inolvidable. El ambiente, los sabores del emoliente con hierbas curativas y las risas del grupo hicieron de esta noche una joya.',
        date: 'Hace 1 semana',
        activityName: 'Ruta Gastronómica Callejera'
      }
    ]
  },
  'host-5': {
    id: 'host-5',
    name: 'Camila Torres',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Instructora certificada de yoga y amante de la meditación mindfullness en espacios verdes. Mi meta es crear espacios de paz y desconexión total en medio de la ruidosa ciudad.',
    email: 'camila.torres@stitch.pe',
    interests: ['yoga', 'sustainability', 'fitness'],
    rating: 4.8,
    reviewsCount: 15,
    badge: 'Embajadora Zen',
    xpPoints: 220,
    reviews: [
      {
        id: 'rev-10',
        reviewerName: 'Paola F.',
        avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: 'La clase con Camila fue mágica. Te guía con mucha calma y el picnic con jugos orgánicos y ensaladas de fruta al final fue la combinación perfecta.',
        date: 'Hace 5 días',
        activityName: 'Yoga y Meditación'
      },
      {
        id: 'rev-11',
        reviewerName: 'Andrea D.',
        avatarUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 4,
        comment: 'Me sentí renovada. No importa si eres principiante, Camila adapta las posturas de yoga para todos con mucha calidez.',
        date: 'Hace 2 semanas',
        activityName: 'Yoga y Meditación'
      }
    ]
  }
};

const buildCompletedActivitiesFromReviews = (reviews: Review[]): CompletedActivity[] => {
  const groups: Record<string, CompletedActivity> = {};
  
  reviews.forEach((rev) => {
    const actName = rev.activityName || 'Plan General';
    if (!groups[actName]) {
      const idSafe = actName.replace(/\s+/g, '-').toLowerCase();
      groups[actName] = {
        id: `past-${idSafe}`,
        title: actName,
        description: `Plan exitoso de "${actName}" completado de forma grupal con la mejor vibra en Lima.`,
        date: rev.date || 'Hace poco',
        imageUrl: actName.includes('Ciclismo') ? 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80' : 
                  actName.includes('Fotográfica') ? 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80' :
                  actName.includes('Pichanga') ? 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80' :
                  actName.includes('Gastronómica') ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80' :
                  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
        rating: 5,
        reviews: []
      };
    }
    groups[actName].reviews.push({
      id: rev.id || `r-p-${Math.random()}`,
      reviewerName: rev.reviewerName,
      avatarUrl: rev.avatarUrl,
      comment: rev.comment,
      rating: rev.rating,
      date: rev.date
    });
  });
  
  return Object.values(groups).map((g) => {
    const avg = g.reviews.reduce((sum, r) => sum + r.rating, 0) / g.reviews.length;
    g.rating = Math.round(avg * 10) / 10;
    return g;
  });
};

export const useUserProfile = (profileId?: string): UserProfile | null => {
  const { user } = useAuthStore();
  const allActivities = getStorageActivities();

  // If no profileId specified or if profileId represents our current user, return current logged-in user profile
  if (!profileId || profileId === 'me' || (user && profileId === user.id)) {
    if (!user) return null;
    
    // User's own created or joined activities (isolated strictly to current user)
    const userActivities = allActivities.filter(act => 
      act.isJoined || (act.creatorId && user.id && act.creatorId === user.id)
    );

    return {
      id: user.id || 'me',
      name: user.name || 'Usuario',
      bio: user.bio && user.bio.trim() !== '' 
        ? user.bio 
        : 'Miembro activo de la comunidad ¿Qué Sale?. Me encanta sumarme a planes grupales y conectar con personas con intereses afines.',
      email: user.email || 'usuario@quesale.pe',
      interests: user.interests || [],
      rating: 5.0,
      reviewsCount: 6,
      badge: 'Miembro Activo',
      xpPoints: 120,
      reviews: [], // No more personal comments
      activities: userActivities,
      completedActivities: DEFAULT_COMPLETED_ACTIVITIES,
      avatarUrl: user.avatarUrl || ''
    };
  }

  // Find host
  const staticProfile = STATIC_PROFILES[profileId];
  if (!staticProfile) {
    // If dynamic host ID not in static profile, create dynamic proxy
    const hostIdx = profileId.replace('host-', '');
    const defaultHostName = `Líder del grupo ${hostIdx}`;
    
    const hostActivities = allActivities.filter(act => act.id === hostIdx);
    const mockHostReviews = [
      {
        id: 'dyn-rev-1',
        reviewerName: 'Socio Stitch',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80',
        rating: 5,
        comment: '¡Gran anfitrión! Volvería a salir a una actividad propuesta por él.',
        date: 'Reciente',
        activityName: 'Actividad de la Comunidad'
      }
    ];

    return {
      id: profileId,
      name: defaultHostName,
      bio: `Miembro de la comunidad Stitch entusiasmado por organizar planes de categoría grupal en Lima.`,
      email: `host.${profileId}@stitch.pe`,
      interests: ['sports', 'tech'],
      rating: 4.8,
      reviewsCount: 1,
      badge: 'Organizador local',
      xpPoints: 100,
      reviews: [], // No more personal comments
      activities: hostActivities,
      completedActivities: buildCompletedActivitiesFromReviews(mockHostReviews)
    };
  }

  // Filter activities matching the host
  const hostActivityId = profileId.replace('host-', '');
  const hostActivities = allActivities.filter(act => act.id === hostActivityId);

  return {
    ...staticProfile,
    reviews: [], // No more personal comments
    activities: hostActivities,
    completedActivities: buildCompletedActivitiesFromReviews(staticProfile.reviews)
  };
};

export const getHostForActivity = (activityId: string) => {
  // Map standard activity IDs to respective static hosts
  if (activityId === '1') return STATIC_PROFILES['host-1'];
  if (activityId === '2') return STATIC_PROFILES['host-2'];
  if (activityId === '3') return STATIC_PROFILES['host-3'];
  if (activityId === '4') return STATIC_PROFILES['host-4'];
  if (activityId === '5') return STATIC_PROFILES['host-5'];
  if (activityId === '11') return STATIC_PROFILES['host-2']; // Luciana Méndez
  if (activityId === '12') return STATIC_PROFILES['host-5']; // Camila Torres
  if (activityId === '13') return STATIC_PROFILES['host-2']; // Luciana Méndez
  if (activityId === '14') return STATIC_PROFILES['host-4']; // Valeria Rojas
  if (activityId === '15') return STATIC_PROFILES['host-1']; // Alejandro Vargas

  // Fallback host or current logged in user if created by user
  return {
    id: 'host-1',
    name: 'Alejandro Vargas',
    bio: 'Apasionado del deporte al aire libre y el ciclismo urbano.',
    email: 'alejandro.vargas@stitch.pe',
    interests: ['fitness', 'sports'],
    rating: 4.8,
    reviewsCount: 18,
    badge: 'Anfitrión PRO',
    xpPoints: 340,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
  };
};
