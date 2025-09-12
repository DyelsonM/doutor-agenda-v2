"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteDocumentAction } from "@/actions/delete-document";
import { ExportDocumentButton } from "./export-document-button";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Document = {
  id: string;
  type:
    | "anamnesis"
    | "prescription"
    | "medical_certificate"
    | "exam_request"
    | "medical_report"
    | "referral_form"
    | "other";
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  patient: { id: string; name: string };
  doctor: { id: string; name: string };
  appointment: { id: string; date: Date } | null;
};

const documentTypeLabels: Record<Document["type"], string> = {
  anamnesis: "Anamnese",
  prescription: "Receita",
  medical_certificate: "Atestado",
  exam_request: "Solicitação de Exame",
  medical_report: "Relatório Médico",
  referral_form: "Encaminhamento",
  other: "Outro",
};

const documentTypeColors: Record<Document["type"], string> = {
  anamnesis: "bg-blue-100 text-blue-800",
  prescription: "bg-green-100 text-green-800",
  medical_certificate: "bg-yellow-100 text-yellow-800",
  exam_request: "bg-purple-100 text-purple-800",
  medical_report: "bg-red-100 text-red-800",
  referral_form: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export const documentsTableColumns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="max-w-[200px] truncate font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as Document["type"];
      return (
        <Badge className={documentTypeColors[type]}>
          {documentTypeLabels[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "Paciente",
    cell: ({ row }) => {
      const patient = row.getValue("patient") as Document["patient"];
      return <div className="font-medium">{patient.name}</div>;
    },
  },
  {
    accessorKey: "doctor",
    header: "Médico",
    cell: ({ row }) => {
      const doctor = row.getValue("doctor") as Document["doctor"];
      return <div className="font-medium">{doctor.name}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const document = row.original;
      const router = useRouter(); // eslint-disable-line react-hooks/rules-of-hooks

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { execute: deleteDocument, isExecuting } = useAction(
        deleteDocumentAction,
        {
          onSuccess: ({ data }) => {
            toast.success(data?.message ?? "Documento excluído com sucesso!");
            router.refresh();
          },
          onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao excluir documento");
          },
        },
      );

      return (
        <div className="flex items-center gap-2">
          {/* Botão de exportação */}
          <ExportDocumentButton
            documentId={document.id}
            documentTitle={document.title}
          />

          {/* Menu de ações */}
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/documents/${document.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(`/documents/${document.id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>

                {/* Trigger fica dentro do menu, mas previne o "select" que fecharia o menu antes */}
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                    disabled={isExecuting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* O conteúdo do diálogo fica fora do menu, assim ele permanece aberto */}
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. O documento será removido do
                  sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isExecuting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteDocument({ id: document.id })}
                  disabled={isExecuting}
                >
                  {isExecuting ? "Excluindo..." : "Confirmar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
