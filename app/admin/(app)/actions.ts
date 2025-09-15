'use server';

import { SessionService } from '@/lib/session';
import { redirect } from 'next/navigation';

async function logoutAction() {
  await SessionService.destroySession();
  redirect('/admin/signin');
}

export { logoutAction };
