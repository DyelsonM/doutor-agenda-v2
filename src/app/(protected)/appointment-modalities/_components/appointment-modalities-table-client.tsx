"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentModalitiesTable } from "@/db/schema";
import { Edit, Trash2 } from "lucide-react";

import UpsertAppointmentModalityForm from "./upsert-appointment-modality-form";
import { deleteAppointmentModality } from "@/actions/delete-appointment-modality";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

type AppointmentModality = typeof appointmentModalitiesTable.$inferSelect;

interface AppointmentModalitiesTableClientProps {
  modalities: AppointmentModality[];
}

export default function AppointmentModalitiesTableClient({
  modalities,
}: AppointmentModalitiesTableClientProps) {
  const [editingModality, setEditingModality] = useState<
    AppointmentModality | undefined
  >();
  const [open, setOpen] = useState(false);

  const deleteModalityAction = useAction(deleteAppointmentModality, {
    onSuccess: () => {
      toast.success("Modalidade excluída com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir modalidade.");
    },
  });

  const handleEdit = (modality: AppointmentModality) => {
    setEditingModality(modality);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta modalidade?")) {
      deleteModalityAction.execute({ id });
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingModality(undefined);
  };

  // Agrupar modalidades por categoria
  const modalitiesByCategory = modalities.reduce(
    (acc, modality) => {
      if (!acc[modality.category]) {
        acc[modality.category] = [];
      }
      acc[modality.category].push(modality);
      return acc;
    },
    {} as Record<string, AppointmentModality[]>,
  );

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(modalitiesByCategory).map(
              ([category, categoryModalities]) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={5} className="font-medium">
                      {category}
                    </TableCell>
                  </TableRow>
                  {categoryModalities.map((modality) => (
                    <TableRow key={modality.id}>
                      <TableCell className="font-mono text-sm">
                        {modality.code}
                      </TableCell>
                      <TableCell>{modality.name}</TableCell>
                      <TableCell>{modality.category}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {modality.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(modality)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(modality.id)}
                            disabled={deleteModalityAction.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <UpsertAppointmentModalityForm
            modality={editingModality}
            isOpen={open}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
