"use server";

import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";

import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { exportDocumentSchema } from "./schema";

const action = createSafeActionClient();

export const exportDocumentAction = action
  .schema(exportDocumentSchema)
  .action(async ({ parsedInput: { documentId, format } }) => {
    const session = await getAuthSession();

    // Buscar o documento
    const document = await db.query.documentsTable.findFirst({
      where: eq(documentsTable.id, documentId),
      with: {
        patient: true,
        doctor: true,
        clinic: true,
        appointment: true,
      },
    });

    if (!document) {
      throw new Error("Documento não encontrado");
    }

    // Verificar permissões
    if (session.user.role === "admin") {
      // Admin pode exportar qualquer documento da clínica
      if (
        !session.user.clinic ||
        document.clinicId !== session.user.clinic.id
      ) {
        throw new Error("Acesso negado");
      }
    } else {
      // Médico só pode exportar seus próprios documentos
      const doctorId = await getDoctorIdFromUser(session.user.id);
      if (!doctorId || document.doctorId !== doctorId) {
        throw new Error("Acesso negado");
      }
    }

    // Preparar dados para exportação
    const exportData = {
      document: {
        id: document.id,
        type: document.type,
        title: document.title,
        content: document.content,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      patient: {
        name: document.patient.name,
        email: document.patient.email,
        phoneNumber: document.patient.phoneNumber,
        sex: document.patient.sex,
      },
      doctor: {
        name: document.doctor.name,
        specialty: document.doctor.specialty,
      },
      clinic: {
        name: document.clinic.name,
        logoUrl: document.clinic.logoUrl,
      },
      appointment: document.appointment
        ? {
            date: document.appointment.date,
          }
        : null,
    };

    // Retornar os dados para o cliente fazer o download
    return {
      success: true,
      data: exportData,
      format,
      filename: `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`,
    };
  });
