import { UserService } from '@/features/user/user-service'
import { signinAction } from './actions'

import { LoginForm } from '@/features/auth/login-form'
import { redirect } from 'next/navigation'

export default async function Signin() {
  const result = await UserService.exists()
  const userExists = result.success ? result.data : false
  if (!userExists) redirect('/admin/signup')
  return <LoginForm signinAction={signinAction} />
}
