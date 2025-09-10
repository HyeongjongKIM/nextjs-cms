import { UserService } from '@/features/user/user-service'
import { ApiResult, createSuccess, createError } from '@/lib/api-result'
import bcrypt from 'bcryptjs'

export class AuthService {
  private static readonly SALT_ROUNDS = 10
  private constructor() {}

  static async login(
    email: string,
    password: string
  ): Promise<ApiResult<{ userId: string }>> {
    try {
      const userResult = await UserService.findByEmail(email)

      if (!userResult.success) {
        return createError('Authentication failed')
      }

      const user = userResult.data

      if (!user) {
        return createError('Invalid email or password')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return createError('Invalid email or password')
      }

      return createSuccess({ userId: user.id })
    } catch (error) {
      console.error('SignIn error:', error)
      return createError('Authentication failed')
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS)
  }
}
