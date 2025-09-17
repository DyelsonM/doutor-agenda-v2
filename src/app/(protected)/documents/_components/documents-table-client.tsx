"use client";

import { DataTable } from "@/components/ui/data-table";

import { type Document,getDocumentsTableColumns } from "./table-columns";

interface DocumentsTableClientProps {
  documents: Document[];
  userRole: "admin" | "doctor";
}

export function DocumentsTableClient({
  documents,
  userRole,
}: DocumentsTableClientProps) {
  return (
    <DataTable data={documents} columns={getDocumentsTableColumns(userRole)} />
  );
}
