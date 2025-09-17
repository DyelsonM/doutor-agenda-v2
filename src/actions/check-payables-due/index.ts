"use server";

import { headers } from "next/headers";

import { checkUpcomingPayables } from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const checkPayablesDue = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const count = await checkUpcomingPayables({
    clinicId: session.user.clinic.id,
    userId: session.user.id,
  });

  return {
    success: true,
    notificationsCreated: count,
    message: `${count} notificações criadas para contas próximas ao vencimento`,
  };
});
