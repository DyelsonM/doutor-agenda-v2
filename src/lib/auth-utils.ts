import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "./auth";

export type UserRole = "admin" | "doctor";

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    plan?: string | null;
    clinic?: {
      id: string;
      name: string;
    };
  };
}

/**
 * Obter sessão autenticada ou redirecionar para login
 */
export async function getAuthSession(): Promise<AuthSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  return session as AuthSession;
}

/**
 * Verificar se o usuário tem permissão de admin
 */
export function requireAdmin(session: AuthSession): void {
  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }
}

/**
 * Verificar se o usuário pode acessar dados de um médico específico
 */
export function canAccessDoctor(
  session: AuthSession,
  doctorId: string,
): boolean {
  // Admin pode acessar qualquer médico
  if (session.user.role === "admin") {
    return true;
  }

  // Médico só pode acessar seus próprios dados
  // TODO: Implementar lógica para vincular userId ao doctorId
  return false;
}

/**
 * Verificar se o usuário pode acessar dados de um paciente específico
 */
export function canAccessPatient(
  session: AuthSession,
  patientId: string,
): boolean {
  // Admin pode acessar qualquer paciente
  if (session.user.role === "admin") {
    return true;
  }

  // Médico só pode acessar pacientes vinculados a ele
  // TODO: Implementar lógica para verificar se o paciente tem agendamentos com o médico
  return false;
}

/**
 * Verificar se o usuário pode acessar um agendamento específico
 */
export function canAccessAppointment(
  session: AuthSession,
  appointmentDoctorId: string,
): boolean {
  // Admin pode acessar qualquer agendamento
  if (session.user.role === "admin") {
    return true;
  }

  // Médico só pode acessar seus próprios agendamentos
  return canAccessDoctor(session, appointmentDoctorId);
}

/**
 * Verificar se o usuário pode acessar um documento específico
 */
export function canAccessDocument(
  session: AuthSession,
  documentDoctorId: string,
): boolean {
  // Admin pode acessar qualquer documento
  if (session.user.role === "admin") {
    return true;
  }

  // Médico só pode acessar documentos criados por ele
  return canAccessDoctor(session, documentDoctorId);
}

/**
 * Obter ID do médico associado ao usuário (se for médico)
 */
export async function getDoctorIdFromUser(
  userId: string,
): Promise<string | null> {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/db");
  const { doctorsTable } = await import("@/db/schema");

  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, userId),
  });

  return doctor?.id || null;
}

/**
 * Filtrar dados baseado no perfil do usuário
 */
export function getDataFilters(session: AuthSession) {
  if (session.user.role === "admin") {
    // Admin vê todos os dados da clínica
    return {
      clinicId: session.user.clinic!.id,
      doctorId: null, // Não filtrar por médico
    };
  }

  // Médico vê apenas seus dados
  return {
    clinicId: session.user.clinic!.id,
    doctorId: null, // TODO: Obter doctorId do usuário
  };
}
