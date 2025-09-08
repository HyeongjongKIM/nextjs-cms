import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export async function getSession() {
  return getIronSession<{ id: string }>(await cookies(), {
    cookieName: 'nextjs-cms',
    password: process.env.COOKIE_PASSWORD!,
  })
}
