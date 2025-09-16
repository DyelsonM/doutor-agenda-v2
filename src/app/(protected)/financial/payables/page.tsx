import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-utils";

import PayablesPageClient from "./_components/payables-page-client";

export default async function PayablesPage() {
  const session = await getAuthSession();

  // Apenas administradores podem acessar contas a pagar
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <PayablesPageClient />;
}
