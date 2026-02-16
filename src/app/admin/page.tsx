import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminPage() {
  const user = await getUserFromCookies();
  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  return <AdminLoginForm />;
}
