import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export class SessionService {
  private constructor() {}

  static async getSession() {
    return getIronSession<{ id: string }>(await cookies(), {
      cookieName: 'nextjs-cms',
      password: process.env.COOKIE_PASSWORD!,
    });
  }

  static async setSession(id: string) {
    const session = await this.getSession();
    session.id = id;
    await session.save();
  }

  static async destroySession() {
    const session = await this.getSession();
    session.destroy();
  }
}
