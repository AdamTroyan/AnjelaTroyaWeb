import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getUserFromCookies();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/");
  }

  return <LoginForm />;
}
