import { SignupForm } from '@/features/auth/signup-form'
import { redirect } from 'next/navigation'
import { signupAction } from './actions'
import { UserService } from '@/features/user/user-service'

export default async function Signup() {
  const result = await UserService.exists()
  const userExists = result.success ? result.data : false
  if (userExists) redirect('/admin/signin')
  return <SignupForm signupAction={signupAction} />
}
