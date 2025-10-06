"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  GraduationCap,
  Award,
} from "lucide-react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import { getSpecialtyLabel } from "../_constants";
import { getAvailability } from "../_helpers/availability";

interface ViewDoctorDialogProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const ViewDoctorDialog = ({ doctor }: ViewDoctorDialogProps) => {
  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");
  const availability = getAvailability(doctor);

  // Funções auxiliares para formatação
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const formatBirthDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-xl">{doctor.name}</DialogTitle>
            <DialogDescription className="text-base">
              {getSpecialtyLabel(doctor.specialty)}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações de Contato */}
        {(doctor.email || doctor.phoneNumber) && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {doctor.email && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.email}
                    </p>
                  </div>
                </div>
              )}
              {doctor.phoneNumber && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-muted-foreground text-sm">
                      {formatPhoneNumber(doctor.phoneNumber)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações Profissionais */}
        {(doctor.crmNumber || doctor.rqe || doctor.cro) && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <GraduationCap className="h-5 w-5" />
              Registros Profissionais
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {doctor.crmNumber && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <GraduationCap className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">CRM</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.crmNumber}
                    </p>
                  </div>
                </div>
              )}
              {doctor.rqe && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <Award className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">RQE</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.rqe}
                    </p>
                  </div>
                </div>
              )}
              {doctor.cro && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">CRO</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.cro}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações Pessoais */}
        {(doctor.cpf || doctor.rg || doctor.birthDate || doctor.address) && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {doctor.cpf && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <User className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">CPF</p>
                    <p className="text-muted-foreground text-sm">
                      {formatCPF(doctor.cpf)}
                    </p>
                  </div>
                </div>
              )}
              {doctor.rg && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <User className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">RG</p>
                    <p className="text-muted-foreground text-sm">{doctor.rg}</p>
                  </div>
                </div>
              )}
              {doctor.birthDate && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                  <CalendarIcon className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Data de Nascimento</p>
                    <p className="text-muted-foreground text-sm">
                      {formatBirthDate(doctor.birthDate)}
                    </p>
                  </div>
                </div>
              )}
              {doctor.address && (
                <div className="bg-muted/50 flex items-start gap-2 rounded-lg border p-3 md:col-span-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações de Atendimento */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <ClockIcon className="h-5 w-5" />
            Informações de Atendimento
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
              <CalendarIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Dias de Atendimento</p>
                <p className="text-muted-foreground text-sm">
                  {availability.from.format("dddd")} a{" "}
                  {availability.to.format("dddd")}
                </p>
              </div>
            </div>
            <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
              <ClockIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Horário de Atendimento</p>
                <p className="text-muted-foreground text-sm">
                  {availability.from.format("HH:mm")} às{" "}
                  {availability.to.format("HH:mm")}
                </p>
              </div>
            </div>
            <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
              <DollarSignIcon className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Valor da Consulta</p>
                <p className="text-muted-foreground text-sm">
                  {formatCurrencyInCents(doctor.appointmentPriceInCents)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default ViewDoctorDialog;
