"use client";

import { Check, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { partnerExamsTable, partnersTable } from "@/db/schema";

type Partner = typeof partnersTable.$inferSelect & {
  exams: (typeof partnerExamsTable.$inferSelect)[];
};

type SelectedExam = {
  examId: string;
  partnerId: string;
  examName: string;
  partnerName: string;
  price: number;
  clientType: "popular" | "particular";
};

interface ExamQuotesClientProps {
  partners: Partner[];
}

const ExamQuotesClient = ({ partners }: ExamQuotesClientProps) => {
  const [selectedExams, setSelectedExams] = useState<SelectedExam[]>([]);
  const [clientType, setClientType] = useState<"popular" | "particular">(
    "particular",
  );
  const [patientName, setPatientName] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [expandedPartners, setExpandedPartners] = useState<Set<string>>(
    new Set(partners.map((partner) => partner.id)),
  );

  const formatPrice = (priceInCents: number | null) => {
    if (!priceInCents) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  const handleExamToggle = (
    exam: typeof partnerExamsTable.$inferSelect,
    partner: Partner,
  ) => {
    const examId = exam.id;
    const isSelected = selectedExams.some(
      (selected) => selected.examId === examId,
    );

    if (isSelected) {
      setSelectedExams((prev) =>
        prev.filter((selected) => selected.examId !== examId),
      );
    } else {
      const price =
        clientType === "popular"
          ? exam.popularPriceInCents || 0
          : exam.particularPriceInCents || 0;

      const newExam: SelectedExam = {
        examId,
        partnerId: partner.id,
        examName: exam.name,
        partnerName: partner.companyName,
        price,
        clientType,
      };

      setSelectedExams((prev) => [...prev, newExam]);
    }
  };

  const calculateTotal = () => {
    return selectedExams.reduce((total, exam) => total + exam.price, 0);
  };

  const generateQuote = () => {
    if (selectedExams.length === 0) {
      alert("Selecione pelo menos um exame para gerar o orçamento.");
      return;
    }
    setShowQuote(true);
  };

  const resetQuote = () => {
    setSelectedExams([]);
    setPatientName("");
    setShowQuote(false);
  };

  const togglePartnerExpansion = (partnerId: string) => {
    setExpandedPartners((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partnerId)) {
        newSet.delete(partnerId);
      } else {
        newSet.add(partnerId);
      }
      return newSet;
    });
  };

  if (showQuote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={resetQuote}
            variant="outline"
            className="print:hidden"
          >
            Nova Cotação
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orçamento de Exames</CardTitle>
            <CardDescription>
              {patientName && `Paciente: ${patientName}`}
              <br />
              Tipo: {clientType === "popular" ? "CL Popular" : "Particular"}
              <br />
              Data: {new Date().toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Exames Selecionados:</h3>
                {selectedExams.map((exam) => (
                  <div
                    key={exam.examId}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium">{exam.examName}</p>
                      <p className="text-sm text-gray-600">
                        {exam.partnerName}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(exam.price)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 print:hidden">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <Select
                value={clientType}
                onValueChange={(value: "popular" | "particular") => {
                  setClientType(value);
                  setSelectedExams([]); // Limpar seleções ao mudar tipo
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="popular">CL Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente (opcional)</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Nome do paciente"
                className="w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Exames */}
      <div className="space-y-4">
        {partners.map((partner) => {
          const isExpanded = expandedPartners.has(partner.id);

          return (
            <Card key={partner.id}>
              <CardHeader
                className="cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => togglePartnerExpansion(partner.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {partner.companyName}
                    </CardTitle>
                    <CardDescription>
                      {partner.tradeName &&
                        `Nome Fantasia: ${partner.tradeName}`}
                      <br />
                      Telefone: {partner.responsiblePhone}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {partner.exams.length} exame(s)
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {partner.exams
                        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                        .map((exam) => {
                          const isSelected = selectedExams.some(
                            (selected) => selected.examId === exam.id,
                          );
                          const price =
                            clientType === "popular"
                              ? exam.popularPriceInCents
                              : exam.particularPriceInCents;

                          return (
                            <div
                              key={exam.id}
                              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                            >
                              <Checkbox
                                id={exam.id}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleExamToggle(exam, partner)
                                }
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Label
                                      htmlFor={exam.id}
                                      className="cursor-pointer font-medium"
                                    >
                                      {exam.name}
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                      {exam.code}
                                    </p>
                                    {exam.description && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {exam.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">
                                      {formatPrice(price)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Resumo e Botão de Gerar */}
      {selectedExams.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedExams.length} exame(s) selecionado(s)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  Total: {formatPrice(calculateTotal())}
                </p>
              </div>
              <Button
                onClick={generateQuote}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Gerar Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamQuotesClient;
