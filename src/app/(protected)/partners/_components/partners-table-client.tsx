"use client";

import {
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  User,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deletePartner } from "@/actions/delete-partner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { partnersTable, partnerExamsTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";

import UpsertPartnerForm from "./upsert-partner-form";
import PartnerExamsTable from "./partner-exams-table";
import AddPartnerExamButton from "./add-partner-exam-button";
import ExportPartnerPdfButton from "./export-partner-pdf-button";

type Partner = typeof partnersTable.$inferSelect & {
  exams: (typeof partnerExamsTable.$inferSelect)[];
};

interface PartnersTableClientProps {
  partners: Partner[];
}

const PartnersTableClient = ({ partners }: PartnersTableClientProps) => {
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deletePartnerAction = useAction(deletePartner, {
    onSuccess: () => {
      toast.success("Parceiro deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar parceiro.");
    },
  });

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingPartner(undefined);
  };

  const handleDelete = (id: string) => {
    deletePartnerAction.execute({ id });
  };

  const formatPaymentFrequency = (frequency: string) => {
    const frequencies = {
      weekly: "Semanal",
      biweekly: "Quinzenal",
      monthly: "Mensal",
      quarterly: "45 dias",
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
  };

  const formatPixType = (type: string) => {
    const types = {
      cpf: "CPF",
      cnpj: "CNPJ",
      email: "E-mail",
      phone: "Telefone",
      random_key: "Chave Aleatória",
    };
    return types[type as keyof typeof types] || type;
  };

  const renderCardsView = () => (
    <div className="grid grid-cols-1 gap-6">
      {partners.map((partner) => (
        <Card key={partner.id} className="w-full">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {partner.companyName}
              </CardTitle>
              <div className="flex gap-2">
                <ExportPartnerPdfButton partner={partner} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(partner)}
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
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar o parceiro{" "}
                        <strong>{partner.companyName}</strong>?
                        <br />
                        <br />
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(partner.id)}
                        disabled={deletePartnerAction.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletePartnerAction.isPending
                          ? "Deletando..."
                          : "Deletar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row">
              {/* Informações do Parceiro */}
              <div className="space-y-3 lg:w-1/3">
                {/* Dados da Empresa */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Dados da Empresa
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-medium">{partner.companyName}</p>
                        {partner.tradeName && (
                          <p className="text-muted-foreground text-sm">
                            Nome Fantasia: {partner.tradeName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-medium">CNPJ: {partner.cnpj}</p>
                        <p className="text-muted-foreground text-sm">
                          {partner.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dados do Responsável */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Responsável
                  </h4>
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">{partner.responsibleName}</p>
                      <p className="text-muted-foreground text-sm">
                        <Phone className="mr-1 inline h-3 w-3" />
                        {partner.responsiblePhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Telefones de Recepção */}
                {(partner.receptionPhone1 ||
                  partner.receptionPhone2 ||
                  partner.receptionPhone3) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Recepção - Agendamento
                      </h4>
                      <div className="space-y-2">
                        {partner.receptionPhone1 && (
                          <div className="flex items-center gap-3">
                            <Phone className="text-muted-foreground h-4 w-4" />
                            <p className="text-sm">{partner.receptionPhone1}</p>
                          </div>
                        )}
                        {partner.receptionPhone2 && (
                          <div className="flex items-center gap-3">
                            <Phone className="text-muted-foreground h-4 w-4" />
                            <p className="text-sm">{partner.receptionPhone2}</p>
                          </div>
                        )}
                        {partner.receptionPhone3 && (
                          <div className="flex items-center gap-3">
                            <Phone className="text-muted-foreground h-4 w-4" />
                            <p className="text-sm">{partner.receptionPhone3}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Configurações de Pagamento */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Configurações de Pagamento
                  </h4>
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">
                        Frequência:{" "}
                        {formatPaymentFrequency(partner.paymentFrequency)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        PIX ({formatPixType(partner.pixType)}): {partner.pixKey}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exames */}
              <div className="space-y-2 lg:w-2/3">
                <div className="flex items-center justify-between">
                  <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Exames ({partner.exams.length})
                  </h4>
                  <AddPartnerExamButton partnerId={partner.id} />
                </div>
                <PartnerExamsTable
                  partnerId={partner.id}
                  exams={partner.exams}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (partners.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Nenhum parceiro cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Renderizar apenas cards */}
      {renderCardsView()}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <UpsertPartnerForm
            partner={editingPartner}
            isOpen={isEditDialogOpen}
            onSuccess={handleCloseEditDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnersTableClient;
