import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import LoginForm from "./LoginForm";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const user = await getUserFromCookies();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/");
  }

  const redirectTo = searchParams.redirect || "/";
  return <LoginForm redirectTo={redirectTo} />;
}
