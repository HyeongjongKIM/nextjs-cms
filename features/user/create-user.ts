import {
  CreateUserFormValues,
  createUserSchema,
} from '@/features/user/user-schema'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import z from 'zod'

async function createUser(data: CreateUserFormValues) {
  try {
    const validatedData = createUserSchema.parse(data)
    const { name, email, password } = validatedData

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        error: 'User with this email already exists',
        success: false,
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

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

    return {
      user: {
        id: user.id,
      },
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Validation error',
        details: error.issues,
        success: false,
      }
    }
    console.error('Signup error:', error)
    return {
      error: 'Internal server error',
      success: false,
    }
  }
}

export { createUser }
