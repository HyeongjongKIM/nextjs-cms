import { UserSchema } from '@/lib/generated/zod';
import { z } from 'zod';

const createUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export { createUserSchema, type CreateUserFormValues };
