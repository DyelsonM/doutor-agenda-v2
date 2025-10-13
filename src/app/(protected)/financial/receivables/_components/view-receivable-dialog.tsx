"use client";

import { formatCurrency } from "@/helpers/currency";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

interface ReceivableWithDoctor {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  status: "pending" | "received";
  dueDate: Date;
  receivedDate?: Date | null;
  doctorId?: string | null;
  patientName?: string | null;
  patientDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor?: {
    id: string;
    name: string;
    specialty?: string | null;
  } | null;
}

interface ViewReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableWithDoctor | null;
}

const categoryLabels = {
  consultation: "Consulta",
  procedure: "Procedimento",
  examination: "Exame",
  treatment: "Tratamento",
  medication: "Medicação",
  equipment_rental: "Aluguel de Equipamento",
  professional_service: "Serviço Profissional",
  insurance_reimbursement: "Reembolso de Seguro",
  other: "Outros",
};

const statusLabels = {
  pending: "Pendente",
  received: "Recebido",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  received: "bg-green-100 text-green-800 border-green-200",
};

export function ViewReceivableDialog({
  open,
  onOpenChange,
  receivable,
}: ViewReceivableDialogProps) {
  if (!receivable) return null;

  const isOverdue =
    dayjs(receivable.dueDate).isBefore(dayjs()) &&
    receivable.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receivable.description}</DialogTitle>
          <DialogDescription>
            Visualize os detalhes da conta a receber
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Principais</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Descrição
                </label>
                <p className="text-lg font-semibold">
                  {receivable.description}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Valor
                </label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(receivable.amountInCents / 100)}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Categoria
                </label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {categoryLabels[
                      receivable.category as keyof typeof categoryLabels
                    ] || receivable.category}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Status
                </label>
                <div className="mt-1">
                  <Badge className={statusColors[receivable.status]}>
                    {statusLabels[receivable.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datas</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Data de Vencimento
                </label>
                <p
                  className={`text-lg font-semibold ${isOverdue ? "text-red-600" : ""}`}
                >
                  {dayjs(receivable.dueDate).format("DD/MM/YYYY")}
                </p>
                {isOverdue && (
                  <p className="text-sm font-medium text-red-600">
                    Esta conta está vencida
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Data de Recebimento
                </label>
                <p className="text-lg font-semibold">
                  {receivable.receivedDate
                    ? dayjs(receivable.receivedDate).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Criado em
                </label>
                <p className="text-lg font-semibold">
                  {dayjs(receivable.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Última atualização
                </label>
                <p className="text-lg font-semibold">
                  {dayjs(receivable.updatedAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Profissional */}
          {receivable.doctor && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profissional</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Nome
                  </label>
                  <p className="text-lg font-semibold">
                    {receivable.doctor.name}
                  </p>
                </div>
                {receivable.doctor.specialty && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Especialidade
                    </label>
                    <p className="text-lg font-semibold">
                      {receivable.doctor.specialty}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações do Cliente */}
          {(receivable.patientName || receivable.patientDocument) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Cliente</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {receivable.patientName && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Nome do Cliente
                    </label>
                    <p className="text-lg font-semibold">
                      {receivable.patientName}
                    </p>
                  </div>
                )}
                {receivable.patientDocument && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      CPF/CNPJ
                    </label>
                    <p className="text-lg font-semibold">
                      {receivable.patientDocument}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          {(receivable.invoiceNumber || receivable.notes) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Adicionais</h3>
              <div className="space-y-4">
                {receivable.invoiceNumber && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Número da Nota Fiscal
                    </label>
                    <p className="text-lg font-semibold">
                      {receivable.invoiceNumber}
                    </p>
                  </div>
                )}
                {receivable.notes && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Observações
                    </label>
                    <p className="text-lg font-semibold whitespace-pre-wrap">
                      {receivable.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
