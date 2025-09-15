'use server';

import { SigninFormValues, signinSchema } from './signin-schema';
import { SessionService } from '@/lib/session';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function signinAction(params: SigninFormValues) {
  const parsedResult = signinSchema.safeParse(params);

  if (!parsedResult.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: z.flattenError(parsedResult.error),
    };
  }

  const { email, password } = parsedResult.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  await SessionService.setSession(user.id);
  redirect('/admin/dashboard');
}

export { signinAction };
