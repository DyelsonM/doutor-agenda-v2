"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

export const getPatientsTableColumns = (
  userRole: "admin" | "doctor",
): ColumnDef<Patient>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const patient = params.row.original;
      const phoneNumber = patient.phoneNumber;
      if (!phoneNumber) return "";
      const formatted = phoneNumber.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      );
      return formatted;
    },
  },
  {
    id: "responsiblePhoneNumber",
    accessorKey: "responsiblePhoneNumber",
    header: "Tel. Responsável",
    cell: (params) => {
      const patient = params.row.original;
      const phoneNumber = patient.responsiblePhoneNumber;
      if (!phoneNumber) return "-";
      const formatted = phoneNumber.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      );
      return formatted;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "patientType",
    accessorKey: "patientType",
    header: "Tipo",
    cell: (params) => {
      const patient = params.row.original;
      const typeLabels = {
        particular: "Particular",
        cliente_oro: "Cliente Oro",
        convenio: patient.insuranceName || "Convênio",
      };
      return typeLabels[patient.patientType] || "Particular";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} userRole={userRole} />;
    },
  },
];
