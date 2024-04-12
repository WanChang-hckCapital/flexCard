import { z } from 'zod'

export const CreateCardFormSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
  })