'use server'

import { UserService } from '@/features/user/user-service'
import {
  CreateUserFormValues,
  createUserSchema,
} from '@/features/user/user-schema'
import { redirect } from 'next/navigation'
import { SessionService } from '@/lib/session'
import { z } from 'zod'

async function signupAction(params: CreateUserFormValues) {
  // Validate data first
  try {
    createUserSchema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        details: error.issues,
      }
    }
  }

  const res = await UserService.create(params)

  if (res.success) {
    await SessionService.setSession(res.data.id)
    redirect('/admin/dashboard')
  } else {
    return {
      success: false,
      error: res.error,
    }
  }
}

export { signupAction }
