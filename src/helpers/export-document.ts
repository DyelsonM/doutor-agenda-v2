import jsPDF from "jspdf";

export interface ExportDocumentData {
  document: {
    id: string;
    type: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date | null;
  };
  patient: {
    name: string;
    email: string;
    phoneNumber: string;
    sex: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
  clinic: {
    name: string;
  };
  appointment: {
    date: Date;
  } | null;
}

export const exportToPDF = (data: ExportDocumentData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Configurações de fonte
  doc.setFont("helvetica");

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.document.title, margin, yPosition);
  yPosition += 10;

  // Informações da clínica
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.clinic.name, margin, yPosition);
  yPosition += 5;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Informações do paciente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES DO PACIENTE", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.patient.name}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${data.patient.email}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Telefone: ${data.patient.phoneNumber}`, margin, yPosition);
  yPosition += 5;
  doc.text(
    `Sexo: ${data.patient.sex === "male" ? "Masculino" : "Feminino"}`,
    margin,
    yPosition,
  );
  yPosition += 10;

  // Informações do médico
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES DO MÉDICO", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.doctor.name}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Especialidade: ${data.doctor.specialty}`, margin, yPosition);
  yPosition += 10;

  // Informações da consulta (se disponível)
  if (data.appointment) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMAÇÕES DA CONSULTA", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const appointmentDate = new Date(data.appointment.date);
    doc.text(
      `Data: ${appointmentDate.toLocaleDateString("pt-BR")}`,
      margin,
      yPosition,
    );
    yPosition += 5;
    doc.text(
      `Horário: ${appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      margin,
      yPosition,
    );
    yPosition += 10;
  }

  // Conteúdo do documento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CONTEÚDO DO DOCUMENTO", margin, yPosition);
  yPosition += 10;

  // Processar o conteúdo do documento
  const content = data.document.content;
  const lines = content.split("\n");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  for (const line of lines) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }

    // Processar linhas longas
    const splitLines = doc.splitTextToSize(line, contentWidth);

    for (const splitLine of splitLines) {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(splitLine, margin, yPosition);
      yPosition += 5;
    }

    yPosition += 2; // Espaçamento entre linhas
  }

  // Rodapé com data de criação
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const createdAt = new Date(data.document.createdAt);
  doc.text(
    `Documento criado em: ${createdAt.toLocaleString("pt-BR")}`,
    margin,
    footerY,
  );

  // Download do PDF
  const filename = `${data.document.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
};

export const exportToText = (data: ExportDocumentData): void => {
  let content = "";

  content += `${data.document.title}\n`;
  content += `${data.clinic.name}\n`;
  content += "=".repeat(50) + "\n\n";

  content += "INFORMAÇÕES DO PACIENTE\n";
  content += `Nome: ${data.patient.name}\n`;
  content += `Email: ${data.patient.email}\n`;
  content += `Telefone: ${data.patient.phoneNumber}\n`;
  content += `Sexo: ${data.patient.sex === "male" ? "Masculino" : "Feminino"}\n\n`;

  content += "INFORMAÇÕES DO MÉDICO\n";
  content += `Nome: ${data.doctor.name}\n`;
  content += `Especialidade: ${data.doctor.specialty}\n\n`;

  if (data.appointment) {
    content += "INFORMAÇÕES DA CONSULTA\n";
    const appointmentDate = new Date(data.appointment.date);
    content += `Data: ${appointmentDate.toLocaleDateString("pt-BR")}\n`;
    content += `Horário: ${appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\n`;
  }

  content += "CONTEÚDO DO DOCUMENTO\n";
  content += "-".repeat(30) + "\n";
  content += data.document.content + "\n\n";

  const createdAt = new Date(data.document.createdAt);
  content += `Documento criado em: ${createdAt.toLocaleString("pt-BR")}\n`;

  // Criar e baixar arquivo de texto
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.document.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
