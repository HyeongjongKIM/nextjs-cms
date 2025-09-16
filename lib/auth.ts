'use server';

import { SessionService } from './session';
import { prisma } from './prisma';
import { Role } from './generated/prisma';
import { ROLE } from './constants';

export async function getCurrentUser() {
  const session = await SessionService.getSession();

  if (!session.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return user;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: 'Authentication required',
    };
  }

  if (user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: 'Super Admin access required',
    };
  }

  return {
    success: true,
    user,
  };
}

export async function hasMinimumRole(minimumRole: Role) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return ROLE[user.role].hierarchy >= ROLE[minimumRole].hierarchy;
}
