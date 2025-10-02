"use client";

import { FileDown } from "lucide-react";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { partnerExamsTable } from "@/db/schema";

type Partner = {
  id: string;
  companyName: string;
  tradeName?: string | null;
  cnpj: string;
  address: string;
  responsibleName: string;
  responsiblePhone: string;
  receptionPhone1?: string | null;
  receptionPhone2?: string | null;
  receptionPhone3?: string | null;
  paymentFrequency: string;
  pixKey: string;
  pixType: string;
  exams: (typeof partnerExamsTable.$inferSelect)[];
};

interface ExportPartnerPdfButtonProps {
  partner: Partner;
}

const ExportPartnerPdfButton = ({ partner }: ExportPartnerPdfButtonProps) => {
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

  const formatPrice = (priceInCents: number | null) => {
    if (!priceInCents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  const handleExportPdf = () => {
    try {
      // Criar PDF diretamente com texto
      const pdf = new jsPDF("p", "mm", "a4");

      // Configurar fonte
      pdf.setFont("helvetica");
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);

      // Título
      pdf.text("Informações do Parceiro", 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30);

      let yPosition = 45;

      // Dados da Empresa
      pdf.setFontSize(12);
      pdf.text("DADOS DA EMPRESA", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Razão Social: ${partner.companyName}`, 20, yPosition);
      yPosition += 7;

      if (partner.tradeName) {
        pdf.text(`Nome Fantasia: ${partner.tradeName}`, 20, yPosition);
        yPosition += 7;
      }

      pdf.text(`CNPJ: ${partner.cnpj}`, 20, yPosition);
      yPosition += 7;

      pdf.text(`Endereço: ${partner.address}`, 20, yPosition);
      yPosition += 15;

      // Dados do Responsável
      pdf.setFontSize(12);
      pdf.text("RESPONSÁVEL", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Nome: ${partner.responsibleName}`, 20, yPosition);
      yPosition += 7;

      pdf.text(`Telefone: ${partner.responsiblePhone}`, 20, yPosition);
      yPosition += 15;

      // Telefones de Recepção
      if (
        partner.receptionPhone1 ||
        partner.receptionPhone2 ||
        partner.receptionPhone3
      ) {
        pdf.setFontSize(12);
        pdf.text("RECEPÇÃO - AGENDAMENTO", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        if (partner.receptionPhone1) {
          pdf.text(`Telefone 1: ${partner.receptionPhone1}`, 20, yPosition);
          yPosition += 7;
        }
        if (partner.receptionPhone2) {
          pdf.text(`Telefone 2: ${partner.receptionPhone2}`, 20, yPosition);
          yPosition += 7;
        }
        if (partner.receptionPhone3) {
          pdf.text(`Telefone 3: ${partner.receptionPhone3}`, 20, yPosition);
          yPosition += 7;
        }
        yPosition += 8;
      }

      // Configurações de Pagamento
      pdf.setFontSize(12);
      pdf.text("CONFIGURAÇÕES DE PAGAMENTO", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(
        `Frequência: ${formatPaymentFrequency(partner.paymentFrequency)}`,
        20,
        yPosition,
      );
      yPosition += 7;

      pdf.text(
        `PIX (${formatPixType(partner.pixType)}): ${partner.pixKey}`,
        20,
        yPosition,
      );
      yPosition += 15;

      // Exames
      if (partner.exams.length > 0) {
        pdf.setFontSize(12);
        pdf.text(`EXAMES (${partner.exams.length})`, 20, yPosition);
        yPosition += 10;

        // Cabeçalho da tabela
        pdf.setFontSize(8);
        pdf.text("Código", 20, yPosition);
        pdf.text("Nome", 35, yPosition);
        pdf.text("Descrição", 80, yPosition);
        pdf.text("CL Popular", 140, yPosition);
        pdf.text("Particular", 170, yPosition);
        yPosition += 5;

        // Linha separadora
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 5;

        // Dados dos exames
        partner.exams.forEach((exam) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.text(exam.code || "", 20, yPosition);
          pdf.text(exam.name || "", 35, yPosition);
          pdf.text((exam.description || "-").substring(0, 20), 80, yPosition);
          pdf.text(formatPrice(exam.popularPriceInCents), 140, yPosition);
          pdf.text(formatPrice(exam.particularPriceInCents), 170, yPosition);
          yPosition += 6;
        });
      }

      // Baixar o PDF
      pdf.save(
        `parceiro-${partner.companyName.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPdf}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
};

export default ExportPartnerPdfButton;
