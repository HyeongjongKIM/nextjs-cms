import { prisma } from '@/lib/prisma'
import { ApiResult, createSuccess, createError } from '@/lib/api-result'
import { CreateUserFormValues } from '@/features/user/user-schema'
import { User } from '@/lib/generated/zod'
import { AuthService } from '@/features/auth/auth-service'
import { z } from 'zod'

export class UserService {
  private constructor() {}

  static async create(
    data: CreateUserFormValues
  ): Promise<ApiResult<Pick<User, 'id'>>> {
    try {
      const { name, email, password } = data

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return createError('User with this email already exists')
      }

      // Hash password using AuthService
      const hashedPassword = await AuthService.hashPassword(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
        },
      })

      return createSuccess(user)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createError('Validation error', error.issues)
      }

      console.error('User creation error:', error)
      return createError('Failed to create user')
    }
  }

  static async exists(): Promise<ApiResult<boolean>> {
    try {
      const user = await prisma.user.findFirst({
        select: { id: true },
      })

      return createSuccess(!!user)
    } catch (error) {
      console.error('User exists check error:', error)
      return createError('Failed to check if user exists')
    }
  }

  static async findByEmail(email: string): Promise<ApiResult<User | null>> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      return createSuccess(user)
    } catch (error) {
      console.error('Find user by email error:', error)
      return createError('Failed to find user by email')
    }
  }
}
