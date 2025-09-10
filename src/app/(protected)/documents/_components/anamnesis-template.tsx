"use client";

import { FileText, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UpsertDocumentForm } from "./upsert-document-form";

type Patient = {
  id: string;
  name: string;
};

type Doctor = {
  id: string;
  name: string;
};

interface AnamnesisTemplateProps {
  patients: Patient[];
  doctors: Doctor[];
}

const anamnesisTemplates = [
  {
    id: "basic",
    title: "Anamnese Básica",
    description: "Template padrão para anamnese geral",
    content: `IDENTIFICAÇÃO DO PACIENTE
Nome: [Nome do Paciente]
Idade: [Idade]
Sexo: [Sexo]
Data de Nascimento: [Data]
Profissão: [Profissão]

MOTIVO DA CONSULTA
[Descrever o motivo da consulta]

HISTÓRIA DA DOENÇA ATUAL
[Descrever detalhadamente os sintomas, início, evolução, fatores que melhoram ou pioram]

ANTECEDENTES PESSOAIS
- Doenças anteriores: [Listar]
- Cirurgias: [Listar]
- Alergias: [Listar]
- Medicamentos em uso: [Listar]
- Hábitos: [Tabagismo, etilismo, exercícios físicos]

ANTECEDENTES FAMILIARES
- Doenças hereditárias: [Listar]
- Causa mortis dos pais: [Se aplicável]

EXAME FÍSICO
- Estado geral: [Bom/Regular/Ruim]
- Sinais vitais: [PA, FC, FR, T]
- Exame físico específico: [Descrever achados]

HIPÓTESE DIAGNÓSTICA
[Diagnóstico provável]

PLANO TERAPÊUTICO
[Tratamento proposto]

ORIENTAÇÕES
[Orientações gerais ao paciente]`,
  },
  {
    id: "cardiovascular",
    title: "Anamnese Cardiovascular",
    description: "Template específico para avaliação cardiovascular",
    content: `IDENTIFICAÇÃO DO PACIENTE
Nome: [Nome do Paciente]
Idade: [Idade]
Sexo: [Sexo]

MOTIVO DA CONSULTA
[Descrever o motivo da consulta]

HISTÓRIA DA DOENÇA ATUAL
- Dor torácica: [Características, localização, irradiação, fatores desencadeantes]
- Dispneia: [Grau, quando ocorre, fatores que melhoram/pioram]
- Palpitações: [Frequência, características]
- Síncope/Pré-síncope: [Episódios, circunstâncias]
- Edema: [Localização, grau, horário de piora]

ANTECEDENTES CARDIOVASCULARES
- Hipertensão arterial: [Tempo de diagnóstico, controle]
- Diabetes mellitus: [Tempo de diagnóstico, controle]
- Dislipidemia: [Tempo de diagnóstico, controle]
- Infarto do miocárdio: [Data, localização]
- AVC: [Data, sequelas]
- Cirurgias cardíacas: [Tipo, data]

FATORES DE RISCO
- Tabagismo: [Quantidade, tempo de cessação]
- Etilismo: [Quantidade, frequência]
- Sedentarismo: [Nível de atividade física]
- Estresse: [Nível, fatores estressores]

EXAME FÍSICO CARDIOVASCULAR
- Pressão arterial: [Valores]
- Frequência cardíaca: [BPM, ritmo]
- Ausculta cardíaca: [Sopros, bulhas]
- Pulso: [Características]
- Edema: [Presença, localização, grau]

EXAMES COMPLEMENTARES
- ECG: [Resultado]
- Ecocardiograma: [Resultado]
- Teste ergométrico: [Resultado]
- Outros: [Listar]

HIPÓTESE DIAGNÓSTICA
[Diagnóstico provável]

PLANO TERAPÊUTICO
[Tratamento proposto]

ORIENTAÇÕES
[Orientações específicas para o paciente]`,
  },
  {
    id: "respiratory",
    title: "Anamnese Respiratória",
    description: "Template específico para avaliação respiratória",
    content: `IDENTIFICAÇÃO DO PACIENTE
Nome: [Nome do Paciente]
Idade: [Idade]
Sexo: [Sexo]

MOTIVO DA CONSULTA
[Descrever o motivo da consulta]

HISTÓRIA DA DOENÇA ATUAL
- Tosse: [Características, horário, fatores desencadeantes]
- Expectoração: [Características, quantidade, cor]
- Dispneia: [Grau, quando ocorre, fatores que melhoram/pioram]
- Dor torácica: [Características, localização]
- Hemoptise: [Quantidade, frequência]
- Sibilância: [Frequência, fatores desencadeantes]

ANTECEDENTES RESPIRATÓRIOS
- Asma: [Tempo de diagnóstico, controle]
- DPOC: [Tempo de diagnóstico, grau]
- Pneumonia: [Episódios, data]
- Tuberculose: [Tratamento, data]
- Cirurgias torácicas: [Tipo, data]

FATORES DE RISCO
- Tabagismo: [Quantidade, tempo de cessação]
- Exposição ocupacional: [Tipo, tempo]
- Poluição ambiental: [Exposição]
- Infecções respiratórias: [Frequência]

EXAME FÍSICO RESPIRATÓRIO
- Inspeção: [Formato do tórax, uso de musculatura acessória]
- Palpação: [Fremito, expansibilidade]
- Percussão: [Som percussório]
- Ausculta: [Ruídos respiratórios, adventícios]

EXAMES COMPLEMENTARES
- Radiografia de tórax: [Resultado]
- Espirometria: [Resultado]
- Gasometria: [Resultado]
- Outros: [Listar]

HIPÓTESE DIAGNÓSTICA
[Diagnóstico provável]

PLANO TERAPÊUTICO
[Tratamento proposto]

ORIENTAÇÕES
[Orientações específicas para o paciente]`,
  },
];

export function AnamnesisTemplate({
  patients,
  doctors,
}: AnamnesisTemplateProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof anamnesisTemplates)[0] | null
  >(null);

  const handleTemplateSelect = (template: (typeof anamnesisTemplates)[0]) => {
    setSelectedTemplate(template);
    setOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {anamnesisTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] hover:border-blue-200 hover:shadow-lg"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                {template.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="w-full border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Usar Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Criar Anamnese - {selectedTemplate?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <UpsertDocumentForm
              patients={patients}
              doctors={doctors}
              defaultValues={{
                type: "anamnesis" as const,
                title: selectedTemplate.title,
                content: selectedTemplate.content,
              }}
              onSuccess={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
