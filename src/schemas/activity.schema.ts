import { z } from 'zod';
import { startOfDay } from 'date-fns';

export const activitySchema = z.object({
  title: z.string().min(10, 'El título debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  date: z.string().refine((val) => {
    if (!val) return false;
    const normalized = val.includes('T') ? val : `${val}T00:00:00`;
    const selectedDate = startOfDay(new Date(normalized));
    const today = startOfDay(new Date());
    return selectedDate >= today;
  }, {
    message: 'La fecha no puede ser anterior al día de hoy',
  }),
  time: z.string().min(1, 'Selecciona una hora'),
  maxAttendees: z.coerce.number().min(2, 'Debe haber al menos 2 cupos').max(50, 'El máximo de cupos es 50'),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  priceType: z.enum(['free', 'paid']).optional(),
  discountOffer: z.string().max(80, 'Máximo 80 caracteres').optional(),
  branchAddress: z.string().optional(),
  image: z.any().optional(), // File upload handling out of current strict scope
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
