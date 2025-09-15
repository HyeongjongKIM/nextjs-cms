'use server';

import { redirect } from 'next/navigation';
import { SessionService } from '@/lib/session';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/hash-password';
import { SignupFormValues, signupSchema } from './signup-schema';
import { Role } from '@/lib/generated/prisma';

async function signupAction(params: SignupFormValues) {
  const parsedResult = signupSchema.safeParse(params);

  if (!parsedResult.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: z.flattenError(parsedResult.error),
    };
  }

  const { name, email, password } = parsedResult.data;

  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return {
      success: false,
      error: 'Signup is not available. Initial admin already exists.',
    };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
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
