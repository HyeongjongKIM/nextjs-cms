import { SigninForm } from './signin-form'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function Signin() {
  const user = await prisma.user.findFirst({
    select: { id: true },
  })
  if (!user) {
    redirect('/admin/signup')
  }
  return <SigninForm />
}
