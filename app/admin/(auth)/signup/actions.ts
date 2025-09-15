'use server';

import {
  CreateUserFormValues,
  createUserSchema,
} from '@/app/admin/(app)/collections/users/user-schema';
import { redirect } from 'next/navigation';
import { SessionService } from '@/lib/session';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/hash-password';

async function signupAction(params: CreateUserFormValues) {
  const parsedResult = createUserSchema.safeParse(params);

  if (!parsedResult.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: z.flattenError(parsedResult.error),
    };
  }

  const { name, email, password } = parsedResult.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: 'User with this email already exists',
    };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
    },
  });

  if (user) {
    await SessionService.setSession(user.id);
    redirect('/admin/dashboard');
  } else {
    return {
      success: false,
      error: 'Failed to create user',
    };
  }
}

export { signupAction };
