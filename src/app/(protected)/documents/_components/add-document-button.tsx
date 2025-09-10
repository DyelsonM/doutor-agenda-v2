"use client";

import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UpsertDocumentForm } from "./upsert-document-form";

type Patient = {
  id: string;
  name: string;
};

type Doctor = {
  id: string;
  name: string;
};

interface AddDocumentButtonProps {
  patients: Patient[];
  doctors: Doctor[];
}

export function AddDocumentButton({
  patients,
  doctors,
}: AddDocumentButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Documento Personalizado
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/documents/templates")}>
          <FileText className="mr-2 h-4 w-4" />
          Usar Template
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Documento</DialogTitle>
          </DialogHeader>
          <UpsertDocumentForm
            patients={patients}
            doctors={doctors}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
