'use server'

import { SigninFormValues } from '@/features/auth/signin-schema'
import { AuthService } from '@/features/auth/auth-service'
import { SessionService } from '@/lib/session'
import { redirect } from 'next/navigation'

async function signinAction(params: SigninFormValues) {
  const result = await AuthService.login(params.email, params.password)

  if (result.success) {
    await SessionService.setSession(result.data.userId)
    redirect('/admin/dashboard')
  } else {
    return {
      success: false,
      error: result.error,
    }
  }
}

export { signinAction }
