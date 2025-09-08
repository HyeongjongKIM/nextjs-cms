"use server";

import { SigninFormValues } from "@/features/auth/signin-schema";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

async function signinAction(params: SigninFormValues) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: params.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const isPasswordValid = await bcrypt.compare(
      params.password,
      user?.password || ""
    );

    if (!isPasswordValid || !user)
      return {
        error: "Invalid email or password",
        success: false,
      };

    const session = await getSession();
    session.id = user.id;
    await session.save();
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Internal server error",
      success: false,
    };
  }
  redirect("/admin/dashboard");
}

export { signinAction };
