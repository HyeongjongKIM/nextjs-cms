import { checkUserExists } from "@/features/user/check-user-exists";
import { signinAction } from "./actions";

import { LoginForm } from "@/features/auth/login-form";
import { redirect } from "next/navigation";

export default async function Signin() {
  const userExists = await checkUserExists();
  if (!userExists) redirect("/admin/signup");
  return <LoginForm signinAction={signinAction} />;
}
