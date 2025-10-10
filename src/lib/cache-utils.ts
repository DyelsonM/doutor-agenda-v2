import { revalidateTag } from "next/cache";

/**
 * Invalidar cache de dados do usuário
 * Deve ser chamado quando role do usuário mudar ou dados da clínica mudarem
 */
export function invalidateUserCache() {
  revalidateTag("user-data");
  revalidateTag("user-clinics");
}

/**
 * Invalidar cache do dashboard
 */
export function invalidateDashboardCache() {
  revalidateTag("dashboard-data");
}
