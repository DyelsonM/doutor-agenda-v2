"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteMedicalSpecialty } from "@/actions/delete-medical-specialty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { medicalSpecialtiesTable } from "@/db/schema";

import UpsertMedicalSpecialtyForm from "./upsert-medical-specialty-form";

type MedicalSpecialty = typeof medicalSpecialtiesTable.$inferSelect;

interface MedicalSpecialtiesTableClientProps {
  specialties: MedicalSpecialty[];
}

const MedicalSpecialtiesTableClient = ({
  specialties,
}: MedicalSpecialtiesTableClientProps) => {
  const [editingSpecialty, setEditingSpecialty] = useState<
    MedicalSpecialty | undefined
  >(undefined);
  const [deletingSpecialty, setDeletingSpecialty] = useState<
    MedicalSpecialty | undefined
  >(undefined);

  const deleteMedicalSpecialtyAction = useAction(deleteMedicalSpecialty, {
    onSuccess: () => {
      toast.success("Especialidade deletada com sucesso.");
      setDeletingSpecialty(undefined);
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao deletar especialidade.");
    },
  });

  const handleEdit = (specialty: MedicalSpecialty) => {
    setEditingSpecialty(specialty);
  };

  const handleDelete = (specialty: MedicalSpecialty) => {
    setDeletingSpecialty(specialty);
  };

  const confirmDelete = () => {
    if (deletingSpecialty) {
      deleteMedicalSpecialtyAction.execute({ id: deletingSpecialty.id });
    }
  };

  const categoryColors = {
    Medicina: "bg-blue-100 text-blue-800",
    Terapeutas: "bg-green-100 text-green-800",
    Odontologia: "bg-purple-100 text-purple-800",
    Estética: "bg-pink-100 text-pink-800",
    Diagnóstico: "bg-orange-100 text-orange-800",
    Outros: "bg-gray-100 text-gray-800",
  };

  if (specialties.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma especialidade cadastrada ainda.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specialties.map((specialty) => (
              <TableRow key={specialty.id}>
                <TableCell>
                  <div className="font-medium">{specialty.name}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      categoryColors[
                        specialty.category as keyof typeof categoryColors
                      ] || categoryColors.Outros
                    }
                  >
                    {specialty.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(specialty)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(specialty)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UpsertMedicalSpecialtyForm
        specialty={editingSpecialty}
        onSuccess={() => setEditingSpecialty(undefined)}
        isOpen={!!editingSpecialty}
      />

      <AlertDialog
        open={!!deletingSpecialty}
        onOpenChange={() => setDeletingSpecialty(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Especialidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a especialidade{" "}
              <strong>{deletingSpecialty?.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMedicalSpecialtyAction.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMedicalSpecialtyAction.isPending
                ? "Deletando..."
                : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MedicalSpecialtiesTableClient;
