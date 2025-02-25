import { Register } from "@/components/pages/register";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }
  
  return <Register />;
}