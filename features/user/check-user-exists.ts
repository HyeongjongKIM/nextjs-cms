import { prisma } from '@/lib/prisma'

async function checkUserExists() {
  const user = await prisma.user.findFirst()
  if (user) {
    return true
  }
  return false
}

export { checkUserExists }
