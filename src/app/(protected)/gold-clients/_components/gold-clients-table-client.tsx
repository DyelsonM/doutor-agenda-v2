"use client";

import { Edit, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteGoldClient } from "@/actions/delete-gold-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";

import UpsertGoldClientForm from "./upsert-gold-client-form";

type GoldClientWithDependents = typeof goldClientsTable.$inferSelect & {
  dependents: (typeof goldClientDependentsTable.$inferSelect)[];
};

interface GoldClientsTableClientProps {
  goldClients: GoldClientWithDependents[];
}

const GoldClientsTableClient = ({
  goldClients,
}: GoldClientsTableClientProps) => {
  const [editingGoldClient, setEditingGoldClient] = useState<
    GoldClientWithDependents | undefined
  >();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Garantir que o componente só renderize no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const deleteGoldClientAction = useAction(deleteGoldClient, {
    onSuccess: () => {
      toast.success("Cliente ouro deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar cliente ouro.");
    },
  });

  const handleEdit = (goldClient: GoldClientWithDependents) => {
    setEditingGoldClient(goldClient);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingGoldClient(undefined);
  };

  const handleDelete = (id: string) => {
    deleteGoldClientAction.execute({ id });
  };

  // Filtrar clientes ouro baseado na pesquisa
  const filteredGoldClients = goldClients.filter((goldClient) => {
    if (!searchValue) return true;

    const searchLower = searchValue.toLowerCase();
    const matchesName = goldClient.holderName
      .toLowerCase()
      .includes(searchLower);
    const matchesCpf = goldClient.holderCpf.toLowerCase().includes(searchLower);
    const matchesPhone = goldClient.holderPhone
      .toLowerCase()
      .includes(searchLower);
    const matchesDependents = goldClient.dependents.some((dependent) =>
      dependent.name.toLowerCase().includes(searchLower),
    );

    return matchesName || matchesCpf || matchesPhone || matchesDependents;
  });

  if (goldClients.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Nenhum cliente ouro cadastrado ainda.
        </p>
      </div>
    );
  }

  // Não renderizar até que esteja no cliente
  if (!isClient) {
    return (
      <div className="space-y-4">
        {/* Campo de pesquisa - loading state */}
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Pesquisar clientes ouro por nome, CPF, telefone ou dependentes..."
            value=""
            disabled
            className="pl-10"
          />
        </div>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Campo de pesquisa */}
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Pesquisar clientes ouro por nome, CPF, telefone ou dependentes..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabela */}
        {filteredGoldClients.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchValue
                ? "Nenhum cliente ouro encontrado com os critérios de pesquisa."
                : "Nenhum cliente ouro cadastrado ainda."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titular</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>CEP</TableHead>
                  <TableHead>Dependentes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGoldClients.map((goldClient) => (
                  <TableRow key={goldClient.id}>
                    <TableCell className="font-medium">
                      {goldClient.holderName}
                    </TableCell>
                    <TableCell>{goldClient.holderCpf}</TableCell>
                    <TableCell>{goldClient.holderPhone}</TableCell>
                    <TableCell>
                      {goldClient.holderBirthDate
                        ? new Date(
                            goldClient.holderBirthDate,
                          ).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>{goldClient.holderAddress}</TableCell>
                    <TableCell>{goldClient.holderZipCode}</TableCell>
                    <TableCell>
                      {goldClient.dependents.length > 0 ? (
                        <div className="space-y-1">
                          {goldClient.dependents.map((dependent, index) => (
                            <div key={dependent.id} className="text-sm">
                              {index + 1}. {dependent.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(goldClient)}
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
                                Tem certeza que deseja deletar o cliente ouro{" "}
                                <strong>{goldClient.holderName}</strong>?
                                <br />
                                <br />
                                Esta ação não pode ser desfeita e todos os
                                dependentes também serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(goldClient.id)}
                                disabled={deleteGoldClientAction.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteGoldClientAction.isPending
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
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <UpsertGoldClientForm
            goldClient={editingGoldClient}
            isOpen={isEditDialogOpen}
            onSuccess={handleCloseEditDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoldClientsTableClient;
