'use server'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

async function logoutAction() {
  const session = await getSession()
  session.destroy()
  redirect('/admin/signin')
}

export { logoutAction }
