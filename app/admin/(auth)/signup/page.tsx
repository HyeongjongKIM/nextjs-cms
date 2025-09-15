import { SignupForm } from './signup-form';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function Signup() {
  const user = await prisma.user.findFirst({
    select: { id: true },
  });

  if (user) {
    redirect('/admin/signin');
  }

  return <SignupForm />;
}
