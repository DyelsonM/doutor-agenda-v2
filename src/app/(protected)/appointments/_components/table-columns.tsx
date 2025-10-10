"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

dayjs.extend(utc);
dayjs.extend(timezone);

import { getSpecialtyLabel } from "../../doctors/_constants";
import { getModalityLabel } from "../_constants/modalities";
import AppointmentsTableActions from "./table-actions";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

// Função para uso em Client Components
export const getAppointmentsTableColumns = (
  userRole: "admin" | "doctor",
  patients: (typeof patientsTable.$inferSelect)[],
  doctors: (typeof doctorsTable.$inferSelect)[],
): ColumnDef<AppointmentWithRelations>[] => {
  const baseColumns: ColumnDef<AppointmentWithRelations>[] = [
    {
      id: "patient",
      accessorKey: "patient.name",
      header: "Paciente",
    },
    {
      id: "patientPhone",
      accessorKey: "patient.phoneNumber",
      header: "Telefone",
      cell: (params) => {
        const appointment = params.row.original;
        const phoneNumber = appointment.patient.phoneNumber;
        if (!phoneNumber) return "-";
        // Formatar telefone: (XX) XXXXX-XXXX
        const cleaned = phoneNumber.replace(/\D/g, "");
        if (cleaned.length === 11) {
          return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phoneNumber;
      },
    },
    {
      id: "doctor",
      accessorKey: "doctor.name",
      header: "Médico",
      cell: (params) => {
        const appointment = params.row.original;
        return `${appointment.doctor.name}`;
      },
    },
    {
      id: "date",
      accessorKey: "date",
      header: "Data e Hora",
      cell: (params) => {
        const appointment = params.row.original;
        try {
          // A data já está em UTC no banco, converter para horário local do Brasil
          const appointmentDate = dayjs(appointment.date)
            .utc()
            .tz("America/Sao_Paulo")
            .toDate();
          return format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          });
        } catch (error) {
          console.error(
            "Erro ao formatar data do agendamento:",
            error,
            appointment,
          );
          return "Data inválida";
        }
      },
    },
    {
      id: "specialty",
      accessorKey: "doctor.specialty",
      header: "Especialidade",
      cell: (params) => {
        const appointment = params.row.original;
        return getSpecialtyLabel(appointment.doctor.specialty);
      },
    },
    {
      id: "modality",
      accessorKey: "modality",
      header: "Modalidade",
      cell: (params) => {
        const appointment = params.row.original;
        return appointment.modality || "-";
      },
    },
    {
      id: "isReturn",
      accessorKey: "isReturn",
      header: "Tipo",
      cell: (params) => {
        const appointment = params.row.original;
        // Garantir que o valor seja boolean, considerando null/undefined como false
        const isReturn = Boolean(appointment.isReturn);
        return isReturn ? (
          <span className="font-medium text-blue-600">Retorno</span>
        ) : (
          ""
        );
      },
    },
  ];

  // Adicionar coluna de preço apenas para administradores
  if (userRole === "admin") {
    baseColumns.push({
      id: "price",
      accessorKey: "appointmentPriceInCents",
      header: "Valor",
      cell: (params) => {
        const appointment = params.row.original;
        const price = appointment.appointmentPriceInCents / 100;
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price);
      },
    });
  }

  // Adicionar coluna de ações
  baseColumns.push({
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <AppointmentsTableActions
          appointment={appointment}
          userRole={userRole}
          patients={patients}
          doctors={doctors}
        />
      );
    },
  });

  return baseColumns;
};
