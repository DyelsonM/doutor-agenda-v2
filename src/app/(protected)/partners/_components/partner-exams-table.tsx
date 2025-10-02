"use client";

import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deletePartnerExam } from "@/actions/delete-partner-exam";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { partnerExamsTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";

import UpsertPartnerExamForm from "./upsert-partner-exam-form";

type PartnerExam = typeof partnerExamsTable.$inferSelect;

interface PartnerExamsTableProps {
  partnerId: string;
  exams: PartnerExam[];
}

const PartnerExamsTable = ({ partnerId, exams }: PartnerExamsTableProps) => {
  const [editingExam, setEditingExam] = useState<PartnerExam | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deletePartnerExamAction = useAction(deletePartnerExam, {
    onSuccess: () => {
      toast.success("Exame deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar exame.");
    },
  });

  const handleEdit = (exam: PartnerExam) => {
    setEditingExam(exam);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingExam(undefined);
  };

  const handleDelete = (id: string) => {
    deletePartnerExamAction.execute({ id });
  };

  const formatPrice = (priceInCents: number | null) => {
    if (!priceInCents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  if (exams.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum exame cadastrado para este parceiro.
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
              <TableHead>Código/Sigla</TableHead>
              <TableHead>Nome do Exame</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>CL Popular</TableHead>
              <TableHead>Particular</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.code}</TableCell>
                <TableCell>{exam.name}</TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={exam.description || ""}
                >
                  {exam.description || "-"}
                </TableCell>
                <TableCell>{formatPrice(exam.popularPriceInCents)}</TableCell>
                <TableCell>
                  {formatPrice(exam.particularPriceInCents)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(exam)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o exame{" "}
                            <strong>{exam.name}</strong>?
                            <br />
                            <br />
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(exam.id)}
                            disabled={deletePartnerExamAction.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletePartnerExamAction.isPending
                              ? "Deletando..."
                              : "Deletar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <UpsertPartnerExamForm
            partnerId={partnerId}
            exam={editingExam}
            isOpen={isEditDialogOpen}
            onSuccess={handleCloseEditDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnerExamsTable;
