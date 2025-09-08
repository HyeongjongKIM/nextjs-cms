import { SignupForm } from '@/features/auth/signup-form'
import { redirect } from 'next/navigation'
import { signupAction } from './actions'
import { checkUserExists } from '@/features/user/check-user-exists'

export default async function Signup() {
  const userExists = await checkUserExists()
  if (userExists) redirect('/admin/signin')
  return <SignupForm signupAction={signupAction} />
}
