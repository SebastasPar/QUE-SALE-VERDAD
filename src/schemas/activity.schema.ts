import { z } from 'zod';
import { startOfDay } from 'date-fns';

export const activitySchema = z.object({
  title: z.string().min(10, 'El título debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  date: z.string().refine((val) => {
    const selectedDate = startOfDay(new Date(val));
    const today = startOfDay(new Date());
    return selectedDate >= today;
  }, {
    message: 'La fecha no puede ser anterior al día de hoy',
  }),
  time: z.string().min(1, 'Selecciona una hora'),
  maxAttendees: z.coerce.number().min(2, 'Debe haber al menos 2 cupos').max(20, 'El máximo de cupos es 20'),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  image: z.any().optional(), // File upload handling out of current strict scope
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
