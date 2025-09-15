'use server';

import { CreateUserFormValues, createUserSchema } from './user-schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/hash-password';
import { requireSuperAdmin } from '@/lib/auth';

export async function createUserAction(params: CreateUserFormValues) {
  const authResult = await requireSuperAdmin();
  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    };
  }

  const parsedResult = createUserSchema.safeParse(params);

  if (!parsedResult.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: z.flattenError(parsedResult.error),
    };
  }

  const { name, email, password, role } = parsedResult.data;

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

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Revalidate the users page to show the new user
    revalidatePath('/admin/collections/users');

    return {
      success: true,
      data: user,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to create user',
    };
  }
}
