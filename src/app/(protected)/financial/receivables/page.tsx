import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-utils";

import ReceivablesPageClient from "./_components/receivables-page-client";

export default async function ReceivablesPage() {
  const session = await getAuthSession();

  // Apenas administradores podem acessar contas a receber
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <ReceivablesPageClient />;
}
