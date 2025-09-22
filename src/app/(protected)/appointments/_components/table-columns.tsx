"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsTable } from "@/db/schema";

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
): ColumnDef<AppointmentWithRelations>[] => {
  const baseColumns: ColumnDef<AppointmentWithRelations>[] = [
    {
      id: "patient",
      accessorKey: "patient.name",
      header: "Paciente",
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
        const appointmentDate = new Date(appointment.date);
        return format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", {
          locale: ptBR,
        });
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
        return appointment.modality
          ? getModalityLabel(appointment.modality)
          : "-";
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
        />
      );
    },
  });

  return baseColumns;
};
