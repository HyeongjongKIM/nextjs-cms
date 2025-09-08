'use server'

import { createUser } from '@/features/user/create-user'
import { CreateUserFormValues } from '@/features/user/user-schema'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

async function signupAction(params: CreateUserFormValues) {
  const res = await createUser(params)

  if (res.success && res.user?.id) {
    const session = await getSession()

    session.id = res.user.id
    await session.save()
    redirect('/admin/dashboard')
  } else {
    return res
  }
}

export { signupAction }
